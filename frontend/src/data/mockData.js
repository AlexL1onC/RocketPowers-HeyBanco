export const USER = {
  name: 'Sofía',
  lastName: 'Ramírez',
  initials: 'SR',
  balance: 12450,
  monthlySpend: 6820,
  investments: 3200,
};

export const SUGGESTIONS = [
  {
    id: 1,
    tag: 'Ahorro',
    tagColor: 'green',
    emoji: '🏦',
    title: '¡Ahorra en CETES!',
    description: 'Detectamos que tienes $4,200 sin movimiento. Invertirlos en CETES te daría un rendimiento del 11.2% anual.',
    steps: [
      'Abre tu cuenta de inversión en Hey',
      'Transfiere desde tu saldo disponible',
      'Elige el plazo: 28, 91 o 182 días',
    ],
    cta: 'Empezar ahora',
  },
  {
    id: 2,
    tag: 'Crédito',
    tagColor: 'coral',
    emoji: '🛒',
    title: 'Nos preocupamos por ti',
    description: 'Este mes gastaste 38% más en comida que tu promedio. ¿Quieres un crédito para aliviar el presupuesto?',
    steps: [
      'Revisa tu línea de crédito disponible',
      'Solicita hasta $8,000 sin papeleos',
      'Paga en 3, 6 o 12 mensualidades',
    ],
    cta: 'Ver opciones',
  },
  {
    id: 3,
    tag: 'Meta',
    tagColor: 'blue',
    emoji: '✈️',
    title: '¡Tu viaje está cerca!',
    description: 'Solo te faltan $1,800 para tu meta de viaje. Con tu ritmo actual llegas en 6 semanas.',
    steps: [
      'Activa el ahorro automático semanal',
      'Recibe alertas de progreso',
      'Compara vuelos desde la app',
    ],
    cta: 'Activar ahorro',
  },
  {
    id: 4,
    tag: 'Inversión',
    tagColor: 'amber',
    emoji: '📈',
    title: 'Diversifica tu dinero',
    description: 'Tu perfil moderado es ideal para fondos de deuda corporativa con hasta 13% de rendimiento anual.',
    steps: [
      'Completa tu perfil de inversionista',
      'Elige entre 5 fondos recomendados',
      'Invierte desde $500',
    ],
    cta: 'Explorar fondos',
  },
];

export const EXTRA_SUGGESTIONS = [
  {
    id: 5,
    tag: 'Seguro',
    tagColor: 'blue',
    emoji: '🛡️',
    title: 'Protege lo que más quieres',
    description: 'Basado en tu patrimonio actual, un seguro de vida te daría cobertura desde $180 al mes.',
    steps: [
      'Cotiza en menos de 2 minutos',
      'Sin examen médico hasta 45 años',
      'Cobertura desde el primer día',
    ],
    cta: 'Cotizar ahora',
  },
  {
    id: 6,
    tag: 'Cashback',
    tagColor: 'green',
    emoji: '💳',
    title: '¡Gana más con tu tarjeta!',
    description: 'Activando el modo cashback recuperarías ~$340 al mes según tus patrones de gasto actuales.',
    steps: [
      'Activa cashback en la app',
      'Úsala en tus comercios favoritos',
      'Retira tu cashback cuando quieras',
    ],
    cta: 'Activar cashback',
  },
];

export const SPENDING_CATEGORIES = [
  { icon: '🍔', name: 'Restaurantes', sub: '+38% vs mes anterior', amount: 2340, trend: 'up' },
  { icon: '🚗', name: 'Transporte',   sub: 'Normal vs. promedio',   amount: 890,  trend: 'neutral' },
  { icon: '🛍️', name: 'Compras',      sub: '-12% vs mes anterior', amount: 1430, trend: 'down' },
  { icon: '📱', name: 'Suscripciones',sub: '4 servicios activos',   amount: 680,  trend: 'neutral' },
  { icon: '🏠', name: 'Hogar',         sub: 'Renta + servicios',    amount: 3200, trend: 'neutral' },
];

export const SPENDING_CHART = [
  { mes: 'Nov', gasto: 5200 },
  { mes: 'Dic', gasto: 7100 },
  { mes: 'Ene', gasto: 5900 },
  { mes: 'Feb', gasto: 6100 },
  { mes: 'Mar', gasto: 6080 },
  { mes: 'Abr', gasto: 6820 },
];

export const GOALS = [
  { id: 1, icon: '✈️', name: 'Viaje a Europa',      current: 8200,  target: 10000, color: '#D85A30' },
  { id: 2, icon: '🚗', name: 'Auto nuevo',           current: 12000, target: 50000, color: '#378ADD' },
  { id: 3, icon: '🏠', name: 'Fondo de emergencia', current: 18000, target: 20000, color: '#639922' },
  { id: 4, icon: '📚', name: 'Curso de finanzas',   current: 2500,  target: 5000,  color: '#BA7517' },
];

export const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'bot',
    text: '¡Hola Sofía! 👋 Soy tu asistente Hey. Hoy detecté 4 oportunidades personalizadas para ti. ¿En qué te puedo ayudar?',
    time: '9:02 am',
  },
  {
    id: 2,
    role: 'user',
    text: '¿Cuánto gasté en restaurantes este mes?',
    time: '9:04 am',
  },
  {
    id: 3,
    role: 'bot',
    text: 'Gastaste $2,340 en restaurantes en abril — un 38% más que tu promedio. Los picos fueron los viernes y sábados. ¿Quieres que te ayude a crear un presupuesto?',
    time: '9:04 am',
  },
];

export const BOT_REPLIES = [
  'Claro, con gusto te ayudo. Basándome en tu historial reciente, la mejor opción sería planificarlo a mediano plazo. ¿Te preparo un resumen?',
  'Según tus patrones de gasto, encontré 3 opciones que se ajustan perfectamente a tu perfil. ¿Quieres verlas?',
  '¡Excelente pregunta! Tus últimas 30 transacciones me dicen que este es el momento ideal. ¿Agendamos una revisión de tus finanzas?',
  'Entiendo lo que buscas. Con tu ritmo de ahorro actual, podrías lograrlo en aproximadamente 8 semanas. ¿Ajustamos tu meta?',
  'He analizado tu comportamiento financiero y tengo una recomendación personalizada. ¿Te la muestro?',
];