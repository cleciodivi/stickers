// Admin Panel JavaScript

const ADMIN_EMAIL = "cleciovromana@gmail.com";

// DOM Elements - will be initialized after DOM is ready
let loginScreen,
  dashboardScreen,
  adminLoginForm,
  errorMessage,
  usersTableBody,
  loadingMessage,
  emptyMessage;

// Initialize DOM elements
function initDOMElements() {
  loginScreen = document.getElementById("loginScreen");
  dashboardScreen = document.getElementById("dashboardScreen");
  adminLoginForm = document.getElementById("adminLoginForm");
  errorMessage = document.getElementById("errorMessage");
  usersTableBody = document.getElementById("usersTableBody");
  loadingMessage = document.getElementById("loadingMessage");
  emptyMessage = document.getElementById("emptyMessage");

  console.log("DOM Elements initialized:", {
    loginScreen: !!loginScreen,
    dashboardScreen: !!dashboardScreen,
    usersTableBody: !!usersTableBody,
  });
}

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded");
  initDOMElements();
  setupEventListeners();
});

function setupEventListeners() {
  // Login Form
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearError();

      const email = document.getElementById("adminEmail").value;
      const password = document.getElementById("adminPassword").value;

      // Check if it's the admin email
      if (email !== ADMIN_EMAIL) {
        showError("Acesso negado. Apenas administradores podem acessar.");
        return;
      }

      try {
        const userCredential = await auth.signInWithEmailAndPassword(
          email,
          password,
        );
        const user = userCredential.user;

        if (user.email === ADMIN_EMAIL) {
          showDashboard(user);
        } else {
          await auth.signOut();
          showError("Acesso negado.");
        }
      } catch (error) {
        console.error("Login error:", error);
        let message = "Erro ao fazer login.";
        switch (error.code) {
          case "auth/user-not-found":
            message = "Usuário não encontrado.";
            break;
          case "auth/wrong-password":
            message = "Senha incorreta.";
            break;
          case "auth/invalid-email":
            message = "E-mail inválido.";
            break;
          case "auth/too-many-requests":
            message = "Muitas tentativas. Tente novamente mais tarde.";
            break;
        }
        showError(message);
      }
    });
  }
}

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
  console.log("Auth state changed:", user?.email);
  if (user) {
    if (user.email === ADMIN_EMAIL) {
      // Make sure DOM is ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          initDOMElements();
          showDashboard(user);
        });
      } else {
        initDOMElements();
        showDashboard(user);
      }
    } else {
      // Not admin, logout
      auth.signOut();
      showError("Acesso restrito ao administrador.");
    }
  }
});

function showDashboard(user) {
  loginScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");

  document.getElementById("adminUserName").textContent =
    user.displayName || user.email;

  loadUsers();
  loadStats();
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("show");
}

function clearError() {
  errorMessage.classList.remove("show");
  errorMessage.textContent = "";
}

async function logout() {
  try {
    await auth.signOut();
    loginScreen.classList.remove("hidden");
    dashboardScreen.classList.add("hidden");
    adminLoginForm.reset();
  } catch (error) {
    console.error("Logout error:", error);
  }
}

async function loadUsers() {
  loadingMessage.classList.add("show");
  emptyMessage.classList.remove("show");
  usersTableBody.innerHTML = "";

  try {
    console.log("Loading users...");
    console.log("Current user:", auth.currentUser?.email);

    // Simple query without orderBy first
    const snapshot = await db.collection("users").get();
    console.log("Users loaded:", snapshot.size);

    loadingMessage.classList.remove("show");

    if (snapshot.empty) {
      console.log("No users found in database");
      emptyMessage.classList.add("show");
      return;
    }

    const users = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("User doc:", doc.id, data);
      users.push({
        id: doc.id,
        ...data,
      });
    });

    console.log("Total users to render:", users.length);
    renderUsersTable(users);
  } catch (error) {
    console.error("Error loading users:", error);
    loadingMessage.classList.remove("show");
    showError("Erro ao carregar usuários: " + error.message);
  }
}

