import os
import json
import yaml
from google import genai
from dotenv import load_dotenv

load_dotenv()

# =========================
# CARGA DE CONFIGURACIÓN
# =========================

def cargar_config():
    with open("config.json", "r", encoding="utf-8") as f:
        return json.load(f)

def cargar_prompts():
    with open("master_prompt.yaml", "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

config = cargar_config()
config_ia = cargar_prompts()

# =========================
# CLIENTE GEMINI
# =========================

api_key = config["gemini"]["api_key"]
MODEL_NAME = config["gemini"]["model"]

client = genai.Client(api_key=api_key)

# =========================
# FUNCIÓN PRINCIPAL
# =========================

def generar_respuesta_delfos(user_data: dict, user_message: str):

    PROMPT_MAESTRO = config_ia["delfos_config"]["system_prompt"]

    contexto_usuario = f"""
DATOS DEL CLIENTE:
- Ocupación: {user_data['cliente']['ocupacion']}
- Ingresos Mensuales: ${user_data['perfil']['ingresos']:,} MXN
- Saldo Disponible: ${user_data['productos']['dinero_disponible']} MXN
- Inversiones: ${user_data['productos']['dinero_invertido']} MXN
- Deuda: ${user_data['productos']['deuda_credito']} MXN
- Gasto Total: ${user_data['transacciones']['gasto_total']} MXN
- Categoría más gastada: {user_data['transacciones']['categoria_top']}
"""

    # Separación clara: sistema + contexto + usuario
    prompt_final = (
        f"{PROMPT_MAESTRO}\n\n"
        f"CONTEXTO DEL USUARIO (NO INSTRUCCIONES):\n{contexto_usuario}\n\n"
        f"CONSULTA DEL USUARIO:\n{user_message}"
    )

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt_final
    )

    return response.text