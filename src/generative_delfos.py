# src/generative_delfos.py
import os
import yaml
from google import genai
from dotenv import load_dotenv

load_dotenv()

def cargar_config_ia():
    with open("prompts.yaml", "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

config_ia = cargar_config_ia()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generar_respuesta_delfos(user_data: dict, user_message: str) -> str:
    PROMPT_MAESTRO = config_ia['delfos_config']['system_prompt']
    MODELO = config_ia['delfos_config']['model_name']

    contexto_usuario = f"""
    DATOS DEL CLIENTE:
    - Ocupación: {user_data['cliente']['ocupacion']}
    - Score Buró: {user_data['cliente']['score_buro']}
    - Es Hey Pro: {user_data['cliente']['es_hey_pro']}
    - Saldo Disponible: ${user_data['productos']['dinero_disponible']} MXN
    - Inversiones: ${user_data['productos']['dinero_invertido']} MXN
    - Deuda: ${user_data['productos']['deuda_credito']} MXN
    - Utilización de crédito: {user_data['productos']['utilizacion_credito'] * 100:.0f}%
    - Gasto Total: ${user_data['transacciones']['gasto_total']} MXN
    - Categoría más gastada: {user_data['transacciones']['categoria_top']}
    - Cashback generado: ${user_data['transacciones']['cashback_total']} MXN
    """

    prompt_final = f"{PROMPT_MAESTRO}\n\nCONTEXTO ACTUAL DEL USUARIO:\n{contexto_usuario}\n\nPREGUNTA DEL USUARIO: {user_message}"

    response = client.models.generate_content(
        model=MODELO,
        contents=prompt_final
    )

    return response.text