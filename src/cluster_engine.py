CLUSTER_RULES = [
    {
        "nombre": "ahorrador_cauteloso",
        "condicion": lambda d: d["utilizacion_credito"] < 0.3 and d["dinero_invertido"] == 0,
        "productos": [
            {
                "id": "inv_hey",
                "tipo": "inversion",
                "titulo": "Tu dinero puede trabajar por ti",
                "descripcion": "Tienes saldo disponible sin invertir. Inversión Hey genera rendimientos desde $100.",
                "cta": "Ver rendimientos",
                "color": "#546436",
                "icono": "📈"
            },
            {
                "id": "ahorro_hey",
                "tipo": "ahorro",
                "titulo": "Ahorro automático sin esfuerzo",
                "descripcion": "Redondea cada compra y ahorra sin pensarlo.",
                "cta": "Activar ahorro",
                "color": "#546436",
                "icono": "🪙"
            }
        ]
    },
    {
        "nombre": "alto_endeudamiento",
        "condicion": lambda d: d["utilizacion_credito"] > 0.7,
        "productos": [
            {
                "id": "refi",
                "tipo": "credito",
                "titulo": "Reestructura tu deuda hoy",
                "descripcion": "Tu utilización de crédito está alta. Consolidamos tus créditos en una sola mensualidad menor.",
                "cta": "Simular ahorro",
                "color": "#964831",
                "icono": "⚠️"
            }
        ]
    },
    {
        "nombre": "viajero_internacional",
        "condicion": lambda d: d["transacciones_internacionales"] > 3,
        "productos": [
            {
                "id": "tc_global",
                "tipo": "tarjeta",
                "titulo": "Compra en el extranjero sin comisiones",
                "descripcion": "Detectamos transacciones internacionales. Tu tarjeta Hey no cobra comisión por tipo de cambio.",
                "cta": "Activar beneficio",
                "color": "#00CEE8",
                "icono": "✈️"
            }
        ]
    },
    {
        "nombre": "usuario_frecuente",
        "condicion": lambda d: d["racha_dias_uso"] > 20 and not d["es_hey_pro"],
        "productos": [
            {
                "id": "hey_pro",
                "tipo": "membresia",
                "titulo": "Hey Pro — hecho para usuarios como tú",
                "descripcion": "Usas Hey casi todos los días. Desbloquea cashback mayor, soporte prioritario y más.",
                "cta": "Ver beneficios Pro",
                "color": "#323232",
                "icono": "⭐"
            }
        ]
    },
    {
        "nombre": "sin_seguro",
        "condicion": lambda d: d["total_seguros"] == 0 and d["ingreso_mensual_mxn"] > 15000,
        "productos": [
            {
                "id": "seguro_vida",
                "tipo": "seguro",
                "titulo": "Protege lo que más importa",
                "descripcion": "No tienes ningún seguro activo. Hey Vida desde $99/mes.",
                "cta": "Ver planes",
                "color": "#FBBBD3",
                "icono": "🛡️"
            }
        ]
    },
    {
        "nombre": "cashback_activo",
        "condicion": lambda d: d["gasto_total"] > 5000 and d["cashback_total"] == 0,
        "productos": [
            {
                "id": "cashback",
                "tipo": "tarjeta",
                "titulo": "Estás dejando cashback sobre la mesa",
                "descripcion": "Con tu nivel de gasto podrías recuperar dinero en cada compra. Activa tu tarjeta Hey.",
                "cta": "Activar cashback",
                "color": "#FCEC02",
                "icono": "💰"
            }
        ]
    },
]

DEFAULT_PRODUCTOS = [
    {
        "id": "bienvenida",
        "tipo": "general",
        "titulo": "Explora todo lo que Hey tiene para ti",
        "descripcion": "Inversiones, seguros, créditos y más — todo desde tu app.",
        "cta": "Explorar productos",
        "color": "#323232",
        "icono": "🏦"
    }
]

def get_cluster_suggestions(summary: dict) -> list:
    prod = summary.get("productos", {})
    tx = summary.get("transacciones", {})
    cliente = summary.get("cliente", {})

    datos = {
        "utilizacion_credito": prod.get("utilizacion_credito", 0),
        "dinero_invertido": prod.get("dinero_invertido", 0),
        "total_seguros": prod.get("total_seguros", 0),
        "transacciones_internacionales": tx.get("transacciones_internacionales", 0),
        "racha_dias_uso": tx.get("racha_dias_uso", 0),
        "gasto_total": tx.get("gasto_total", 0),
        "cashback_total": tx.get("cashback_total", 0),
        "es_hey_pro": cliente.get("es_hey_pro", False),
        "ingreso_mensual_mxn": cliente.get("ingreso_mensual_mxn", 0),
    }

    sugerencias = []
    clusters_aplicados = []

    for cluster in CLUSTER_RULES:
        try:
            if cluster["condicion"](datos):
                clusters_aplicados.append(cluster["nombre"])
                for producto in cluster["productos"]:
                    sugerencias.append({**producto, "cluster": cluster["nombre"]})
        except Exception:
            continue

    if not sugerencias:
        sugerencias = DEFAULT_PRODUCTOS

    return sugerencias