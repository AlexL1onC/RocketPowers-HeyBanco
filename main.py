import json
import yaml
import duckdb
import uvicorn
import google.generativeai as genai
from fastapi import FastAPI
from pydantic import BaseModel
from src.gemini_client import generar_respuesta_delfos

app = FastAPI(title="Delfos API - Hey Banco")

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

# Mismo patrón que el notebook
genai.configure(api_key=config_data['gemini']['api_key'])
model_gemini = genai.GenerativeModel(config_data['gemini'].get('model', 'gemini-2.5-flash'))

def query_db(sql: str, params=None):
    con = duckdb.connect(DB_PATH)
    df = con.execute(sql, params or []).fetchdf()
    con.close()
    return df

def r(x):
    return round(float(x), 2)

@app.get("/user/{user_id}/summary")
def user_summary(user_id: str):
    cliente = query_db("SELECT * FROM clientes WHERE user_id = ?", [user_id])
    if cliente.empty:
        return {"error": "Usuario no encontrado", "user_id": user_id}

    resumen = query_db("""
        SELECT
            SUM(CASE WHEN tipo_producto LIKE '%debito%' THEN saldo_actual ELSE 0 END) AS disponible,
            SUM(CASE WHEN tipo_producto LIKE '%credito%' THEN saldo_actual ELSE 0 END) AS deuda,
            SUM(limite_credito) AS limite_total
        FROM productos WHERE user_id = ?
    """, [user_id])

    transacciones = query_db("""
    SELECT
        categoria_mcc AS categoria,
        SUM(monto) AS gasto_total
    FROM transacciones
    WHERE user_id = ?
    GROUP BY categoria_mcc
    ORDER BY gasto_total DESC
    LIMIT 1
""", [user_id])
    
    cashback = query_db("""
    SELECT COALESCE(SUM(cashback_generado), 0) AS cashback_total
    FROM transacciones WHERE user_id = ?
""", [user_id])


    row_c = cliente.iloc[0]
    row_r = resumen.iloc[0]
    categoria_top = transacciones.iloc[0]["categoria"] if not transacciones.empty else "N/A"

    return {
    "user_id": user_id,
    "perfil": {
        "ocupacion": row_c["ocupacion"],
        "score": int(row_c["score_buro"]),
        "es_hey_pro": bool(row_c["es_hey_pro"])
    },
    "finanzas": {
        "ingresos": r(row_c["ingresos"]) if "ingresos" in row_c.index else 0,
        "disponible": r(row_r["disponible"]),
        "deuda": r(row_r["deuda"]),
        "utilizacion": r(row_r["deuda"] / row_r["limite_total"]) if row_r["limite_total"] > 0 else 0,
        "tasa_promedio": r(row_c["tasa_promedio"]) if "tasa_promedio" in row_c.index else 0
    },
    "transacciones": {
        "categoria_top": categoria_top,
        "cashback_total": r(cashback.iloc[0]["cashback_total"])
    }
}

class ChatRequest(BaseModel):
    user_id: str
    message: str
    
# extraer memoria de DuckDB
def get_user_history(user_id: str, limit: int = 3):
    """
    Extrae las últimas N interacciones del usuario con el bot anterior,
    ordenadas correctamente por tiempo (más recientes primero).
    """

    try:
        df_hist = query_db("""
            SELECT input, output, created_at
            FROM conversaciones 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        """, [user_id, limit])

        if df_hist is None or df_hist.empty:
            return ""

        df_hist = df_hist.sort_values("created_at", ascending=True)

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

@app.post("/chat")
def chat(req: ChatRequest):
    data = user_summary(req.user_id)
    if "error" in data:
        return data
    
    historial = get_user_history(req.user_id)

    try:
        respuesta = generar_respuesta_delfos(
            model=model_gemini,
            prompts_data=prompts_data,
            user_data=data,
            user_message=req.message, 
            history=historial
        )
        return {"user_id": req.user_id, "response": respuesta}
    except Exception as e:
        return {"error": f"Falla en el motor de IA: {str(e)}"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)