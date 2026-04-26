const API = "http://127.0.0.1:8000";
const USER_ID = "USR-00001";

async function loadDashboard() {

  const stats = await fetch(`${API}/user/${USER_ID}/stats`).then(r => r.json());

  document.getElementById("balance").innerText = `$${stats.balance}`;
  document.getElementById("spend").innerText = `$${stats.monthlySpend}`;
  document.getElementById("invest").innerText = `$${stats.investments}`;

  const spending = await fetch(`${API}/user/${USER_ID}/spending`).then(r => r.json());

  const container = document.getElementById("categories");
  container.innerHTML = "";

  spending.categories.forEach(cat => {
    const div = document.createElement("div");
    div.className = "category";
    div.innerText = `${cat.icon} ${cat.name}: $${cat.amount}`;
    container.appendChild(div);
  });
}

async function sendMessage() {

  const input = document.getElementById("input");
  const text = input.value;

  if (!text) return;

  addMessage(text, "user");

  input.value = "";

  const res = await fetch(`${API}/chat`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      user_id: USER_ID,
      message: text
    })
  });

  const data = await res.json();

  addMessage(data.response || data.error, "bot");
}

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.innerText = text;

  document.getElementById("messages").appendChild(div);
}

loadDashboard();