import re
import json
import yaml
import duckdb
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ═══════════════════════════════════════════════════════════════
# GEMINI — DESCOMENTAR CUANDO TENGAS API KEY
# ═══════════════════════════════════════════════════════════════
import google.generativeai as genai
from src.gemini_client import generar_respuesta_delfos  # ← Versión Gemini

# MOTOR ACTUAL (sin API key)
from src.cluster_engine import get_cluster_suggestions

app = FastAPI(title="Delfos API - Hey Banco")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "havi.duckdb"
CONFIG_PATH = "config.json"
PROMPTS_PATH = "master_prompt.yaml"

def load_resources():
    with open(CONFIG_PATH, 'r') as f:
        config = json.load(f)
    with open(PROMPTS_PATH, 'r', encoding='utf-8') as f:
        prompts = yaml.safe_load(f)
    return config, prompts

config_data, prompts_data = load_resources()

# ═══════════════════════════════════════════════════════════════
# CONFIGURACIÓN GEMINI (comentada — activar cuando tengas API key)
# ═══════════════════════════════════════════════════════════════
try:
     genai.configure(api_key=config_data['gemini']['api_key'])
     model_gemini = genai.GenerativeModel(config_data['gemini'].get('model', 'gemma-3-1b-it'))
     print("✅ Gemini configurado correctamente")
except Exception as e:
     print(f"⚠️  Advertencia: No se pudo configurar Gemini: {e}")
     model_gemini = None

def query_db(sql: str, params=None):
    con = duckdb.connect(DB_PATH)
    df = con.execute(sql, params or []).fetchdf()
    con.close()
    return df

def r(x):
    return round(float(x), 2)

def limpiar_texto(texto):
    if not texto or texto == "None":
        return ""
    texto = re.sub(r'\s+', ' ', texto)
    return texto.strip()

