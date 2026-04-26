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
PROMPTS_PATH = "prompts.yaml"

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

    row_c = cliente.iloc[0]
    row_r = resumen.iloc[0]

    return {
        "user_id": user_id,
        "perfil": {
            "ocupacion": row_c["ocupacion"],
            "score": int(row_c["score_buro"]),
            "es_hey_pro": bool(row_c["es_hey_pro"])
        },
        "finanzas": {
            "disponible": r(row_r["disponible"]),
            "deuda": r(row_r["deuda"]),
            "utilizacion": r(row_r["deuda"] / row_r["limite_total"]) if row_r["limite_total"] > 0 else 0
        }
    }

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
            model=model_gemini,
            prompts_data=prompts_data,
            user_data=data,
            user_message=req.message
        )
        return {"user_id": req.user_id, "response": respuesta}
    except Exception as e:
        return {"error": f"Falla en el motor de IA: {str(e)}"}

@app.get("/test/chat")
def test_chat(message: str = "¿Cuál es el estado de mis finanzas?"):
    user_data = {
        "perfil": {"ocupacion": "Freelancer", "score": 680, "es_hey_pro": False},
        "finanzas": {"disponible": 8500.0, "deuda": 12000.0, "utilizacion": 0.80}
    }
    try:
        respuesta = generar_respuesta_delfos(
            model=model_gemini,
            prompts_data=prompts_data,
            user_data=user_data,
            user_message=message
        )
        return {"response": respuesta}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)