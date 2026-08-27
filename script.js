import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, setPersistence, browserLocalPersistence, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfHLrtPMnLtfU-PvsVf5QCOXKmuZya51I",
  authDomain: "loner-hq.firebaseapp.com",
  projectId: "loner-hq",
  storageBucket: "loner-hq.firebasestorage.app",
  messagingSenderId: "290842361996",
  appId: "1:290842361996:web:f1010f32a520a7148f7ba9",
  measurementId: "G-0X2Y1KQFEE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const landing = document.querySelector("#landing");
const profile = document.querySelector("#profile");
const loginButton = document.querySelector("#google-login");
const logoutButton = document.querySelector("#logout");
const authMessage = document.querySelector("#auth-message");
const playerPhoto = document.querySelector("#header-player-photo");
const accountHud = document.querySelector("#account-hud");
const tabs = document.querySelectorAll(".profile-tab");
const tabPanels = document.querySelectorAll(".tab-panel");
const inventoryGrid = document.querySelector("#inventory-grid");

for (let slot = 1; slot <= 32; slot += 1) {
  const inventorySlot = document.createElement("button");
  inventorySlot.type = "button";
  inventorySlot.className = "inventory-slot";
  inventorySlot.setAttribute("aria-label", `Espaço ${slot} do inventário, vazio`);
  inventorySlot.dataset.slot = slot;
  inventoryGrid.appendChild(inventorySlot);
}

function fallbackAvatar(name) {
  const initial = name.trim().charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="#242820"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#e0c17e" font-family="serif" font-size="72">${initial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function showProfile(user) {
  playerPhoto.src = user.photoURL || fallbackAvatar(user.displayName || "L");
  landing.classList.add("hidden");
  profile.classList.remove("hidden");
  accountHud.classList.remove("hidden");
  document.title = `${user.displayName || "Perfil"} — Loner`;
}

function showLanding() {
  profile.classList.add("hidden");
  landing.classList.remove("hidden");
  accountHud.classList.add("hidden");
  document.title = "Loner — Sua história começa aqui";
}

function friendlyError(error) {
  const messages = {
    "auth/popup-closed-by-user": "A janela de login foi fechada antes de concluir.",
    "auth/popup-blocked": "O navegador bloqueou a janela. Libere pop-ups e tente novamente.",
    "auth/unauthorized-domain": "Este endereço ainda não foi autorizado no Firebase.",
    "auth/network-request-failed": "Sem conexão com o Google. Verifique sua internet."
  };
  return messages[error.code] || "Não foi possível entrar agora. Tente novamente.";
}

loginButton.addEventListener("click", async () => {
  loginButton.disabled = true;
  authMessage.textContent = "Abrindo o portal do Google...";
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithPopup(auth, provider);
    authMessage.textContent = "";
  } catch (error) {
    console.error("Falha no login:", error);
    authMessage.textContent = friendlyError(error);
  } finally { loginButton.disabled = false; }
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  try { await signOut(auth); } finally { logoutButton.disabled = false; }
});

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-selected", String(selected));
    });
    tabPanels.forEach(panel => {
      const selected = panel.id === `tab-${tab.dataset.tab}`;
      panel.classList.toggle("active", selected);
      panel.hidden = !selected;
    });
  });
});
onAuthStateChanged(auth, user => user ? showProfile(user) : showLanding());