def init_app_tables():
    con = duckdb.connect(DB_PATH)

    con.execute("""
        CREATE TABLE IF NOT EXISTS recomendaciones_cache (
            user_id VARCHAR PRIMARY KEY,
            cluster_id INTEGER,
            perfil VARCHAR,
            recommendation_json VARCHAR,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    con.close()

init_app_tables()


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS BASE
# ═══════════════════════════════════════════════════════════════

@app.get("/")
def home():
    # Verificamos si el modelo existe para dar el mensaje correcto
    status_ia = "ACTIVO (Gemini)" if model_gemini else "MODO LOCAL (Fallback)"
    return {
        "status": "ok", 
        "message": f"Delfos API funcionando - Motor de IA: {status_ia}"
    }


@app.get("/user/{user_id}/summary")
def user_summary(user_id: str):
    sexo_map = {"H": "Hombre", "M": "Mujer", "SE": "Sin especificar"}

    cliente = query_db("""
        SELECT user_id, edad, sexo, estado, ciudad, nivel_educativo,
               ocupacion, ingreso_mensual_mxn, antiguedad_dias, es_hey_pro,
               nomina_domiciliada, score_buro, dias_desde_ultimo_login,
               satisfaccion_1_10, num_productos_activos, patron_uso_atipico
        FROM clientes WHERE user_id = ?
    """, [user_id]).fillna(0)

    if cliente.empty:
        return {"error": "Usuario no encontrado", "user_id": user_id}

    productos = query_db("""
        SELECT
            COUNT(*) AS total_productos,
            COALESCE(SUM(CASE WHEN tipo_producto IN ('cuenta_debito','cuenta_negocios') THEN saldo_actual ELSE 0 END), 0) AS dinero_disponible,
            COALESCE(SUM(CASE WHEN tipo_producto = 'inversion_hey' THEN saldo_actual ELSE 0 END), 0) AS dinero_invertido,
            COALESCE(SUM(CASE WHEN tipo_producto IN ('tarjeta_credito_hey','tarjeta_credito_garantizada','tarjeta_credito_negocios','credito_personal','credito_auto','credito_nomina') THEN saldo_actual ELSE 0 END), 0) AS deuda_credito,
            COALESCE(SUM(CASE WHEN tipo_producto LIKE 'seguro_%' THEN 1 ELSE 0 END), 0) AS total_seguros,
            COALESCE(SUM(limite_credito), 0) AS limite_credito_total
        FROM productos WHERE user_id = ?
    """, [user_id]).fillna(0)

    transacciones = query_db("""
        SELECT
            COUNT(*) AS total_transacciones,
            COALESCE(SUM(monto), 0) AS gasto_total,
            COALESCE(AVG(monto), 0) AS ticket_promedio,
            COUNT(DISTINCT fecha_hora::DATE) AS racha_dias_uso,
            COALESCE(SUM(CASE WHEN estatus = 'no_procesada' THEN 1 ELSE 0 END), 0) AS transacciones_fallidas,
            COALESCE(SUM(CASE WHEN es_internacional = TRUE THEN 1 ELSE 0 END), 0) AS transacciones_internacionales,
            COALESCE(SUM(cashback_generado), 0) AS cashback_total
        FROM transacciones WHERE user_id = ?
    """, [user_id]).fillna(0)

    categoria_top = query_db("""
        SELECT categoria_mcc, SUM(monto) AS total
        FROM transacciones WHERE user_id = ?
        GROUP BY categoria_mcc ORDER BY total DESC LIMIT 1
    """, [user_id]).fillna(0)

    tipos_producto = query_db("""
        SELECT tipo_producto, COUNT(*) AS cantidad
        FROM productos WHERE user_id = ? GROUP BY tipo_producto
    """, [user_id])

    conversaciones_df = query_db("""
        SELECT input FROM conversaciones WHERE user_id = ? LIMIT 5
    """, [user_id])

    historial_limpio = [limpiar_texto(row['input']) for _, row in conversaciones_df.iterrows()]

    row_c = cliente.iloc[0]
    row_p = productos.iloc[0]
    row_t = transacciones.iloc[0]

    tipos_producto_dict = {row["tipo_producto"]: int(row["cantidad"]) for _, row in tipos_producto.iterrows()}
    limite_credito_total = r(row_p["limite_credito_total"])
    deuda_credito = r(row_p["deuda_credito"])
    utilizacion_credito = r(deuda_credito / limite_credito_total) if limite_credito_total > 0 else 0

    df_cluster = query_db("SELECT cluster_id FROM segmentos_clientes WHERE user_id = ?", [user_id])
    cluster_id = int(df_cluster.iloc[0]['cluster_id']) if not df_cluster.empty else -1

    desglose_cats = query_db("""
        SELECT categoria_mcc, SUM(monto) as total 
        FROM transacciones WHERE user_id = ? 
        GROUP BY categoria_mcc
    """, [user_id]).to_dict(orient="records")


    desglose_df = query_db("""
        SELECT categoria_mcc, ROUND(SUM(monto), 2) AS total
        FROM transacciones WHERE user_id = ?
        GROUP BY categoria_mcc
    """, [user_id])
    desglose_dict = desglose_df.set_index('categoria_mcc')['total'].to_dict()

    return {
        "user_id": user_id,
        "cluster_id": cluster_id,
        "cliente": {
            "edad": int(row_c["edad"]),
            "sexo": sexo_map.get(row_c["sexo"], "Desconocido"),
            "ubicacion": f"{row_c['ciudad']}, {row_c['estado']}",
            "nivel_educativo": row_c["nivel_educativo"],
            "ocupacion": row_c["ocupacion"],
            "ingreso_mensual_mxn": r(row_c["ingreso_mensual_mxn"]),
            "antiguedad_dias": int(row_c["antiguedad_dias"]),
            "es_hey_pro": bool(row_c["es_hey_pro"]),
            "nomina_domiciliada": bool(row_c["nomina_domiciliada"]),
            "score_buro": int(row_c["score_buro"]),
            "dias_desde_ultimo_login": int(row_c["dias_desde_ultimo_login"]),
            "satisfaccion_1_10": int(row_c["satisfaccion_1_10"]),
            "num_productos_activos": int(row_c["num_productos_activos"]),
            "patron_uso_atipico": bool(row_c["patron_uso_atipico"])
        },
        "productos": {
            "total_productos": int(row_p["total_productos"]),
            "tipos_producto": tipos_producto_dict,
            "dinero_disponible": r(row_p["dinero_disponible"]),
            "dinero_invertido": r(row_p["dinero_invertido"]),
            "deuda_credito": deuda_credito,
            "limite_credito_total": limite_credito_total,
            "utilizacion_credito": utilizacion_credito,
            "total_seguros": int(row_p["total_seguros"])
        },
        "transacciones": {
            "total_transacciones": int(row_t["total_transacciones"]),
            "gasto_total": r(row_t["gasto_total"]),
            "ticket_promedio": r(row_t["ticket_promedio"]),
            "racha_dias_uso": int(row_t["racha_dias_uso"]),
            "transacciones_fallidas": int(row_t["transacciones_fallidas"]),
            "transacciones_internacionales": int(row_t["transacciones_internacionales"]),
            "cashback_total": r(row_t["cashback_total"]),
            "categoria_top": categoria_top.iloc[0]["categoria_mcc"] if not categoria_top.empty else None,
            "desglose": desglose_dict
        },
        "contexto_conversacion": {
            "historial_previo": historial_limpio
        }
    }

def get_user_history(user_id: str, limit: int = 3):
    """
    Extrae las últimas N interacciones del usuario con el bot anterior,
    ordenadas correctamente por tiempo (más recientes primero).
    """

    try:
        df_hist = query_db("""
            SELECT input, output, date
            FROM conversaciones 
            WHERE user_id = ?
            ORDER BY date DESC
            LIMIT ?
        """, [user_id, limit])

        if df_hist is None or df_hist.empty:
            return ""

        df_hist = df_hist.sort_values("date", ascending=True)

        history_lines = []

        for _, row in df_hist.iterrows():
            user_msg = str(row.get("input", "")).strip()
            bot_msg = str(row.get("output", "")).strip()

            # Evitar ruido vacío
            if not user_msg and not bot_msg:
                continue

            history_lines.append(f"Usuario: {user_msg}\nAsistente: {bot_msg}")

        return "\n---\n".join(history_lines)

    except Exception as e:
        print(f"Error recuperando historial: {e}")
        return ""



# ═══════════════════════════════════════════════════════════════
# SUGERENCIAS (CARRUSEL) — Motor local + LLM futuro comentado
# ═══════════════════════════════════════════════════════════════

# Cache simple en memoria para no generar la recomendación varias veces
recommendations_cache = {}

@app.get("/user/{user_id}/suggestions")
def user_suggestions(user_id: str):
    summary = user_summary(user_id)

    if "error" in summary:
        return summary

    cluster_id = summary.get("cluster_id", -1)

    perfil_nombre = {
        0: "Perfil Premium (Ingresos Altos)",
        1: "Gastador Frecuente",
        2: "Ahorrador Conservador",
        3: "Al Límite (Riesgo de Deuda)"
    }.get(cluster_id, "Usuario Estándar")

    # 1. Revisar si ya existe en DuckDB
    cached = query_db("""
        SELECT recommendation_json
        FROM recomendaciones_cache
        WHERE user_id = ?
    """, [user_id])

    if not cached.empty:
        recommendation = json.loads(cached.iloc[0]["recommendation_json"])

        return {
            "user_id": user_id,
            "cluster_id": cluster_id,
            "perfil": perfil_nombre,
            "recommendation": recommendation,
            "cached": True
        }

    # 2. Si no existe, generar UNA recomendación
    prompt = f"""
    Eres un asesor financiero digital de Hey Banco.

    Genera UNA sola recomendación personalizada para este usuario.

    Perfil del usuario:
    {perfil_nombre}

    Datos del usuario:
    {json.dumps(summary, ensure_ascii=False)}

    La recomendación debe ser breve, útil y accionable.

    Responde únicamente en JSON válido con esta estructura:
    {{
      "titulo": "",
      "tipo": "inversión | ahorro | crédito | seguro",
      "descripcion": "",
      "accion_recomendada": "",
      "razon": ""
    }}
    """

    try:
        if model_gemini is None:
            recommendation = {
                "titulo": "Mejora tu estabilidad financiera",
                "tipo": "ahorro",
                "descripcion": f"Según tu perfil: {perfil_nombre}, conviene fortalecer tu control de gastos y separar dinero automáticamente.",
                "accion_recomendada": "Aparta entre 10% y 15% de tu ingreso mensual en una meta de ahorro.",
                "razon": "Esto reduce presión financiera y crea un fondo disponible para imprevistos."
            }
        else:
            response = model_gemini.generate_content(prompt)
            texto = response.text.strip()
            texto = texto.replace("```json", "").replace("```", "").strip()
            recommendation = json.loads(texto)

        # 3. Guardar en DuckDB para no volver a llamar al modelo
        con = duckdb.connect(DB_PATH)

        con.execute("""
            INSERT INTO recomendaciones_cache 
            (user_id, cluster_id, perfil, recommendation_json)
            VALUES (?, ?, ?, ?)
        """, [
            user_id,
            cluster_id,
            perfil_nombre,
            json.dumps(recommendation, ensure_ascii=False)
        ])

        con.close()

        return {
            "user_id": user_id,
            "cluster_id": cluster_id,
            "perfil": perfil_nombre,
            "recommendation": recommendation,
            "cached": False
        }

    except Exception as e:
        return {
            "user_id": user_id,
            "cluster_id": cluster_id,
            "perfil": perfil_nombre,
            "recommendation": {
                "titulo": "Recomendación no disponible",
                "tipo": "general",
                "descripcion": "No se pudo generar la recomendación.",
                "accion_recomendada": "Intenta más tarde.",
                "razon": str(e)
            },
            "cached": False
        }


# ═══════════════════════════════════════════════════════════════
# CHAT — Usa motor con lazy import (no crashea si falta API key)
# ═══════════════════════════════════════════════════════════════

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    data = user_summary(req.user_id)
    if "error" in data:
        return data
    historial = get_user_history(req.user_id)
    try:
        respuesta = generar_respuesta_delfos(
            model=model_gemini,  # Por ahora, model_gemini es None, pero la función maneja eso internamente
            prompts_data=prompts_data,
            user_data=data,
            user_message=req.message,
            history = historial
        )
        return {"user_id": req.user_id, "response": respuesta}
    except Exception as e:
        return {"error": f"Falla en el motor de IA: {str(e)}"}


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS AUXILIARES PARA EL DASHBOARD
# ═══════════════════════════════════════════════════════════════

@app.get("/user/{user_id}/stats")
def user_stats(user_id: str):
    productos = query_db("""
        SELECT 
            COALESCE(SUM(CASE WHEN tipo_producto IN ('cuenta_debito','cuenta_negocios') THEN saldo_actual ELSE 0 END), 0) AS balance,
            COALESCE(SUM(CASE WHEN tipo_producto = 'inversion_hey' THEN saldo_actual ELSE 0 END), 0) AS investments
        FROM productos WHERE user_id = ?
    """, [user_id]).fillna(0)

    tx = query_db("""
        SELECT COALESCE(SUM(monto), 0) AS monthly_spend
        FROM transacciones
        WHERE user_id = ?
        AND fecha_hora >= CURRENT_DATE - INTERVAL '30 days'
    """, [user_id]).fillna(0)

    row_p = productos.iloc[0] if not productos.empty else None
    row_t = tx.iloc[0] if not tx.empty else None

    return {
        "balance": r(row_p["balance"]) if row_p is not None else 0,
        "balanceDelta": "+$340 este mes",
        "balancePositive": True,
        "monthlySpend": r(row_t["monthly_spend"]) if row_t is not None else 0,
        "spendDelta": "+12% vs anterior",
        "spendPositive": False,
        "investments": r(row_p["investments"]) if row_p is not None else 0,
        "investDelta": "+11.2% anual",
        "investPositive": True
    }


@app.get("/user/{user_id}/spending")
def user_spending(user_id: str):
    chart = query_db("""
        SELECT 
            CASE EXTRACT(MONTH FROM fecha_hora)
                WHEN 1 THEN 'Ene' WHEN 2 THEN 'Feb' WHEN 3 THEN 'Mar'
                WHEN 4 THEN 'Abr' WHEN 5 THEN 'May' WHEN 6 THEN 'Jun'
                WHEN 7 THEN 'Jul' WHEN 8 THEN 'Ago' WHEN 9 THEN 'Sep'
                WHEN 10 THEN 'Oct' WHEN 11 THEN 'Nov' ELSE 'Dic'
            END AS mes,
            COALESCE(SUM(monto), 0) AS gasto
        FROM transacciones
        WHERE user_id = ?
        AND fecha_hora >= CURRENT_DATE - INTERVAL '5 months'
        GROUP BY EXTRACT(MONTH FROM fecha_hora), EXTRACT(YEAR FROM fecha_hora)
        ORDER BY EXTRACT(YEAR FROM fecha_hora), EXTRACT(MONTH FROM fecha_hora)
        LIMIT 5
    """, [user_id]).fillna(0)

    if chart.empty:
        chart_data = [
            {"mes": "Ene", "gasto": 8200}, {"mes": "Feb", "gasto": 9100},
            {"mes": "Mar", "gasto": 7800}, {"mes": "Abr", "gasto": 10500},
            {"mes": "May", "gasto": 12800}
        ]
    else:
        chart_data = [{"mes": row["mes"], "gasto": r(row["gasto"])} for _, row in chart.iterrows()]

    cats = query_db("""
        SELECT 
            categoria_mcc AS name,
            SUM(monto) AS amount,
            COUNT(*) AS count
        FROM transacciones
        WHERE user_id = ?
        AND fecha_hora >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY categoria_mcc
        ORDER BY amount DESC
        LIMIT 5
    """, [user_id]).fillna(0)

    icon_map = {
        "restaurantes": "🍽️", "supermercado": "🛒", "transporte": "🚗",
        "entretenimiento": "🎬", "salud": "💊", "educacion": "📚",
        "tecnologia": "💻", "hogar": "🏠", "viajes": "✈️", "otros": "📦"
    }

    if cats.empty:
        categories = [
            {"name": "Restaurantes", "icon": "🍽️", "amount": 3200, "sub": "+8% vs mes pasado", "trend": "up"},
            {"name": "Transporte", "icon": "🚗", "amount": 2100, "sub": "-5% vs mes pasado", "trend": "down"},
            {"name": "Supermercado", "icon": "🛒", "amount": 4500, "sub": "+2% vs mes pasado", "trend": "neutral"},
        ]
    else:
        categories = []
        for _, row in cats.iterrows():
            name = row["name"] or "otros"
            categories.append({
                "name": name.capitalize(),
                "icon": icon_map.get(name.lower(), "📦"),
                "amount": r(row["amount"]),
                "sub": f"{int(row['count'])} transacciones",
                "trend": "neutral"
            })

    return {"chart": chart_data, "categories": categories}


@app.get("/user/{user_id}/goals")
def user_goals(user_id: str):
    return {
        "goals": [
            {"id": 1, "name": "MacBook Pro", "icon": "💻", "current": 25000, "target": 45000, "color": "#323232"},
            {"id": 2, "name": "Viaje a Europa", "icon": "✈️", "current": 12000, "target": 80000, "color": "#546436"},
            {"id": 3, "name": "Fondo de emergencia", "icon": "🛡️", "current": 15000, "target": 30000, "color": "#964831"}
        ]
    }

@app.get("/user/{user_id}/financial_details")
def get_financial_details(user_id: str):
    filtro_fecha = "fecha_hora >= (SELECT MAX(fecha_hora) FROM transacciones) - INTERVAL '3 months'"

    # 1. Consulta de Categorías (Para la gráfica de dona)
    query_cat = f"""
        SELECT 
            categoria_mcc AS categoria, 
            ROUND(SUM(monto), 2) AS total_monto,
            COUNT(*) AS conteo
        FROM transacciones
        WHERE user_id = ? AND {filtro_fecha}
        GROUP BY categoria_mcc
        ORDER BY total_monto DESC
    """
    
    # 2. Consulta de Top Comercio POR Categoría
    # Usamos ROW_NUMBER para asegurar que traemos al menos el #1 de cada categoría
    query_merchants = f"""
        WITH ComerciosAgrupados AS (
            SELECT 
                categoria_mcc AS categoria,
                COALESCE(NULLIF(NULLIF(comercio_nombre, 'NA'), ''), descripcion_libre) AS comercio,
                SUM(monto) AS monto_comercio,
                ROW_NUMBER() OVER(PARTITION BY categoria_mcc ORDER BY SUM(monto) DESC) as ranking
            FROM transacciones
            WHERE user_id = ? AND {filtro_fecha}
            GROUP BY categoria_mcc, comercio
        )
        SELECT 
            categoria,
            comercio,
            ROUND(monto_comercio, 2) AS total_monto
        FROM ComerciosAgrupados
        WHERE ranking = 1  -- Traemos el top 1 de cada categoría detectada
        ORDER BY total_monto DESC
    """
    
    df_cat = query_db(query_cat, [user_id])
    df_merchants = query_db(query_merchants, [user_id])
    
    return {
        "user_id": user_id,
        "periodo": "Ultimos 3 meses",
        "resumen_categorias": df_cat.to_dict(orient="records"),
        "top_comercios_por_categoria": df_merchants.to_dict(orient="records")
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)