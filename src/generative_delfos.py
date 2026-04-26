import os
import yaml
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Función para cargar el prompt desde el YAML
def cargar_config_ia():
    with open("src/prompts.yaml", "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

config_ia = cargar_config_ia()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generar_respuesta_delfos(user_data: dict, user_message: str):
    # Extraemos el prompt del diccionario cargado
    PROMPT_MAESTRO = config_ia['delfos_config']['system_prompt']
    MODELO = config_ia['delfos_config']['model_name']

    contexto_usuario = f"""
    DATOS DEL CLIENTE:
    - Ocupación: {user_data['cliente']['ocupacion']}
    - Saldo Disponible: ${user_data['productos']['dinero_disponible']} MXN
    - Inversiones: ${user_data['productos']['dinero_invertido']} MXN
    - Deuda: ${user_data['productos']['deuda_credito']} MXN
    - Gasto Total: ${user_data['transacciones']['gasto_total']} MXN
    - Categoría más gastada: {user_data['transacciones']['categoria_top']}
    """
    
    prompt_final = f"{PROMPT_MAESTRO}\n\nCONTEXTO ACTUAL DEL USUARIO:\n{contexto_usuario}\n\nPREGUNTA DEL USUARIO: {user_message}"
    
    response = client.models.generate_content(
        model=MODELO,
        contents=prompt_final
    )
    
    return response.text