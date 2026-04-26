import os
import re

# Lazy import de Gemini — solo se intenta cuando se llama a la función
_gemini_client = None
_gemini_available = None

def _check_gemini():
    """
    Verifica si Gemini está disponible. 
    Retorna (cliente, disponible) y muestra advertencia si no lo está.
    """
    global _gemini_client, _gemini_available
    
    if _gemini_available is not None:
        return _gemini_client, _gemini_available
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("⚠️  [DELFOS] GEMINI_API_KEY no encontrada. El chat usará respuestas locales.")
        print("   Para activar Gemini: export GEMINI_API_KEY='tu-key' o crea un .env")
        _gemini_available = False
        return None, False
    
    try:
        import google.genai as genai
        client = genai.Client(api_key=api_key)
        _gemini_client = client
        _gemini_available = True
        print("✅ [DELFOS] Gemini activado correctamente")
        return client, True
    except ImportError:
        print("⚠️  [DELFOS] Librería google-genai no instalada. Ejecuta: pip install google-genai")
        print("   El chat usará respuestas locales.")
        _gemini_available = False
        return None, False
    except Exception as e:
        print(f"⚠️  [DELFOS] Error al configurar Gemini: {e}")
        print("   El chat usará respuestas locales.")
        _gemini_available = False
        return None, False


def generar_respuesta_delfos(user_data, user_message):
    """
    Genera respuesta del chatbot. Intenta usar Gemini si está disponible,
    si no, usa respuestas locales inteligentes.
    """
    client, disponible = _check_gemini()
    
    if disponible and client:
        # ═══════════════════════════════════════════════════════════
        # FLUJO GEMINI (activar cuando todo funcione)
        # ═══════════════════════════════════════════════════════════
        # try:
        #     contexto = f"Usuario: {user_data['cliente']['ocupacion']}, "
        #     contexto += f"ingreso ${user_data['cliente']['ingreso_mensual_mxn']}, "
        #     contexto += f"score {user_data['cliente']['score_buro']}. "
        #     
        #     prompt = f"{contexto}\nMensaje del usuario: {user_message}\n"
        #     prompt += "Responde como Delfos, asesor financiero de Hey Banco. Sé breve y útil."
        #     
        #     response = client.models.generate_content(
        #         model="gemini-2-flash",
        #         contents=prompt
        #     )
        #     return response.text
        # except Exception as e:
        #     print(f"⚠️  [DELFOS] Gemini falló: {e}. Usando respuesta local.")
        #     pass
        pass  # Por ahora, cae al fallback local
    
    # ═══════════════════════════════════════════════════════════════
    # FALLBACK LOCAL (sin API key)
    # ═══════════════════════════════════════════════════════════════
    msg_lower = user_message.lower()
    
    # Respuestas inteligentes basadas en palabras clave
    if any(p in msg_lower for p in ["hola", "buenos días", "buenas tardes", "hey"]):
        return f"¡Hola! Soy Delfos. Veo que eres {user_data['cliente']['ocupacion']} con ingresos de ${user_data['cliente']['ingreso_mensual_mxn']:,.0f} MXN. ¿En qué puedo ayudarte hoy?"
    
    if any(p in msg_lower for p in ["ahorro", "ahorrar", "guardar"]):
        disponible = user_data['productos']['dinero_disponible']
        return f"Tienes ${disponible:,.0f} MXN disponibles. ¿Quieres que te sugiera una estrategia de ahorro basada en tu perfil?"
    
    if any(p in msg_lower for p in ["inversión", "invertir", "rendimiento"]):
        invertido = user_data['productos']['dinero_invertido']
        if invertido > 0:
            return f"Actualmente tienes ${invertido:,.0f} MXN invertidos. ¿Te gustaría revisar oportunidades para diversificar?"
        return "No tienes inversiones activas. Con tu perfil, podrías empezar con CETES o un fondo conservador. ¿Te interesa?"
    
    if any(p in msg_lower for p in ["deuda", "crédito", "tarjeta", "pagar"]):
        deuda = user_data['productos']['deuda_credito']
        if deuda > 0:
            return f"Tienes ${deuda:,.0f} MXN en deuda. Tu utilización es del {user_data['productos']['utilizacion_credito']:.0%}. ¿Necesitas un plan de pagos?"
        return "No tienes deuda activa. ¡Excelente manejo financiero! ¿Quieres explorar opciones de crédito con mejores beneficios?"
    
    if any(p in msg_lower for p in ["gasto", "gasté", "cuánto", "mes"]):
        return f"Este mes has gastado ${user_data['transacciones']['gasto_total']:,.0f} MXN en {user_data['transacciones']['total_transacciones']} transacciones. Tu categoría top es {user_data['transacciones']['categoria_top'] or 'varias'}."
    
    if any(p in msg_lower for p in ["score", "buró", "crédito"]):
        return f"Tu score en buró es {user_data['cliente']['score_buro']}. Con ese puntaje, tienes acceso a tasas preferenciales. ¿Quieres saber cómo mejorarlo?"
    
    if any(p in msg_lower for p in ["producto", "cuenta", "abrir"]):
        productos = user_data['productos']['tipos_producto']
        lista = ", ".join(productos.keys()) if productos else "ninguno"
        return f"Tienes estos productos: {lista}. ¿Te interesa explorar alguno nuevo basado en tu perfil {user_data.get('cluster_id', 'general')}?"
    
    # Respuesta genérica pero personalizada
    return f"Entiendo. Como {user_data['cliente']['ocupacion']} con ingreso de ${user_data['cliente']['ingreso_mensual_mxn']:,.0f} MXN, puedo ayudarte con ahorro, inversión o crédito. ¿Qué prefieres explorar?"