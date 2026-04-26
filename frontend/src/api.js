const BASE_URL = "http://127.0.0.1:8000";

export async function fetchUserSummary(userId) {
  const res = await fetch(`${BASE_URL}/user/${userId}/summary`);
  if (!res.ok) throw new Error("Error al obtener summary");
  return res.json();
}

export async function fetchSuggestions(userId) {
  const res = await fetch(`${BASE_URL}/user/${userId}/suggestions`);
  if (!res.ok) throw new Error("Error al obtener sugerencias");
  return res.json();
}

export async function sendChat(userId, message) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, message }),
  });
  if (!res.ok) throw new Error("Error en el chat");
  return res.json();
}

// ── Nuevas funciones para los paneles ──

export async function fetchUserStats(userId) {
  const res = await fetch(`${BASE_URL}/user/${userId}/stats`);
  if (!res.ok) throw new Error("Error al obtener estadísticas de usuario");
  return res.json();
}

export async function fetchSpendingStats(userId) {
  const res = await fetch(`${BASE_URL}/user/${userId}/spending`);
  if (!res.ok) throw new Error("Error al obtener gastos");
  return res.json();
}

export async function fetchGoals(userId) {
  const res = await fetch(`${BASE_URL}/user/${userId}/goals`);
  if (!res.ok) throw new Error("Error al obtener objetivos");
  return res.json();
}

export async function fetchFinancialDetails(userId) {
  const res = await fetch(`${BASE_URL}/user/${userId}/financial_details`);
  if (!res.ok) throw new Error("Error al obtener detalles financieros");
  return res.json();
}