const API = "http://52.200.165.176:7070/api";
const token = localStorage.getItem("userToken");
const rol = localStorage.getItem("rol_usuario");

// PROTECCIÓN DE RUTA
if (!token || rol !== "empresa") {
    window.location.href = "../login/login.html";
}

// ELEMENTOS
const logoImg = document.getElementById("logoTienda");
const inputLogo = document.getElementById("inputLogo");
const nombreTienda = document.getElementById("nombreTienda");
const descripcionTienda = document.getElementById("descripcionTienda");
const btnGuardar = document.getElementById("btnGuardar");
const imgPerfilNav = document.getElementById("imgPerfilNav");

// TOAST
const toast = document.getElementById("toast");

function showToast(msg, tipo = "success") {
  toast.textContent = msg;
  toast.className = "toast " + tipo + " show";

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// ================================
// DROPDOWN PERFIL
// ================================
const perfilArea = document.querySelector(".perfil-area");
const perfilMenu = document.getElementById("perfilMenu");
const logoutBtn = document.getElementById("logoutBtn");

if (perfilArea && perfilMenu) {
  perfilArea.addEventListener("click", (e) => {
    e.stopPropagation();
    perfilArea.classList.toggle("show");
  });

  window.addEventListener("click", (e) => {
    if (!perfilArea.contains(e.target)) {
      perfilArea.classList.remove("show");
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../login/login.html";
  });
}

// ================================
// CARGAR PERFIL DEL VENDEDOR
// ================================
async function cargarPerfil() {
  try {
    const res = await fetch(`${API}/vendedor/perfil`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    console.log("Perfil cargado:", data);

    // Mostrar imagen
    logoImg.src = data.logo || "../img/defaultuser.png";
    imgPerfilNav.src = data.logo || "../img/defaultuser.png";

    // Nombre correcto del backend
    nombreTienda.value = data.nombre_comercial || "";

    // Descripción
    descripcionTienda.value = data.descripcion || "";

  } catch (err) {
    console.error(err);
    showToast("No se pudo cargar el perfil.", "error");
  }
}

// ================================
// ACTUALIZAR PERFIL
// ================================
btnGuardar.addEventListener("click", async () => {

  const formData = new FormData();
  formData.append("nombre_tienda", nombreTienda.value);
  formData.append("descripcion", descripcionTienda.value);

  if (inputLogo.files.length > 0) {
    formData.append("logo", inputLogo.files[0]);
  }

  try {
    const res = await fetch(`${API}/vendedor/perfil`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      showToast("Perfil actualizado correctamente.", "success");
      setTimeout(() => window.location.reload(), 1200);
    } else {
      showToast("No se pudo actualizar el perfil.", "error");
    }

  } catch (err) {
    console.error(err);
    showToast("Error de red al actualizar el perfil.", "error");
  }
});

// Ejecutar
cargarPerfil();
