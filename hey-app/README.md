# Hey Bank App 🏦

Dashboard inteligente de banca personal construido con React.

## Estructura del proyecto

```
hey-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Barra de navegación superior
│   │   ├── SuggestionsCarousel.jsx  # Carrusel de sugerencias IA
│   │   ├── SuggestionCard.jsx   # Tarjeta individual de sugerencia
│   │   ├── QuickStats.jsx       # Métricas rápidas (saldo, gasto, inversiones)
│   │   ├── RightPanel.jsx       # Panel derecho con tabs
│   │   ├── ChatPanel.jsx        # Chat con asistente IA
│   │   ├── StatsPanel.jsx       # Estadísticas y gráfica de gasto
│   │   └── GoalsPanel.jsx       # Objetivos de ahorro con barras de progreso
│   ├── data/
│   │   └── mockData.js          # Datos simulados del usuario
│   ├── App.jsx                  # Componente raíz + layout principal
│   ├── index.js                 # Entry point
│   └── index.css                # Variables CSS globales (design tokens)
├── package.json
└── README.md
```

## Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar el servidor de desarrollo
npm start
```

La app abre en http://localhost:3000

## Funcionalidades

- **Sugerencias inteligentes**: Carrusel animado que rota automáticamente cada 4.5 segundos. Incluye botón para cargar más sugerencias.
- **Chat IA**: Conversación con el asistente, respuestas simuladas con animación de "escribiendo".
- **Estadísticas**: Gráfica de barras de gasto mensual (Recharts) + desglose por categoría.
- **Objetivos**: Barras de progreso por meta + formulario para crear nuevas metas.

## Próximos pasos / Extensiones

- Conectar con la API de Anthropic para respuestas reales del chatbot
- Integrar backend real (Node.js / Supabase)
- Agregar autenticación de usuario
- Implementar notificaciones push
- Agregar dark mode