function renderUsersTable(users) {
  console.log("Rendering users table:", users);

  const tbody = document.getElementById("usersTableBody");
  console.log("Table body element:", tbody);

  if (!tbody) {
    console.error("ERROR: Table body not found!");
    return;
  }

  // Limpar conteúdo
  tbody.innerHTML = "";

  if (!users || users.length === 0) {
    console.log("No users to render");
    if (emptyMessage) emptyMessage.classList.add("show");
    return;
  }

  console.log("Rendering", users.length, "users");

  // Criar HTML diretamente
  let html = "";
  users.forEach((user, index) => {
    console.log("Processing user", index, ":", user);
    console.log("User keys:", Object.keys(user));
    console.log("User data:", JSON.stringify(user, null, 2));

    const userName = user.name || `Usuário ${user.id.substring(0, 8)}...`;
    const userEmail = user.email || "Email não disponível";

    // Contar figurinhas
    const figurinhas = user.figurinhas || {};
    const possuidas = Object.values(figurinhas).filter(
      (f) => f && (f.status === "possuida" || f.status === "repetida"),
    ).length;

    // Formatar data
    let createdAt = "N/A";
    if (user.createdAt) {
      try {
        if (user.createdAt.toDate) {
          createdAt = formatDate(user.createdAt.toDate());
        } else if (user.createdAt.seconds) {
          createdAt = formatDate(new Date(user.createdAt.seconds * 1000));
        }
      } catch (e) {
        console.error("Error formatting date:", e);
      }
    }

    // Status do usuário
    const statusHtml = user.blocked
      ? '<span style="color: #ef4444; font-weight: 600;">🔴 Bloqueado</span>'
      : '<span style="color: #10b981; font-weight: 600;">🟢 Ativo</span>';

    html += `
      <tr>
        <td>
          <div style="font-weight: 600; color: white;">${userName}</div>
          <div style="color: rgba(255,255,255,0.7); font-size: 13px;">${userEmail}</div>
        </td>
        <td>${userEmail}</td>
        <td style="color: rgba(255,255,255,0.7); font-size: 13px;">${createdAt}</td>
        <td>${statusHtml}</td>
        <td><span style="color: #00d4aa; font-weight: 700;">${possuidas}</span></td>
        <td>
          <button onclick="viewUserDetails('${user.id}')" 
                  style="background: rgba(0,212,170,0.1); border: 1px solid rgba(0,212,170,0.3); 
                         color: #00d4aa; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 8px;">Ver</button>
          <button onclick="toggleBlockUser('${user.id}', ${user.blocked || false})" 
                  style="background: ${user.blocked ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)"}; 
                         border: 1px solid ${user.blocked ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}; 
                         color: ${user.blocked ? "#10b981" : "#f59e0b"}; padding: 6px 12px; border-radius: 6px; cursor: pointer;">${user.blocked ? "Desbloquear" : "Bloquear"}</button>
        </td>
      </tr>
    `;
  });

  console.log("Generated HTML length:", html.length);

  tbody.innerHTML = html;

  console.log("Table updated, rows:", tbody.children.length);
}

async function loadStats() {
  try {
    // Total users
    const usersSnapshot = await db.collection("users").get();
    document.getElementById("totalUsers").textContent = usersSnapshot.size;

    // Today's registrations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySnapshot = await db
      .collection("users")
      .where("createdAt", ">=", today)
      .get();
    document.getElementById("todayUsers").textContent = todaySnapshot.size;

    // Total stickers (sum of all users)
    let totalStickers = 0;
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      const figurinhas = data.figurinhas || {};
      totalStickers += Object.values(figurinhas).filter(
        (f) => f.status === "possuida" || f.status === "repetida",
      ).length;
    });
    document.getElementById("totalStickers").textContent = totalStickers;
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

function formatDate(date) {
  if (!date) return "N/A";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

async function viewUserDetails(userId) {
  try {
    const doc = await db.collection("users").doc(userId).get();
    if (doc.exists) {
      const data = doc.data();
      const figurinhas = data.figurinhas || {};
      const possuidas = Object.values(figurinhas).filter(
        (f) => f.status === "possuida" || f.status === "repetida",
      ).length;
      const faltantes = Object.values(figurinhas).filter(
        (f) => f.status === "faltante",
      ).length;
      const repetidas = Object.values(data.repetidas || {}).reduce(
        (a, b) => a + b,
        0,
      );

      const status = data.blocked ? "🔴 BLOQUEADO" : "🟢 ATIVO";

      alert(`Detalhes do usuário:

Nome: ${data.name || "N/A"}
E-mail: ${data.email || "N/A"}
Status: ${status}

Figurinhas:
- Possuídas: ${possuidas}
- Faltantes: ${faltantes}
- Repetidas: ${repetidas}

Cadastrado em: ${data.createdAt ? formatDate(data.createdAt.toDate()) : "N/A"}`);
    }
  } catch (error) {
    console.error("Error viewing user:", error);
    alert("Erro ao carregar detalhes do usuário.");
  }
}

// Bloquear/Desbloquear usuário
async function toggleBlockUser(userId, currentlyBlocked) {
  const action = currentlyBlocked ? "desbloquear" : "bloquear";

  if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) {
    return;
  }

  try {
    await db
      .collection("users")
      .doc(userId)
      .update({
        blocked: !currentlyBlocked,
        blockedAt: !currentlyBlocked
          ? firebase.firestore.FieldValue.serverTimestamp()
          : null,
      });

    alert(
      `Usuário ${currentlyBlocked ? "desbloqueado" : "bloqueado"} com sucesso!`,
    );
    loadUsers(); // Recarregar lista
  } catch (error) {
    console.error("Error blocking/unblocking user:", error);
    alert("Erro ao alterar status do usuário.");
  }
}
