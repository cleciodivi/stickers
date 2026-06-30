/**
 * Sticker Control - Copa 2026
 * Sistema completo de gerenciamento de figurinhas
 * Com Firebase Authentication e Firestore
 */

// ============================================
// CONFIGURAÇÃO E DADOS
// ============================================

let currentUser = null;
let isLoading = true;

const CONFIG = {
  totalFigurinhas: 528, // 24 seleções x 22 figurinhas
  figurinhasPorTime: 22, // 1 emblema + 1 foto do time + 20 jogadores
  times: [
    // Grupo A
    { codigo: "MEX", nome: "México", bandeira: "🇲🇽", grupo: "A" },
    { codigo: "RSA", nome: "África do Sul", bandeira: "🇿🇦", grupo: "A" },
    { codigo: "KOR", nome: "Coreia do Sul", bandeira: "🇰🇷", grupo: "A" },
    { codigo: "CZE", nome: "Tchéquia", bandeira: "🇨🇿", grupo: "A" },
    // Grupo B
    { codigo: "CAN", nome: "Canadá", bandeira: "🇨🇦", grupo: "B" },
    { codigo: "SUI", nome: "Suíça", bandeira: "🇨🇭", grupo: "B" },
    { codigo: "QAT", nome: "Catar", bandeira: "🇶🇦", grupo: "B" },
    { codigo: "BIH", nome: "Bósnia e Herzegovina", bandeira: "🇧🇦", grupo: "B" },
    // Grupo C
    { codigo: "BRA", nome: "Brasil", bandeira: "🇧🇷", grupo: "C" },
    { codigo: "MAR", nome: "Marrocos", bandeira: "🇲🇦", grupo: "C" },
    { codigo: "SCO", nome: "Escócia", bandeira: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", grupo: "C" },
    { codigo: "HAI", nome: "Haiti", bandeira: "🇭🇹", grupo: "C" },
    // Grupo D
    { codigo: "USA", nome: "Estados Unidos", bandeira: "🇺🇸", grupo: "D" },
    { codigo: "AUS", nome: "Austrália", bandeira: "🇦🇺", grupo: "D" },
    { codigo: "PAR", nome: "Paraguai", bandeira: "🇵🇾", grupo: "D" },
    { codigo: "TUR", nome: "Turquia", bandeira: "🇹🇷", grupo: "D" },
    // Grupo E
    { codigo: "GER", nome: "Alemanha", bandeira: "🇩🇪", grupo: "E" },
    { codigo: "ECU", nome: "Equador", bandeira: "🇪🇨", grupo: "E" },
    { codigo: "CIV", nome: "Costa do Marfim", bandeira: "🇨🇮", grupo: "E" },
    { codigo: "CUW", nome: "Curaçao", bandeira: "🇨🇼", grupo: "E" },
    // Grupo F
    { codigo: "NED", nome: "Países Baixos", bandeira: "🇳🇱", grupo: "F" },
    { codigo: "JPN", nome: "Japão", bandeira: "🇯🇵", grupo: "F" },
    { codigo: "SWE", nome: "Suécia", bandeira: "🇸🇪", grupo: "F" },
    { codigo: "TUN", nome: "Tunísia", bandeira: "🇹🇳", grupo: "F" },
    // Grupo G
    { codigo: "BEL", nome: "Bélgica", bandeira: "🇧🇪", grupo: "G" },
    { codigo: "EGY", nome: "Egito", bandeira: "🇪🇬", grupo: "G" },
    { codigo: "IRN", nome: "Irã", bandeira: "🇮🇷", grupo: "G" },
    { codigo: "NZL", nome: "Nova Zelândia", bandeira: "🇳🇿", grupo: "G" },
    // Grupo H
    { codigo: "ESP", nome: "Espanha", bandeira: "🇪🇸", grupo: "H" },
    { codigo: "URU", nome: "Uruguai", bandeira: "🇺🇾", grupo: "H" },
    { codigo: "CPV", nome: "Cabo Verde", bandeira: "🇨🇻", grupo: "H" },
    { codigo: "KSA", nome: "Arábia Saudita", bandeira: "🇸🇦", grupo: "H" },
    // Grupo I
    { codigo: "FRA", nome: "França", bandeira: "🇫🇷", grupo: "I" },
    { codigo: "NOR", nome: "Noruega", bandeira: "🇳🇴", grupo: "I" },
    { codigo: "SEN", nome: "Senegal", bandeira: "🇸🇳", grupo: "I" },
    { codigo: "IRQ", nome: "Iraque", bandeira: "🇮🇶", grupo: "I" },
    // Grupo J
    { codigo: "ARG", nome: "Argentina", bandeira: "🇦🇷", grupo: "J" },
    { codigo: "AUT", nome: "Áustria", bandeira: "🇦🇹", grupo: "J" },
    { codigo: "ALG", nome: "Argélia", bandeira: "🇩🇿", grupo: "J" },
    { codigo: "JOR", nome: "Jordânia", bandeira: "🇯🇴", grupo: "J" },
    // Grupo K
    { codigo: "COL", nome: "Colômbia", bandeira: "🇨🇴", grupo: "K" },
    { codigo: "POR", nome: "Portugal", bandeira: "🇵🇹", grupo: "K" },
    {
      codigo: "COD",
      nome: "República Democrática do Congo",
      bandeira: "🇨🇩",
      grupo: "K",
    },
    { codigo: "UZB", nome: "Uzbequistão", bandeira: "🇺🇿", grupo: "K" },
    // Grupo L
    { codigo: "ENG", nome: "Inglaterra", bandeira: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", grupo: "L" },
    { codigo: "CRO", nome: "Croácia", bandeira: "🇭🇷", grupo: "L" },
    { codigo: "GHA", nome: "Gana", bandeira: "🇬🇭", grupo: "L" },
    { codigo: "PAN", nome: "Panamá", bandeira: "🇵🇦", grupo: "L" },
  ],
};

// Estado da aplicação
let appState = {
  figurinhas: {},
  repetidas: {},
  trocas: {
    oferecidas: [],
    desejadas: [],
  },
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Check authentication state
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Verificar se usuário está bloqueado
      try {
        const userDoc = await db.collection("users").doc(user.uid).get();
        if (userDoc.exists && userDoc.data().blocked) {
          await auth.signOut();
          alert("Sua conta foi bloqueada pelo administrador.");
          window.location.href = "login.html";
          return;
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      }

      currentUser = user;
      await initData();
      populateTeamFilter();
      renderAll();
      setupEventListeners();
      updateUserUI();
      isLoading = false;
    } else {
      // Redirect to login if not authenticated
      window.location.href = "login.html";
    }
  });
});

