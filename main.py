import re
import json
import yaml
import duckdb
import uvicorn
# import google.generativeai as genai
from src.generative_delfos import generar_respuesta_delfos
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# from src.gemini_client import generar_respuesta_delfos
from src.cluster_engine import get_cluster_suggestions

app = FastAPI(title="Delfos API - Hey Banco")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "havi.duckdb"
CONFIG_PATH = "config.json"
PROMPTS_PATH = "prompts.yaml"

def load_resources():
    with open(CONFIG_PATH, 'r') as f:
        config = json.load(f)
    with open(PROMPTS_PATH, 'r', encoding='utf-8') as f:
        prompts = yaml.safe_load(f)
    return config, prompts

config_data, prompts_data = load_resources()

# genai.configure(api_key=config_data['gemini']['api_key'])
# model_gemini = genai.GenerativeModel(config_data['gemini'].get('model', 'gemini-2.5-flash'))

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
    import re
    texto = re.sub(r'\s+', ' ', texto)
    return texto.strip()

@app.get("/")
def home():
    return {"status": "ok", "message": "Delfos API funcionando"}

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
            COUNT(DISTINCT DATE(fecha_hora)) AS racha_dias_uso,
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

    return {
        "user_id": user_id,
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
            "categoria_top": categoria_top.iloc[0]["categoria_mcc"] if not categoria_top.empty else None
        },
        "contexto_conversacion": {
            "historial_previo": historial_limpio
        }
    }

@app.get("/user/{user_id}/suggestions")
def user_suggestions(user_id: str):
    summary = user_summary(user_id)
    if "error" in summary:
        return summary
    suggestions = get_cluster_suggestions(summary)
    return {"user_id": user_id, "suggestions": suggestions}

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    data = user_summary(req.user_id)
    if "error" in data:
        return data
    try:
        respuesta = generar_respuesta_delfos(
            user_data=data,
            user_message=req.message
        )
        return {"user_id": req.user_id, "response": respuesta}
    except Exception as e:
        return {"error": f"Falla en el motor de IA: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)