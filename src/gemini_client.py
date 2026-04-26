import google.generativeai as genai

def generar_respuesta_delfos(model, prompts_data, user_data, user_message, history=""):
    prompt_maestro = prompts_data['delfos_config']['system_prompt']

    contexto_usuario = f"""
    DATOS DE PERFIL:
    - Ocupación: {user_data['perfil']['ocupacion']}
    - Nivel de Cliente: {"Hey Pro" if user_data['perfil']['es_hey_pro'] else "Tradicional"}
    - Score Buró: {user_data['perfil']['score']}

    SALUD FINANCIERA:
    - Saldo Disponible: ${user_data['finanzas']['disponible']:,} MXN
    - Deuda Total: ${user_data['finanzas']['deuda']:,} MXN
    - Utilización de Línea: {user_data['finanzas']['utilizacion'] * 100:.1f}%
    - Ingresos: ${user_data['finanzas'].get('ingresos', 0):,} MXN
    - Tasa promedio: {user_data['finanzas'].get('tasa_promedio', 0)}%

    COMPORTAMIENTO DE GASTO:
    - Categoría top: {user_data['transacciones']['categoria_top']}
    - Cashback este mes: ${user_data['transacciones']['cashback_total']:,} MXN
"""
    contexto_historial = f"\nINTERACCIONES PREVIAS (HAVI):\n{history}" if history else ""

    prompt_final = (
        f"{prompt_maestro}\n\n"
        f"CONTEXTO ACTUAL:\n{contexto_usuario}\n\n"
        f"{contexto_historial}\n\n"
        f"PREGUNTA: {user_message}"
    )
    response = model.generate_content(prompt_final)
    return response.text