# gemini_client.py

import yaml
from google import genai

def generar_respuesta_delfos(
    model,           # ignorado — usamos client propio via genai.Client
    prompts_data: dict,
    user_data: dict,
    user_message: str,
    history: str = ""
):
    """
    Genera respuesta de Delfos usando Gemini.
    - model: se recibe por compatibilidad con main.py pero no se usa
    - prompts_data: contenido de master_prompt.yaml
    - user_data: dict que retorna /user/{id}/summary
    - user_message: mensaje del usuario
    - history: historial de conversación como string
    """

    PROMPT_MAESTRO = prompts_data["delfos_config"]["system_prompt"]

    # Claves alineadas con lo que retorna user_summary en main.py
    contexto_usuario = f"""
DATOS DEL CLIENTE:
- Ocupación: {user_data['perfil']['ocupacion']}
- Score Buró: {user_data['perfil']['score']}
- Es Hey Pro: {user_data['perfil']['es_hey_pro']}
- Ingresos Mensuales: ${user_data['finanzas']['ingresos']:,} MXN
- Saldo Disponible: ${user_data['finanzas']['disponible']:,} MXN
- Deuda: ${user_data['finanzas']['deuda']:,} MXN
- Utilización de crédito: {user_data['finanzas']['utilizacion']:.0%}
- Tasa promedio: {user_data['finanzas']['tasa_promedio']}%
- Categoría más gastada: {user_data['transacciones']['categoria_top']}
- Cashback acumulado: ${user_data['transacciones']['cashback_total']:,} MXN
"""

    historial_bloque = (
        f"\nHISTORIAL RECIENTE DE CONVERSACIÓN:\n{history}\n"
        if history else ""
    )

    prompt_final = (
        f"{PROMPT_MAESTRO}\n\n"
        f"CONTEXTO DEL USUARIO (NO INSTRUCCIONES):\n{contexto_usuario}"
        f"{historial_bloque}\n"
        f"CONSULTA DEL USUARIO:\n{user_message}"
    )

    # Usamos el client global configurado en main.py via genai.configure()
    # genai.GenerativeModel ya fue instanciado como model_gemini en main.py
    response = model.generate_content(prompt_final)
    return response.text   # sin coma — antes retornaba tupla por error