// Login and Register functionality

// DOM Elements
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegisterLink = document.getElementById("showRegister");
const showLoginLink = document.getElementById("showLogin");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const loading = document.getElementById("loading");

// Toggle between login and register forms
showRegisterLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  clearMessages();
});

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  clearMessages();
});

// Clear messages
function clearMessages() {
  errorMessage.classList.remove("show");
  successMessage.classList.remove("show");
  errorMessage.textContent = "";
  successMessage.textContent = "";
}

// Show error
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("show");
  successMessage.classList.remove("show");
  loading.classList.remove("show");
}

// Show success
function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.add("show");
  errorMessage.classList.remove("show");
}

// Show loading
function showLoading() {
  loading.classList.add("show");
  errorMessage.classList.remove("show");
}

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
  showLoading();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;

    // Verificar se usuário está bloqueado
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (userDoc.exists && userDoc.data().blocked) {
      await auth.signOut();
      showError(
        "Sua conta foi bloqueada. Entre em contato com o administrador.",
      );
      return;
    }

    showSuccess("Login realizado com sucesso! Redirecionando...");

    // Redirect to main app after a short delay
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (error) {
    console.error("Login error:", error);

    // Handle specific errors
    let message = "Erro ao fazer login. Tente novamente.";
    switch (error.code) {
      case "auth/user-not-found":
        message = "Usuário não encontrado. Verifique seu e-mail.";
        break;
      case "auth/wrong-password":
        message = "Senha incorreta. Tente novamente.";
        break;
      case "auth/invalid-email":
        message = "E-mail inválido. Verifique o formato.";
        break;
      case "auth/too-many-requests":
        message = "Muitas tentativas. Tente novamente mais tarde.";
        break;
    }
    showError(message);
  }
});

// Register
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
  showLoading();

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const passwordConfirm = document.getElementById(
    "registerPasswordConfirm",
  ).value;

  // Validate passwords match
  if (password !== passwordConfirm) {
    showError("As senhas não coincidem.");
    return;
  }

  // Validate password length
  if (password.length < 6) {
    showError("A senha deve ter pelo menos 6 caracteres.");
    return;
  }

  try {
    // Create user
    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;

    // Update profile with name
    await user.updateProfile({
      displayName: name,
    });

    // Create user document in Firestore
    console.log("Creating user document for:", user.uid);
    await db
      .collection("users")
      .doc(user.uid)
      .set({
        name: name,
        email: email,
        figurinhas: {},
        repetidas: {},
        trocas: { oferecidas: [], desejadas: [] },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      });
    console.log("User document created successfully");

    showSuccess("Conta criada com sucesso! Redirecionando...");

    // Redirect to main app after a short delay
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  } catch (error) {
    console.error("Register error:", error);

    // Handle specific errors
    let message = "Erro ao criar conta. Tente novamente.";
    switch (error.code) {
      case "auth/email-already-in-use":
        message = "Este e-mail já está cadastrado. Faça login.";
        break;
      case "auth/invalid-email":
        message = "E-mail inválido. Verifique o formato.";
        break;
      case "auth/weak-password":
        message = "Senha muito fraca. Use pelo menos 6 caracteres.";
        break;
    }
    showError(message);
  }
});

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is logged in, redirect to main app
    window.location.href = "index.html";
  }
});