const ADMIN_EMAIL = "cleciovromana@gmail.com";

// Mobile menu toggle
function toggleMobileMenu() {
  const mobileNav = document.getElementById("mobileNav");
  if (mobileNav) {
    mobileNav.classList.toggle("show");
  }
}

function updateUserUI() {
  // Add user info to header if not exists
  const header = document.querySelector(".header .container");
  if (header && !document.getElementById("userInfo")) {
    const userDiv = document.createElement("div");
    userDiv.id = "userInfo";
    userDiv.style.cssText =
      "display: flex; align-items: center; gap: 12px; margin-left: auto;";

    userDiv.innerHTML = `
      <span style="color: rgba(255,255,255,0.8); font-size: 14px;">${currentUser.displayName || currentUser.email}</span>
      <button onclick="logout()" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.3s;">Sair</button>
    `;
    header.appendChild(userDiv);
  }

  // Show admin link in nav if user is admin
  const adminNavLink = document.getElementById("adminNavLink");
  const adminMobileLink = document.getElementById("adminMobileLink");

  if (currentUser && currentUser.email === ADMIN_EMAIL) {
    if (adminNavLink) adminNavLink.style.display = "inline-block";
    if (adminMobileLink) adminMobileLink.style.display = "block";
  } else {
    if (adminNavLink) adminNavLink.style.display = "none";
    if (adminMobileLink) adminMobileLink.style.display = "none";
  }
}

async function logout() {
  try {
    await auth.signOut();
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
    showToast("Erro ao sair. Tente novamente.");
  }
}

