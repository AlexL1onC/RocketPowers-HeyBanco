import google.generativeai as genai

def generar_respuesta_delfos(model, prompts_data, user_data, user_message):
    prompt_maestro = prompts_data['delfos_config']['system_prompt']

    contexto_usuario = f"""
    - Ocupación: {user_data['perfil']['ocupacion']}
    - Score Buró: {user_data['perfil']['score']}
    - Saldo Disponible: ${user_data['finanzas']['disponible']} MXN
    - Deuda Actual: ${user_data['finanzas']['deuda']} MXN
    - Utilización de Crédito: {user_data['finanzas']['utilizacion'] * 100:.0f}%
    """

    prompt_final = f"{prompt_maestro}\n\nCONTEXTO ACTUAL:\n{contexto_usuario}\n\nPREGUNTA: {user_message}"

    response = model.generate_content(prompt_final)
    return response.text