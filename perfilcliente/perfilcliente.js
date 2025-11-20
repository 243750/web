// ===============================
// CONFIGURACIÓN GENERAL
// ===============================
const API_BASE = "http://52.200.165.176:7070/api";
const token = localStorage.getItem("userToken");
const rol = localStorage.getItem("rol_usuario");

if (!token || rol !== "cliente") {
  window.location.href = "../login/login.html";
}

// ===============================
// TOAST BONITO
// ===============================
function toast(msg) {
  let t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);

  setTimeout(() => t.classList.add("show"), 50);

  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, 2200);
}

// ===============================
// ELEMENTOS DOM
// ===============================
const emailInput = document.getElementById("emailInput");
const usernameInput = document.getElementById("usernameInput");

const usernameTop = document.getElementById("usernameTop");
const emailTop = document.getElementById("emailTop");

const btnGuardar = document.getElementById("btnGuardar");

// ===============================
// CARGAR DATOS DEL PERFIL
// ===============================
async function cargarPerfil() {
  try {
    const res = await fetch(`${API_BASE}/cliente/perfil`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      toast("Error cargando datos");
      return;
    }

    const data = await res.json();

    const nombre = data.nombre ?? "Mi Usuario";
    const correo = data.correo ?? "correo@correo.com";

    emailInput.value = correo;
    usernameInput.value = nombre;

    usernameTop.textContent = nombre;
    emailTop.textContent = correo;

  } catch (err) {
    console.error("Error cargando perfil:", err);
    toast("Error en la conexión");
  }
}

// ===============================
// GUARDAR CAMBIOS
// ===============================
btnGuardar.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const username = usernameInput.value.trim();

  if (!email || !username) {
    toast("Completa todos los campos");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cliente/perfil`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        correo: email,
        nombre: username,
      }),
    });

    if (!res.ok) {
      toast("No se pudo guardar");
      return;
    }

    toast("Cambios guardados ✔");

    usernameTop.textContent = username;
    emailTop.textContent = email;

  } catch (err) {
    console.error("Error guardando:", err);
    toast("Error al guardar");
  }
});

// ===============================
// INICIALIZAR
// ===============================
cargarPerfil();
