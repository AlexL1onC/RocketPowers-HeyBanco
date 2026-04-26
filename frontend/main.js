const API = "http://127.0.0.1:8000";
const USER_ID = "USR-00001";

async function loadDashboard() {
    
  const stats = await fetch(`${API}/user/${USER_ID}/stats`).then(r => r.json());

  document.getElementById("balance").innerText = formatMoney(stats.balance);
  document.getElementById("spend").innerText = formatMoney(stats.monthlySpend);
  document.getElementById("invest").innerText = formatMoney(stats.investments);

  await loadRecommendation();
  await loadFinancialDetails();

}

async function loadFinancialDetails() {
  const data = await fetch(`${API}/user/${USER_ID}/financial_details`).then(r => r.json());

  const categories = data.resumen_categorias || [];
  const merchants = data.top_comercios_por_categoria || [];

  document.getElementById("periodo").innerText = data.periodo || "Últimos 3 meses";

  renderCategories(categories, merchants);

  if (categories.length > 0) {
    showCategoryDetail(categories[0], merchants);
  }
}

function renderCategories(categories, merchants) {
  const container = document.getElementById("categories");
  container.innerHTML = "";

  categories.forEach((cat, index) => {
    const merchant = merchants.find(m => m.categoria === cat.categoria);

    const div = document.createElement("div");
    div.className = `category-card ${index === 0 ? "active" : ""}`;

    div.innerHTML = `
      <div class="category-left">
        <div class="category-icon">${getCategoryIcon(cat.categoria)}</div>
        <div>
          <h4>${formatCategoryName(cat.categoria)}</h4>
          <p>${cat.conteo} transacciones</p>
        </div>
      </div>

      <div class="category-right">
        <strong>${formatMoney(cat.total_monto)}</strong>
        <span>${merchant ? merchant.comercio : "Sin comercio"}</span>
      </div>
    `;

    div.addEventListener("click", () => {
      document.querySelectorAll(".category-card").forEach(el => el.classList.remove("active"));
      div.classList.add("active");
      showCategoryDetail(cat, merchants);
    });

    container.appendChild(div);
  });
}

function showCategoryDetail(category, merchants) {
  const merchant = merchants.find(m => m.categoria === category.categoria);
  const detail = document.getElementById("merchant-detail");

  detail.innerHTML = `
    <div class="detail-card">
      <div class="detail-top">
        <div class="big-icon">${getCategoryIcon(category.categoria)}</div>
        <span class="mini-badge">Top comercio</span>
      </div>

      <h3>${formatCategoryName(category.categoria)}</h3>
      <p class="detail-subtitle">Tu gasto principal en esta categoría fue:</p>

      <div class="merchant-box">
        <span>Comercio</span>
        <strong>${merchant ? merchant.comercio : "No disponible"}</strong>
      </div>

      <div class="amount-box">
        <span>Monto gastado</span>
        <strong>${formatMoney(merchant ? merchant.total_monto : category.total_monto)}</strong>
      </div>

      <div class="insight">
        💡 Esta categoría representa ${category.conteo} movimientos en los últimos meses.
      </div>
    </div>
  `;
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(value || 0);
}

function formatCategoryName(name) {
  if (!name) return "Otros";
  return name
    .replaceAll("_", " ")
    .replace(/\b\w/g, letra => letra.toUpperCase());
}

function getCategoryIcon(category) {
  const icons = {
    restaurantes: "🍽️",
    supermercado: "🛒",
    transporte: "🚗",
    entretenimiento: "🎬",
    salud: "💊",
    educacion: "📚",
    tecnologia: "💻",
    hogar: "🏠",
    viajes: "✈️",
    servicios: "💡",
    farmacia: "💊",
    ropa: "👕",
    otros: "📦"
  };

  return icons[(category || "").toLowerCase()] || "💳";
}

function loadChatHistory() {
  const saved = localStorage.getItem(`chat_${USER_ID}`);

  if (!saved) {
    addMessage("Hola 👋 Soy Delfos. Puedo ayudarte a entender tus gastos, productos y recomendaciones financieras.", "bot", false);
    return;
  }

  const messages = JSON.parse(saved);
  messages.forEach(msg => addMessage(msg.text, msg.type, false));
}

function saveChatMessage(text, type) {
  const saved = localStorage.getItem(`chat_${USER_ID}`);
  const messages = saved ? JSON.parse(saved) : [];

  messages.push({ text, type });

  localStorage.setItem(`chat_${USER_ID}`, JSON.stringify(messages));
}

async function sendMessage() {
  const input = document.getElementById("input");
  const text = input.value.trim();

  if (!text) return;

  addMessage(text, "user", true);
  input.value = "";

  const typing = addTyping();

  try {
    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_id: USER_ID,
        message: text
      })
    });

    const data = await res.json();

    typing.remove();

    const response = data.response || data.error || "No pude responder en este momento.";

    addMessage(response, "bot", true);

  } catch (error) {
    typing.remove();
    addMessage("No pude conectarme con el servidor. Revisa que FastAPI esté corriendo.", "bot", true);
  }
}

function addMessage(text, type, save = true) {
  const div = document.createElement("div");
  div.className = `message ${type}`;

  div.innerHTML = `
    <div class="bubble">
      ${text}
    </div>
  `;

  document.getElementById("messages").appendChild(div);

  const messages = document.getElementById("messages");
  messages.scrollTop = messages.scrollHeight;

  if (save) {
    saveChatMessage(text, type);
  }
}

function addTyping() {
  const div = document.createElement("div");
  div.className = "message bot typing";

  div.innerHTML = `
    <div class="bubble">
      <span></span><span></span><span></span>
    </div>
  `;

  document.getElementById("messages").appendChild(div);

  const messages = document.getElementById("messages");
  messages.scrollTop = messages.scrollHeight;

  return div;
}

function quickPrompt(text) {
  document.getElementById("input").value = text;
  sendMessage();
}

async function loadRecommendation() {
  const data = await fetch(`${API}/user/${USER_ID}/suggestions`).then(r => r.json());

  const recommendation = data.recommendation;

  document.getElementById("profile-name").innerText = data.perfil || "Perfil financiero";
  document.getElementById("cluster-badge").innerText = `Cluster ${data.cluster_id}`;

  document.getElementById("recommendation-card").innerHTML = `
    <div class="recommendation-type">${recommendation.tipo}</div>
    <h4>${recommendation.titulo}</h4>
    <p>${recommendation.descripcion}</p>

    <div class="recommendation-action">
      <span>Acción recomendada</span>
      <strong>${recommendation.accion_recomendada}</strong>
    </div>

    <div class="recommendation-reason">
      <span>¿Por qué?</span>
      <p>${recommendation.razon}</p>
    </div>
  `;
}

function scrollToSection(sectionId, button) {
  const main = document.getElementById("mainContent");
  const section = document.getElementById(sectionId);

  if (!main || !section) return;

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });

  button.classList.add("active");
}


loadDashboard();
loadChatHistory();

