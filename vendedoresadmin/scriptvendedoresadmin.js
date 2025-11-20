// =====================
// VALIDACIÓN ADMIN
// =====================
const token = localStorage.getItem("userToken");
const rol = (localStorage.getItem("rol_usuario") || "").toLowerCase();

if (!token || rol !== "admin") {
  window.location.href = "../login/login.html";
}

const API_BASE = "http://52.200.165.176:7070/api";

const API_EMPRESAS_APROBADAS = `${API_BASE}/admin/empresas/aprobadas`;
const API_SUSPENDER_EMPRESA = (id) =>
  `${API_BASE}/admin/empresas/${id}/suspender`;

// =====================
// NAVBAR / PERFIL
// =====================
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

// Botón solicitudes -> redirige
const btnSolicitudes = document.getElementById("btnSolicitudes");
if (btnSolicitudes) {
  btnSolicitudes.addEventListener("click", () => {
    window.location.href = "../solicitudesadmin/solicitudesadmin.html";
  });
}

// =====================
// TOAST
// =====================
const toast = document.getElementById("toast");
let toastTimeout = null;

function showToast(mensaje, tipo = "success") {
  if (!toast) return;
  toast.textContent = mensaje;
  toast.className = "toast " + tipo + " show";

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// =====================
// MODAL SUSPENDER
// =====================
const modalSuspender = document.getElementById("modalSuspender");
const btnCancelarSusp = document.getElementById("btnCancelarSusp");
const btnConfirmarSusp = document.getElementById("btnConfirmarSusp");

let empresaSeleccionada = null;

function abrirModalSuspender(idEmpresa) {
  empresaSeleccionada = idEmpresa;
  if (modalSuspender) modalSuspender.style.display = "flex";
}

function cerrarModalSuspender() {
  empresaSeleccionada = null;
  if (modalSuspender) modalSuspender.style.display = "none";
}

if (btnCancelarSusp && modalSuspender) {
  btnCancelarSusp.addEventListener("click", cerrarModalSuspender);
}

if (modalSuspender) {
  modalSuspender.addEventListener("click", (e) => {
    if (e.target === modalSuspender) cerrarModalSuspender();
  });
}

if (btnConfirmarSusp) {
  btnConfirmarSusp.addEventListener("click", async () => {
    if (!empresaSeleccionada) return;

    try {
      const res = await fetch(API_SUSPENDER_EMPRESA(empresaSeleccionada), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Error al suspender:", res.status);
        showToast("No se pudo suspender al vendedor.", "error");
        return;
      }

      showToast("Vendedor suspendido correctamente.", "success");
      cerrarModalSuspender();
      await cargarEmpresas();
    } catch (err) {
      console.error("Error al suspender:", err);
      showToast("Error de red al suspender.", "error");
    }
  });
}

// =====================
// CARGAR EMPRESAS APROBADAS
// =====================
const vendorsContainer = document.getElementById("vendorsContainer");

async function cargarEmpresas() {
  try {
    const res = await fetch(API_EMPRESAS_APROBADAS, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Error cargando empresas:", res.status);
      vendorsContainer.innerHTML = "<p>No se pudieron cargar los vendedores.</p>";
      return;
    }

    const empresas = await res.json();
    renderEmpresas(empresas);
  } catch (err) {
    console.error("Error cargando empresas:", err);
    vendorsContainer.innerHTML = "<p>Error de conexión.</p>";
  }
}

function renderEmpresas(lista) {
  if (!vendorsContainer) return;

  if (!lista || lista.length === 0) {
    vendorsContainer.innerHTML = "<p>No hay vendedores activos.</p>";
    return;
  }

  vendorsContainer.innerHTML = lista
    .map(
      (e) => `
      <div class="vendor-card">
        <div class="vendor-circle"
             style="background-image: url('${e.logo || "../homecliente/img/defaultuser.png"}')"></div>
        <button class="suspend-btn" data-id="${e.id_empresa}" title="Suspender vendedor">
          <span>⛔</span>
        </button>
        <p class="vendor-name">${e.nombre_comercial || "Sin nombre"}</p>
      </div>
    `
    )
    .join("");

  // Listeners de los íconos de suspender
  document.querySelectorAll(".suspend-btn").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const id = btn.getAttribute("data-id");
      abrirModalSuspender(id);
    });
  });
}

// =====================
// INIT
// =====================
cargarEmpresas();
