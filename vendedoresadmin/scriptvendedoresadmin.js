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
const API_REACTIVAR_EMPRESA = (id) =>
  `${API_BASE}/admin/empresas/${id}/reactivar`;

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

// Botón solicitudes
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
  }, 2400);
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

if (btnCancelarSusp) {
  btnCancelarSusp.addEventListener("click", cerrarModalSuspender);
}

if (modalSuspender) {
  modalSuspender.addEventListener("click", (e) => {
    if (e.target === modalSuspender) cerrarModalSuspender();
  });
}

// SUSPENDER (con modal)
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
        showToast("No se pudo suspender al vendedor.", "error");
        return;
      }

      showToast("Vendedor suspendido.", "success");
      cerrarModalSuspender();
      await cargarEmpresas();
    } catch (err) {
      showToast("Error de red.", "error");
    }
  });
}

// =====================
// REACTIVAR DIRECTO
// =====================
async function reactivarVendedor(idEmpresa) {
  try {
    const res = await fetch(API_REACTIVAR_EMPRESA(idEmpresa), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      showToast("No se pudo reactivar.", "error");
      return;
    }

    showToast("Vendedor reactivado.", "success");
    await cargarEmpresas();
  } catch (err) {
    showToast("Error de conexión.", "error");
  }
}

// =====================
// CARGAR EMPRESAS
// =====================
const vendorsContainer = document.getElementById("vendorsContainer");

async function cargarEmpresas() {
  if (!vendorsContainer) return;

  try {
    const res = await fetch(API_EMPRESAS_APROBADAS, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      vendorsContainer.innerHTML =
        "<p>No se pudieron cargar los vendedores.</p>";
      return;
    }

    const empresas = await res.json();
    renderEmpresas(empresas);
  } catch (err) {
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
    .map((e) => {
      const estadoCuenta = e.estado_cuenta || "sin datos";

      // Botón dinámico: rojo para suspender, verde para reactivar
      const boton =
        estadoCuenta === "suspendido"
          ? `
        <button class="suspend-btn"
                style="background:#e3ffe3;border-color:#2e7d32;"
                data-reactivar="${e.id_empresa}"
                title="Reactivar vendedor">
          <span style="color:#2e7d32;">🔄</span>
        </button>`
          : `
        <button class="suspend-btn"
                data-id="${e.id_empresa}"
                title="Suspender vendedor">
          <span>⛔</span>
        </button>`;

      return `
      <div class="vendor-card">
        <div class="vendor-circle"
             style="background-image:url('${
               e.logo || "../homecliente/img/defaultuser.png"
             }')">
        </div>

        ${boton}

        <p class="vendor-name">${e.nombre_comercial || "Sin nombre"}</p>

        <p class="vendor-status">
          Estado: <strong>${estadoCuenta}</strong>
        </p>
      </div>`;
    })
    .join("");

  // Botones suspender
  document.querySelectorAll(".suspend-btn[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      abrirModalSuspender(btn.getAttribute("data-id"));
    });
  });

  // Botones reactivar
  document.querySelectorAll(".suspend-btn[data-reactivar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-reactivar");
      reactivarVendedor(id);
    });
  });
}

// =====================
// INIT
// =====================
cargarEmpresas();