async function initData() {
  if (!currentUser) return;

  try {
    // Try to load from Firestore
    const docRef = db.collection("users").doc(currentUser.uid);
    const doc = await docRef.get();

    if (doc.exists) {
      const data = doc.data();
      console.log("Loaded user data:", data);
      if (data.figurinhas && Object.keys(data.figurinhas).length > 0) {
        appState.figurinhas = data.figurinhas;
        appState.repetidas = data.repetidas || {};
        appState.trocas = data.trocas || { oferecidas: [], desejadas: [] };
      } else {
        // Create initial data if no figurinhas
        console.log("No figurinhas found, creating sample data");
        createSampleData();
        await saveData();
      }
    } else {
      // Create initial data for new user
      console.log("Creating new user document");
      createSampleData();
      await saveData();
    }
  } catch (error) {
    console.error("Error loading data:", error);
    // Fallback to localStorage
    const savedData = localStorage.getItem("stickerControlData");
    if (savedData) {
      appState = JSON.parse(savedData);
    } else {
      createSampleData();
    }
  }
}

function createSampleData() {
  let numero = 1;

  CONFIG.times.forEach((time) => {
    for (let i = 0; i < CONFIG.figurinhasPorTime; i++) {
      const id = `${time.codigo}_${i}`;
      // 0: emblema, 1: foto do time, 2-21: jogadores
      let tipo, nome;
      if (i === 0) {
        tipo = "emblema";
        nome = "Emblema";
      } else if (i === 1) {
        tipo = "foto";
        nome = "Foto do Time";
      } else {
        tipo = "jogador";
        nome = `Jogador ${i - 1}`;
      }

      // Simular algumas figurinhas já obtidas (aleatório)
      const random = Math.random();
      let status = "faltante";
      let quantidade = 0;

      if (random > 0.6) {
        status = "possuida";
        quantidade = 1;

        // Algumas repetidas
        if (random > 0.9) {
          quantidade = Math.floor(Math.random() * 3) + 2;
        }
      }

      appState.figurinhas[id] = {
        id: id,
        numero: numero,
        time: time.codigo,
        tipo: tipo,
        nome: nome,
        status: status,
        quantidade: quantidade,
      };

      if (quantidade > 1) {
        appState.repetidas[id] = quantidade - 1;
      }

      numero++;
    }
  });

  saveData();
}

async function saveData() {
  // Save to localStorage as backup
  localStorage.setItem("stickerControlData", JSON.stringify(appState));

  // Save to Firestore if user is logged in
  if (currentUser) {
    try {
      const userDoc = await db.collection("users").doc(currentUser.uid).get();
      const updateData = {
        figurinhas: appState.figurinhas,
        repetidas: appState.repetidas,
        trocas: appState.trocas,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      };

      // Se o documento não existir ou não tiver name/email, adicionar
      if (!userDoc.exists || !userDoc.data().name) {
        updateData.name = currentUser.displayName || "Usuário";
        updateData.email = currentUser.email;
      }

      await db
        .collection("users")
        .doc(currentUser.uid)
        .set(updateData, { merge: true });
      console.log("Data saved to Firestore");
    } catch (error) {
      console.error("Error saving to Firestore:", error);
    }
  }
}

// ============================================
// RENDERIZAÇÃO
// ============================================

function renderAll() {
  updateStats();
  renderTeamsList();
  renderTeamsAccordion();
  renderDuplicates();
  renderTradeSection();
}

