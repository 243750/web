// ===========================
// VALIDACIÓN ADMIN
// ===========================
const token = localStorage.getItem("userToken");
const rol = (localStorage.getItem("rol_usuario") || "").toLowerCase();

if (!token || rol !== "admin") {
  window.location.href = "../login/login.html";
}

const API_BASE = "http://52.200.165.176:7070/api";

// ===========================
// NAVBAR: DROPDOWN + LOGOUT
// ===========================
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

// ===========================
// CARGAR SOLICITUDES PENDIENTES
// ===========================
const vendorsContainer = document.getElementById("vendorsContainer");

async function cargarSolicitudes() {
  try {
    const res = await fetch(`${API_BASE}/admin/empresas/pendientes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Error HTTP:", res.status);
      vendorsContainer.innerHTML =
        "<p>No se pudieron cargar las solicitudes.</p>";
      return;
    }

    const data = await res.json();
    console.log("Solicitudes pendientes:", data);
    renderSolicitudes(Array.isArray(data) ? data : []);

  } catch (err) {
    console.error("❌ Error cargando solicitudes:", err);
    vendorsContainer.innerHTML =
      "<p>Error de conexión al cargar solicitudes.</p>";
  }
}

function renderSolicitudes(lista) {
  if (!lista.length) {
    vendorsContainer.innerHTML =
      '<p style="margin-top:20px">No hay solicitudes pendientes.</p>';
    return;
  }

  const defaultLogo = "../homecliente/img/defaultuser.png";

  vendorsContainer.innerHTML = lista
    .map(
      (e) => `
      <div class="vendor-card">
        <div class="vendor-circle"
             style="background-image:url('${
               e.logo && e.logo.trim() ? e.logo : defaultLogo
             }')">
        </div>

        <p class="vendor-name">${e.nombre_comercial}</p>

        <div class="actions-row">
          <button class="action-btn btn-aceptar" data-id="${e.id_empresa}" data-action="aprobar">
            Aceptar
          </button>
          <button class="action-btn btn-rechazar" data-id="${e.id_empresa}" data-action="rechazar">
            Rechazar
          </button>
        </div>
      </div>
    `
    )
    .join("");

  // Listeners para los botones
  document
    .querySelectorAll(".action-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        abrirModalConfirm(btn.dataset.id, btn.dataset.action)
      )
    );
}

// ===========================
// MODAL DE CONFIRMACIÓN
// ===========================
const modal = document.getElementById("modalConfirm");
const modalMensaje = document.getElementById("modalMensaje");
const btnModalConfirm = document.getElementById("btnModalConfirm");
const btnModalCancel = document.getElementById("btnModalCancel");

let empresaSeleccionada = null;
let accionSeleccionada = null; // "aprobar" | "rechazar"

function abrirModalConfirm(idEmpresa, accion) {
  empresaSeleccionada = idEmpresa;
  accionSeleccionada = accion;

  if (accion === "aprobar") {
    modalMensaje.textContent = "¿Seguro que deseas APROBAR este vendedor?";
    btnModalConfirm.textContent = "Aprobar";
  } else {
    modalMensaje.textContent = "¿Seguro que deseas RECHAZAR este vendedor?";
    btnModalConfirm.textContent = "Rechazar";
  }

  modal.style.display = "flex";
}

function cerrarModal() {
  modal.style.display = "none";
  empresaSeleccionada = null;
  accionSeleccionada = null;
}

btnModalCancel.addEventListener("click", cerrarModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});

btnModalConfirm.addEventListener("click", async () => {
  if (!empresaSeleccionada || !accionSeleccionada) return;

  if (accionSeleccionada === "aprobar") {
    await aprobarVendedor(empresaSeleccionada);
  } else {
    await rechazarVendedor(empresaSeleccionada);
  }

  cerrarModal();
  cargarSolicitudes(); // refresca la lista
});

// ===========================
// LLAMADAS A LA API
// ===========================
async function aprobarVendedor(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/empresas/${id}/aprobar`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Error aprobando:", res.status);
      alert("No se pudo aprobar el vendedor.");
      return;
    }

    console.log("Vendedor aprobado:", id);
  } catch (err) {
    console.error("❌ Error aprobando:", err);
  }
}

async function rechazarVendedor(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/empresas/${id}/rechazar`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Error rechazando:", res.status);
      alert("No se pudo rechazar el vendedor.");
      return;
    }

    console.log("Vendedor rechazado:", id);
  } catch (err) {
    console.error("❌ Error rechazando:", err);
  }
}

// ===========================
// INIT
// ===========================
cargarSolicitudes();
