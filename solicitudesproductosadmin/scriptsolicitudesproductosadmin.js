const token = localStorage.getItem("userToken");
const rol = (localStorage.getItem("rol_usuario") || "").toLowerCase();
const API_BASE = "http://52.200.165.176:7070/api";

if (!token || rol !== "admin") {
  window.location.href = "../login/login.html";
}

const container = document.getElementById("productsContainer");

// CARGAR SOLICITUDES
async function cargarProductosPendientes() {
  try {
    const res = await fetch(`${API_BASE}/admin/productos/pendientes`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    console.log("Productos pendientes:", data);

    renderProductos(data);

  } catch (err) {
    console.error("❌ Error cargando solicitudes:", err);
  }
}

function renderProductos(lista) {
  if (!lista || lista.length === 0) {
    container.innerHTML = `<p style="text-align:center;">No hay productos pendientes.</p>`;
    return;
  }

  container.innerHTML = lista
    .map(p => `
      <div class="product-card">
        <img src="${p.imagen || "../img/default.png"}" class="product-img">

        <p class="product-name">${p.nombre}</p>
        <p class="product-price">$${p.precio}.00 MX</p>
        <p class="product-owner">${p.nombre_vendedor || "Sin vendedor"}</p>

        <div class="btn-group">
          <button class="btn-aceptar" data-id="${p.id_producto}">Aceptar</button>
          <button class="btn-rechazar" data-id="${p.id_producto}">Rechazar</button>
        </div>
      </div>
    `)
    .join("");

  document.querySelectorAll(".btn-aceptar").forEach(btn =>
    btn.addEventListener("click", () => confirmarAccion(btn.dataset.id, true))
  );

  document.querySelectorAll(".btn-rechazar").forEach(btn =>
    btn.addEventListener("click", () => confirmarAccion(btn.dataset.id, false))
  );
}

// ALERT
function confirmarAccion(id, aprobar) {
  Swal.fire({
    title: aprobar ? "¿Aprobar producto?" : "¿Rechazar producto?",
    icon: aprobar ? "success" : "error",
    showCancelButton: true,
    confirmButtonText: aprobar ? "Aprobar" : "Rechazar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: aprobar ? "#6B1FAD" : "#d9534f",
    cancelButtonColor: "#555"
  }).then(result => {
    if (result.isConfirmed) {
      aprobar ? aprobarProducto(id) : rechazarProducto(id);
    }
  });
}

// APIS
async function aprobarProducto(id) {
  await fetch(`${API_BASE}/admin/productos/${id}/aprobar`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });

  Swal.fire("Aprobado!", "El producto fue aprobado.", "success");
  cargarProductosPendientes();
}

async function rechazarProducto(id) {
  await fetch(`${API_BASE}/admin/productos/${id}/rechazar`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });

  Swal.fire("Rechazado!", "El producto fue rechazado.", "info");
  cargarProductosPendientes();
}

// INIT
cargarProductosPendientes();