function updateStats() {
  const figurinhas = Object.values(appState.figurinhas);
  const total = figurinhas.length;
  const possuidas = figurinhas.filter(
    (f) => f.status === "possuida" || f.status === "repetida",
  ).length;
  const faltantes = total - possuidas;
  const repetidas = Object.values(appState.repetidas).reduce(
    (a, b) => a + b,
    0,
  );
  const percentual = Math.round((possuidas / total) * 100);

  // Atualizar elementos do DOM
  document.getElementById("totalFigurinhas").textContent = total;
  document.getElementById("figurinhasPossuidas").textContent = possuidas;
  document.getElementById("figurinhasFaltantes").textContent = faltantes;
  document.getElementById("progressPercent").textContent = `${percentual}%`;
  document.getElementById("headerProgress").style.width = `${percentual}%`;
  document.querySelector(".progress-text").textContent = `${percentual}%`;

  document.getElementById("detailPossuidas").textContent = possuidas;
  document.getElementById("detailFaltantes").textContent = faltantes;
  document.getElementById("detailRepetidas").textContent = repetidas;

  // Atualizar círculo de progresso
  const circle = document.getElementById("progressCircle");
  if (circle) {
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (percentual / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }

  // Estatísticas adicionais
  const especiais = figurinhas.filter(
    (f) => f.tipo === "emblema" && f.status === "possuida",
  ).length;
  const jogadores = figurinhas.filter(
    (f) => f.tipo === "jogador" && f.status === "possuida",
  ).length;
  const estadios = figurinhas.filter(
    (f) => f.tipo === "uniforme" && f.status === "possuida",
  ).length;

  document.getElementById("statEspeciais").textContent = especiais;
  document.getElementById("statJogadores").textContent = jogadores;
  document.getElementById("statEstadios").textContent = estadios;
  document.getElementById("statTrocas").textContent =
    appState.trocas.oferecidas.length;
}

function renderTeamsList() {
  const container = document.getElementById("teamsList");
  if (!container) return;

  container.innerHTML = "";

  CONFIG.times.forEach((time) => {
    const timeFigurinhas = Object.values(appState.figurinhas).filter(
      (f) => f.time === time.codigo,
    );
    const possuidas = timeFigurinhas.filter(
      (f) => f.status === "possuida" || f.status === "repetida",
    ).length;
    const total = timeFigurinhas.length;
    const percentual = Math.round((possuidas / total) * 100);

    const item = document.createElement("div");
    item.className = "team-item";
    item.innerHTML = `
            <span class="team-flag">${time.bandeira}</span>
            <div class="team-info">
                <div class="team-name">${time.nome}</div>
                <div class="team-count">${possuidas}/${total} figurinhas</div>
            </div>
            <div class="team-progress">
                <div class="team-progress-bar">
                    <div class="team-progress-fill" style="width: ${percentual}%"></div>
                </div>
                <div class="team-progress-text">${percentual}%</div>
            </div>
        `;

    container.appendChild(item);
  });
}

function renderTeamsAccordion() {
  const container = document.getElementById("teamsAccordion");
  if (!container) return;

  container.innerHTML = "";

  CONFIG.times.forEach((time, index) => {
    // Pegar figurinhas do time
    let timeFigurinhas = Object.values(appState.figurinhas).filter(
      (f) => f.time === time.codigo,
    );

    // Ordenar: emblema primeiro, depois foto, depois jogadores por número
    timeFigurinhas.sort((a, b) => {
      // Emblema primeiro
      if (a.tipo === "emblema") return -1;
      if (b.tipo === "emblema") return 1;

      // Foto do time segundo
      if (a.tipo === "foto") return -1;
      if (b.tipo === "foto") return 1;

      // Jogadores em ordem crescente de número
      return a.numero - b.numero;
    });

    const possuidas = timeFigurinhas.filter(
      (f) => f.status === "possuida" || f.status === "repetida",
    ).length;
    const total = timeFigurinhas.length;
    const percentual = Math.round((possuidas / total) * 100);

    const accordionItem = document.createElement("div");
    accordionItem.className = "accordion-item";
    accordionItem.innerHTML = `
            <div class="accordion-header" onclick="toggleAccordion(${index})">
                <span class="accordion-icon">${time.bandeira}</span>
                <div class="accordion-info">
                    <div class="accordion-title">${time.nome}</div>
                    <div class="accordion-subtitle">Grupo ${time.grupo}</div>
                </div>
                <div class="accordion-progress">
                    <div class="accordion-progress-bar">
                        <div class="accordion-progress-fill" style="width: ${percentual}%"></div>
                    </div>
                    <div class="accordion-progress-text">${possuidas}/${total}</div>
                </div>
                <div class="accordion-toggle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 9l6 6 6-6"/>
                    </svg>
                </div>
            </div>
            <div class="accordion-content" id="accordion-${index}">
                <div class="stickers-grid">
                    ${timeFigurinhas.map((f) => createStickerHTML(f)).join("")}
                </div>
            </div>
        `;

    container.appendChild(accordionItem);
  });
}

function createStickerHTML(figurinha) {
  const statusClass = figurinha.status;
  const badge =
    figurinha.quantidade > 1
      ? `<span class="sticker-item-badge count">${figurinha.quantidade}</span>`
      : "";
  const icon =
    figurinha.tipo === "emblema"
      ? "⭐"
      : figurinha.tipo === "foto"
        ? "📸"
        : "⚽";

  return `
        <div class="sticker-item ${statusClass}" onclick="toggleSticker('${figurinha.id}')" data-id="${figurinha.id}" data-team="${figurinha.time}" data-status="${figurinha.status}">
            <span class="sticker-item-number">#${figurinha.numero}</span>
            ${badge}
            <span class="sticker-item-image">${icon}</span>
            <span class="sticker-item-name">${figurinha.nome}</span>
        </div>
    `;
}

function renderDuplicates() {
  const container = document.getElementById("duplicatesList");
  if (!container) return;

  container.innerHTML = "";

  const repetidas = Object.entries(appState.repetidas)
    .filter(([_, count]) => count > 0)
    .map(([id, count]) => ({ ...appState.figurinhas[id], count }));

  if (repetidas.length === 0) {
    container.innerHTML = `
            <div class="trade-empty">
                <div class="trade-empty-icon">📭</div>
                <p>Você ainda não tem figurinhas repetidas</p>
            </div>
        `;
  } else {
    repetidas.forEach((f) => {
      const time = CONFIG.times.find((t) => t.codigo === f.time);
      const item = document.createElement("div");
      item.className = "duplicate-item";
      item.innerHTML = `
                <div class="duplicate-image">
                    ${f.tipo === "emblema" ? "⭐" : f.tipo === "foto" ? "📸" : "⚽"}
                </div>
                <div class="duplicate-info">
                    <div class="duplicate-number">#${f.numero}</div>
                    <div class="duplicate-name">${f.nome}</div>
                    <div class="duplicate-team">${time?.bandeira || ""} ${time?.nome || f.time}</div>
                </div>
                <div class="duplicate-count">
                    <button class="count-btn" onclick="updateDuplicate('${f.id}', -1); event.stopPropagation();">−</button>
                    <span class="count-value">${f.count}</span>
                    <button class="count-btn" onclick="updateDuplicate('${f.id}', 1); event.stopPropagation();">+</button>
                </div>
                <div class="duplicate-actions">
                    <button class="action-btn trade" onclick="addToTrade('${f.id}'); event.stopPropagation();" title="Adicionar às trocas">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                        </svg>
                    </button>
                </div>
            `;
      container.appendChild(item);
    });
  }

  // Atualizar resumo
  const totalRepetidas = repetidas.reduce((sum, f) => sum + f.count, 0);
  const disponiveis = repetidas.filter(
    (f) => !appState.trocas.oferecidas.includes(f.id),
  ).length;
  const valorEstimado = totalRepetidas * 0.5; // R$ 0,50 por figurinha

  document.getElementById("totalDuplicates").textContent = totalRepetidas;
  document.getElementById("availableForTrade").textContent = disponiveis;
  document.getElementById("estimatedValue").textContent =
    `R$ ${valorEstimado.toFixed(2)}`;
}

function renderTradeSection() {
  const wantsContainer = document.getElementById("tradeWants");
  const offersContainer = document.getElementById("tradeOffers");

  if (!wantsContainer || !offersContainer) return;

  // Renderizar figurinhas desejadas (faltantes)
  const faltantes = Object.values(appState.figurinhas)
    .filter((f) => f.status === "faltante")
    .slice(0, 10);

  if (faltantes.length === 0) {
    wantsContainer.innerHTML = `
            <div class="trade-empty">
                <div class="trade-empty-icon">🎯</div>
                <p>Nenhuma figurinha faltante</p>
            </div>
        `;
  } else {
    wantsContainer.innerHTML = faltantes
      .map((f) => createTradeItemHTML(f, "want"))
      .join("");
  }

  // Renderizar figurinhas oferecidas (repetidas)
  const oferecidas = Object.keys(appState.repetidas)
    .filter((id) => appState.repetidas[id] > 0)
    .slice(0, 10)
    .map((id) => ({
      ...appState.figurinhas[id],
      count: appState.repetidas[id],
    }));

  if (oferecidas.length === 0) {
    offersContainer.innerHTML = `
            <div class="trade-empty">
                <div class="trade-empty-icon">🔄</div>
                <p>Nenhuma figurinha para troca</p>
            </div>
        `;
  } else {
    offersContainer.innerHTML = oferecidas
      .map((f) => createTradeItemHTML(f, "offer"))
      .join("");
  }
}

function createTradeItemHTML(figurinha, type) {
  const time = CONFIG.times.find((t) => t.codigo === figurinha.time);
  const badge =
    type === "offer" && figurinha.count > 1
      ? `<span class="sticker-item-badge count">${figurinha.count}</span>`
      : "";

  const icon =
    figurinha.tipo === "emblema"
      ? "⭐"
      : figurinha.tipo === "foto"
        ? "📸"
        : "⚽";

  return `
        <div class="trade-item">
            <div class="trade-item-image">
                ${icon}
            </div>
            <div class="trade-item-info">
                <div class="trade-item-name">${figurinha.nome}</div>
                <div class="trade-item-team">${time?.bandeira || ""} ${time?.nome || figurinha.time}</div>
            </div>
            <span class="trade-item-number">#${figurinha.numero}</span>
            ${badge}
        </div>
    `;
}

// ============================================
// INTERAÇÕES
// ============================================

function toggleAccordion(index) {
  const content = document.getElementById(`accordion-${index}`);
  const header = content.previousElementSibling;

  // Fechar todos os outros
  document.querySelectorAll(".accordion-content").forEach((acc, i) => {
    if (i !== index) {
      acc.classList.remove("open");
      acc.previousElementSibling.classList.remove("active");
    }
  });

  // Toggle atual
  content.classList.toggle("open");
  header.classList.toggle("active");
}

function toggleSticker(id) {
  const figurinha = appState.figurinhas[id];

  if (!figurinha) return;

  // Salvar accordions abertos antes de renderizar
  const openAccordions = [];
  document.querySelectorAll(".accordion-content.open").forEach((acc) => {
    openAccordions.push(acc.id);
  });

  // Ciclo: faltante → possuida → repetida → faltante
  if (figurinha.status === "faltante") {
    figurinha.status = "possuida";
    figurinha.quantidade = 1;
  } else if (figurinha.status === "possuida") {
    figurinha.status = "repetida";
    figurinha.quantidade = 2;
    appState.repetidas[id] = 1;
  } else {
    figurinha.status = "faltante";
    figurinha.quantidade = 0;
    delete appState.repetidas[id];
  }

  saveData();
  renderAll();

  // Reabrir accordions que estavam abertos
  openAccordions.forEach((accId) => {
    const content = document.getElementById(accId);
    if (content) {
      content.classList.add("open");
      const header = content.previousElementSibling;
      if (header) header.classList.add("active");
    }
  });

  showToast(`Figurinha #${figurinha.numero} atualizada!`);
}

function updateDuplicate(id, change) {
  const current = appState.repetidas[id] || 0;
  const newCount = current + change;

  if (newCount < 0) return;

  // Salvar accordions abertos antes de renderizar
  const openAccordions = [];
  document.querySelectorAll(".accordion-content.open").forEach((acc) => {
    openAccordions.push(acc.id);
  });

  if (newCount === 0) {
    delete appState.repetidas[id];
  } else {
    appState.repetidas[id] = newCount;
  }

  // Atualizar quantidade e status na figurinha
  const figurinha = appState.figurinhas[id];
  if (figurinha) {
    figurinha.quantidade = newCount + 1;
    if (newCount === 0) {
      figurinha.status = "possuida";
    } else {
      figurinha.status = "repetida";
    }
  }

  saveData();
  renderAll();

  // Reabrir accordions que estavam abertos
  openAccordions.forEach((accId) => {
    const content = document.getElementById(accId);
    if (content) {
      content.classList.add("open");
      const header = content.previousElementSibling;
      if (header) header.classList.add("active");
    }
  });
}

function addToTrade(id) {
  if (!appState.trocas.oferecidas.includes(id)) {
    appState.trocas.oferecidas.push(id);
    saveData();
    renderTradeSection();
    showToast("Adicionada às trocas");
  }
}

function populateTeamFilter() {
  const select = document.getElementById("teamFilter");
  if (!select) return;

  CONFIG.times.forEach((time) => {
    const option = document.createElement("option");
    option.value = time.codigo;
    option.textContent = `${time.bandeira} ${time.nome}`;
    select.appendChild(option);
  });
}

function filterStickers() {
  const searchTerm =
    document.getElementById("searchInput")?.value.toLowerCase() || "";
  const teamFilter = document.getElementById("teamFilter")?.value || "";
  const statusFilter = document.getElementById("statusFilter")?.value || "";

  const stickers = document.querySelectorAll(".sticker-item");

  stickers.forEach((sticker) => {
    const id = sticker.dataset.id;
    const figurinha = appState.figurinhas[id];

    if (!figurinha) return;

    const matchesSearch =
      figurinha.nome.toLowerCase().includes(searchTerm) ||
      figurinha.numero.toString().includes(searchTerm);
    const matchesTeam = !teamFilter || figurinha.time === teamFilter;
    const matchesStatus = !statusFilter || figurinha.status === statusFilter;

    sticker.style.display =
      matchesSearch && matchesTeam && matchesStatus ? "flex" : "none";
  });

  // Mostrar/esconder accordions baseado nos resultados
  document.querySelectorAll(".accordion-item").forEach((item) => {
    const visibleStickers = item.querySelectorAll(
      '.sticker-item[style="display: flex;"], .sticker-item:not([style*="display: none"])',
    );
    item.style.display = visibleStickers.length > 0 ? "block" : "none";
  });
}

function toggleTeamFilter() {
  // Implementar filtro avançado se necessário
  showToast("Filtro avançado em breve!");
}

// ============================================
// UTILITÁRIOS
// ============================================

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.querySelector(".toast-message").textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function exportDuplicates() {
  const repetidas = Object.entries(appState.repetidas)
    .filter(([_, count]) => count > 0)
    .map(([id, count]) => {
      const f = appState.figurinhas[id];
      const time = CONFIG.times.find((t) => t.codigo === f.time);
      return `#${f.numero} - ${f.nome} (${time?.nome || f.time}) - ${count}x`;
    });

  if (repetidas.length === 0) {
    showToast("Nenhuma repetida para exportar");
    return;
  }

  const content = `MINHAS FIGURINHAS REPETIDAS - COPA 2026\n\n${repetidas.join("\n")}`;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "figurinhas-repetidas.txt";
  a.click();

  URL.revokeObjectURL(url);
  showToast("Lista exportada com sucesso!");
}

function exportData() {
  const data = JSON.stringify(appState, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "sticker-control-backup.json";
  a.click();

  URL.revokeObjectURL(url);
  showToast("Dados exportados!");
}

function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        appState = data;
        saveData();
        renderAll();
        showToast("Dados importados com sucesso!");
      } catch (err) {
        showToast("Erro ao importar dados");
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

function resetData() {
  if (confirm("Tem certeza que deseja resetar todos os dados?")) {
    localStorage.removeItem("stickerControlData");
    createSampleData();
    renderAll();
    showToast("Dados resetados!");
  }
}

// Resetar todas as figurinhas para faltante (álbum em branco)
async function resetAllStickers() {
  if (
    !confirm(
      "⚠️ ATENÇÃO!\n\nIsso vai zerar TODAS as suas figurinhas!\n\nO álbum ficará em branco como se você estivesse começando do zero.\n\nTem certeza?",
    )
  ) {
    return;
  }

  if (
    !confirm(
      "Confirmação final:\n\nDeseja realmente apagar todo o progresso e começar do zero?",
    )
  ) {
    return;
  }

  try {
    // Salvar accordions abertos
    const openAccordions = [];
    document.querySelectorAll(".accordion-content.open").forEach((acc) => {
      openAccordions.push(acc.id);
    });

    // Zerar todas as figurinhas
    Object.keys(appState.figurinhas).forEach((id) => {
      appState.figurinhas[id].status = "faltante";
      appState.figurinhas[id].quantidade = 0;
    });

    // Limpar repetidas
    appState.repetidas = {};

    // Limpar trocas
    appState.trocas = { oferecidas: [], desejadas: [] };

    // Salvar
    await saveData();
    renderAll();

    // Reabrir accordions
    openAccordions.forEach((accId) => {
      const content = document.getElementById(accId);
      if (content) {
        content.classList.add("open");
        const header = content.previousElementSibling;
        if (header) header.classList.add("active");
      }
    });

    showToast("🎉 Álbum zerado! Comece sua coleção do zero!");
  } catch (error) {
    console.error("Error resetting stickers:", error);
    showToast("Erro ao zerar álbum. Tente novamente.");
  }
}

function setupEventListeners() {
  // Header scroll effect
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".header");
    if (window.scrollY > 50) {
      header.style.background = "rgba(15, 15, 26, 0.95)";
    } else {
      header.style.background = "rgba(15, 15, 26, 0.8)";
    }
  });
}
