def get_cluster_suggestions(summary):
    """
    Motor local de sugerencias basado en el cluster del usuario.
    Devuelve exactamente 4 sugerencias para el carrusel.
    """
    cluster_id = summary.get("cluster_id", -1)
    user_id = summary.get("user_id", "unknown")
    
    # Mapeo de tipo → tag legible para el frontend
    TAGS = {
        "inversion": "Inversión",
        "ahorro": "Ahorro",
        "credito": "Crédito",
        "tarjeta": "Tarjeta",
        "membresia": "Hey Pro",
        "seguro": "Seguro",
        "general": "Hey Banco",
    }
    
    SUGERENCIAS = {
        0: [  # Premium
            {
                "tipo": "inversion",
                "tag": TAGS["inversion"],
                "icono": "📈",
                "titulo": "Fondo Hey Black Exclusivo",
                "descripcion": "Con tu perfil premium, accedes a nuestro fondo top con rendimiento histórico del 14.2% anual. Mínimo de inversión: $50,000 MXN.",
                "cta": "Conocer fondo",
                "steps": ["Revisa tu perfil de riesgo", "Simula tu rendimiento", "Invierte desde la app"]
            },
            {
                "tipo": "tarjeta",
                "tag": TAGS["tarjeta"],
                "icono": "💳",
                "titulo": "Tarjeta Hey Platinum",
                "descripcion": "Duplica tus puntos Hey en viajes internacionales y disfruta acceso ilimitado a salas VIP en 40 aeropuertos.",
                "cta": "Solicitar",
                "steps": ["Verifica tu elegibilidad", "Confirma tu dirección", "Recibe en 48 hrs"]
            },
            {
                "tipo": "seguro",
                "tag": TAGS["seguro"],
                "icono": "🛡️",
                "titulo": "Seguro Patrimonial Integral",
                "descripcion": "Protege hasta $5 millones de pesos entre tus bienes, inversiones y vida. Descuento exclusivo del 30% por ser Hey Pro.",
                "cta": "Cotizar",
                "steps": ["Define tu cobertura ideal", "Compara planes disponibles", "Activa con un solo click"]
            },
            {
                "tipo": "membresia",
                "tag": TAGS["membresia"],
                "icono": "⭐",
                "titulo": "Asesoría Financiera Personalizada",
                "descripcion": "Un asesor dedicado revisará tu portafolio trimestralmente y te alertará sobre oportunidades fiscales exclusivas.",
                "cta": "Agendar cita",
                "steps": ["Elige tu horario preferido", "Define tus metas financieras", "Recibe tu plan personalizado"]
            },
        ],
        1: [  # Gastador Frecuente
            {
                "tipo": "credito",
                "tag": TAGS["credito"],
                "icono": "⚠️",
                "titulo": "Alertas Inteligentes de Gasto",
                "descripcion": "Has superado tu promedio de gasto en restaurantes un 34% este mes. Activa alertas para mantener el control financiero.",
                "cta": "Configurar alertas",
                "steps": ["Define tu límite semanal", "Elige las categorías a monitorear", "Recibe notificaciones en tiempo real"]
            },
            {
                "tipo": "tarjeta",
                "tag": TAGS["tarjeta"],
                "icono": "💳",
                "titulo": "Cashback Garantizado del 5%",
                "descripcion": "En tus 3 categorías top: restaurantes, transporte y entretenimiento. Sin límite de devolución mensual.",
                "cta": "Activar cashback",
                "steps": ["Selecciona tus 3 categorías", "Confirma tu tarjeta principal", "Empieza a ganar desde hoy"]
            },
            {
                "tipo": "ahorro",
                "tag": TAGS["ahorro"],
                "icono": "🪙",
                "titulo": "Redondeo Inteligente Hey",
                "descripcion": "Cada compra se redondea al siguiente $10 y la diferencia va directo a tu alcancía. Promedio de ahorro: $1,200 al mes.",
                "cta": "Activar redondeo",
                "steps": ["Elige el destino del redondeo", "Define un tope diario opcional", "Monitorea tu progreso semanal"]
            },
            {
                "tipo": "general",
                "tag": TAGS["general"],
                "icono": "🏦",
                "titulo": "Presupuesto Semanal Automático",
                "descripcion": "Te sugerimos un tope de $2,800 esta semana basado en tus ingresos y compromisos fijos detectados.",
                "cta": "Aplicar presupuesto",
                "steps": ["Revisa las categorías sugeridas", "Ajusta los montos si lo deseas", "Recibe reportes cada domingo"]
            },
        ],
        2: [  # Ahorrador Conservador
            {
                "tipo": "ahorro",
                "tag": TAGS["ahorro"],
                "icono": "🪙",
                "titulo": "Cuenta de Ahorro a Plazo Fijo",
                "descripcion": "Tasa garantizada del 11.5% anual. Plazo mínimo 90 días. Ideal para construir tu fondo de emergencia sin riesgos.",
                "cta": "Abrir cuenta",
                "steps": ["Define tu monto inicial", "Elige el plazo que prefieras", "Confirma tu contrato digital"]
            },
            {
                "tipo": "inversion",
                "tag": TAGS["inversion"],
                "icono": "📈",
                "titulo": "CETES Directo desde Hey",
                "descripcion": "La opción más segura del mercado de deuda gubernamental. Invierte desde $100 y liquida cuando quieras después del plazo.",
                "cta": "Simular rendimiento",
                "steps": ["Calcula tu rendimiento esperado", "Define periodicidad de compra", "Programa compras automáticas"]
            },
            {
                "tipo": "general",
                "tag": TAGS["general"],
                "icono": "🏦",
                "titulo": "Meta: Fondo de Emergencia",
                "descripcion": "Te recomendamos acumular 3 meses de gastos. Ya llevas el 60% alcanzado. ¡Estás muy cerca de tu meta!",
                "cta": "Aumentar aporte",
                "steps": ["Revisa tu progreso actual", "Ajusta tu aporte mensual", "Activa domiciliación automática"]
            },
            {
                "tipo": "seguro",
                "tag": TAGS["seguro"],
                "icono": "🛡️",
                "titulo": "Seguro de Vida Básico",
                "descripcion": "Protección desde $300,000 por solo $299 al mes. Perfecto para empezar a proteger tu patrimonio familiar.",
                "cta": "Cotizar ahora",
                "steps": ["Responde 3 preguntas simples", "Compara coberturas disponibles", "Contrata 100% digital"]
            },
        ],
        3: [  # Al Límite (Riesgo de Deuda)
            {
                "tipo": "credito",
                "tag": TAGS["credito"],
                "icono": "⚠️",
                "titulo": "Plan de Consolidación de Deuda",
                "descripcion": "Tu utilización de crédito es del 87%. Consolidamos tus 3 tarjetas en una sola tasa del 18% anual (vs 45% actual).",
                "cta": "Ver mi plan",
                "steps": ["Revisa todas tus deudas activas", "Compara el ahorro mensual", "Acepta la reestructura digital"]
            },
            {
                "tipo": "tarjeta",
                "tag": TAGS["tarjeta"],
                "icono": "💳",
                "titulo": "Tarjeta Garantizada de Control",
                "descripcion": "Deposita $5,000 como garantía y usa eso como tu límite. Te ayuda a reconstruir tu historial crediticio en 6 meses.",
                "cta": "Solicitar tarjeta",
                "steps": ["Deposita tu garantía", "Recibe tu tarjeta en 72 hrs", "Usa responsablemente y sube tu score"]
            },
            {
                "tipo": "general",
                "tag": TAGS["general"],
                "icono": "🏦",
                "titulo": "Congelar Tarjetas los Fines de Semana",
                "descripcion": "El 62% de tus compras impulsivas ocurren sábado y domingo. Activa el bloqueo temporal y toma el control.",
                "cta": "Programar bloqueo",
                "steps": ["Define horarios de bloqueo", "Selecciona qué tarjetas congelar", "Recibe alertas si intentas usar"]
            },
            {
                "tipo": "ahorro",
                "tag": TAGS["ahorro"],
                "icono": "🪙",
                "titulo": "Alcancía 'Libertad Financiera'",
                "descripcion": "Empieza con solo $50 semanales. En 6 meses tendrás $1,300 para tu primer fondo de emergencia. Tú puedes.",
                "cta": "Crear alcancía",
                "steps": ["Define tu aporte inicial", "Programa domiciliación semanal", "Monitorea tu avance mensual"]
            },
        ],
    }
    
    sugerencias = SUGERENCIAS.get(cluster_id, SUGERENCIAS[2])
    
    resultado = []
    for i, s in enumerate(sugerencias):
        item = dict(s)
        item["id"] = f"sug_{user_id}_{cluster_id}_{i}_{hash(s['titulo']) % 10000}"
        item["cluster_id"] = cluster_id
        resultado.append(item)
    
    return resultado