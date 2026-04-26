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