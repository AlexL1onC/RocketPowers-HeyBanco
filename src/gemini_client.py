# gemini_client.py

import json

import yaml
import google.generativeai as genai

def generar_respuesta_delfos(model, prompts_data, user_data, user_message, history=""):
    prompt_maestro = prompts_data['delfos_config']['system_prompt']
    cliente = user_data.get('cliente', {})
    productos = user_data.get('productos', {})
    tx = user_data.get('transacciones', {})
    desglose = user_data['transacciones'].get('desglose', {})

    contexto_usuario = f"""
    DATOS DE PERFIL:
    - Ocupación: {user_data['cliente']['ocupacion']}
    - Nivel de Cliente: {"Hey Pro" if user_data['cliente']['es_hey_pro'] else "Tradicional"}
    - Score Buró: {user_data['cliente']['score_buro']}

    SALUD FINANCIERA:
    - Saldo Disponible: ${user_data['productos']['dinero_disponible']:,} MXN
    - Deuda Total: ${user_data['productos']['deuda_credito']:,} MXN
    - Utilización de Línea: {user_data['productos']['utilizacion_credito'] * 100:.1f}%
    - Ingresos: ${user_data['cliente'].get('ingreso_mensual_mxn', 0):,} MXN
    - Tasa promedio: {user_data['productos'].get('tasa_promedio', 0)}%

    COMPORTAMIENTO DE GASTO:
    - Categoría top: {user_data['transacciones']['categoria_top']}
    - Cashback este mes: ${user_data['transacciones']['cashback_total']:,} MXN
    
    DESGLOSE DE GASTOS POR CATEGORÍA:
    {json.dumps(desglose, indent=2)}
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