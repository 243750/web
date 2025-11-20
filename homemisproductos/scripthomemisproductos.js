// ===============================
// CONFIGURACIÓN Y PROTECCIÓN
// ===============================
const API_BASE = "http://52.200.165.176:7070/api";
const token = localStorage.getItem("userToken");
const rol = (localStorage.getItem("rol_usuario") || "").trim().toLowerCase();

if (!token || rol !== "empresa") {
  window.location.href = "../login/login.html";
}

// ===============================
// UTILIDAD: TOAST BONITO
// ===============================
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

// ===============================
// CARGAR PERFIL DEL VENDEDOR
// ===============================
async function cargarPerfil() {
  try {
    const res = await fetch(`${API_BASE}/vendedor/perfil`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.warn("No se pudo cargar el perfil del vendedor");
      return;
    }

    const data = await res.json();
    const img = document.getElementById("imgPerfilNav");
    if (img) {
      img.src = data.logo || "../img/defaultuser.png";
    }
  } catch (err) {
    console.error("Error perfil:", err);
  }
}

cargarPerfil();

// ===============================
// DROPDOWN PERFIL + LOGOUT
// ===============================
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

// ===============================
// CARGAR PRODUCTOS DEL VENDEDOR
// ===============================
let productosGlobales = [];

async function cargarMisProductos() {
  try {
    const res = await fetch(`${API_BASE}/vendedor/productos`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Error cargando productos:", res.status);
      showToast("No se pudieron cargar los productos.", "error");
      return;
    }

    productosGlobales = await res.json();
  const aprobados = productosGlobales.filter(
  p => p.estado_aprobacion && p.estado_aprobacion.toLowerCase() === "aprobado"
);

console.log("Filtrados (solo aprobados):", aprobados);

renderProductos(aprobados);

  } catch (err) {
    console.error("Error cargando productos:", err);
    showToast("Error de conexión al cargar productos.", "error");
  }
}

cargarMisProductos();

// ===============================
// RENDER DE PRODUCTOS
// ===============================
const contenedor = document.getElementById("productosContainer");

function renderProductos(lista) {
  if (!contenedor) return;

  // Tarjeta para agregar producto
  contenedor.innerHTML = `
    <div class="producto-card agregar-card"
         onclick="window.location.href='../agregarproducto/agregarproductos.html'">
      <div class="agregar-icon">+</div>
      <p>Agregar producto</p>
    </div>
  `;

  lista.forEach((p) => {
    contenedor.innerHTML += `
      <div class="producto-card">
        <img src="${p.imagen}" class="producto-img" alt="${p.nombre || "Producto"}">

        <p class="producto-nombre">${p.nombre}</p>
        <p class="producto-precio">$${p.precio}.00 MX</p>

        <div class="opciones">
          <img src="img/iconoeditar.png" alt="Editar" onclick="abrirModalEditar(${p.id_producto})">
          <img src="img/iconoborrar.png" alt="Eliminar" onclick="abrirModalEliminar(${p.id_producto})">
        </div>
      </div>
    `;
  });
}

// ===============================
// MODAL ELIMINAR PRODUCTO
// ===============================
const modalEliminar = document.getElementById("modalEliminar");
const btnCancelarEliminar = document.getElementById("btnCancelarEliminar");
const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");

let productoAEliminar = null;

function abrirModalEliminar(id) {
  productoAEliminar = id;
  if (modalEliminar) {
    modalEliminar.style.display = "flex";
  }
}

if (btnCancelarEliminar && modalEliminar) {
  btnCancelarEliminar.addEventListener("click", () => {
    productoAEliminar = null;
    modalEliminar.style.display = "none";
  });
}

if (btnConfirmarEliminar && modalEliminar) {
  btnConfirmarEliminar.addEventListener("click", async () => {
    if (productoAEliminar === null) return;

    try {
      const res = await fetch(
        `${API_BASE}/vendedor/productos/${productoAEliminar}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        console.error("Error eliminando producto:", res.status);
        showToast("No se pudo eliminar el producto.", "error");
        return;
      }

      showToast("Producto eliminado correctamente.", "success");
      modalEliminar.style.display = "none";
      productoAEliminar = null;
      cargarMisProductos();
    } catch (err) {
      console.error("Error eliminando producto:", err);
      showToast("Error de red al eliminar.", "error");
    }
  });
}

// Cerrar modal eliminar con clic afuera
if (modalEliminar) {
  modalEliminar.addEventListener("click", (e) => {
    if (e.target === modalEliminar) {
      modalEliminar.style.display = "none";
      productoAEliminar = null;
    }
  });
}

// ===============================
// MODAL EDITAR PRODUCTO
// ===============================
const modalEditar = document.getElementById("modalEditar");
const btnCancelarEditar = document.getElementById("btnCancelarEditar");
const btnGuardarEditar = document.getElementById("btnGuardarEditar");

const inputEditNombre = document.getElementById("editNombre");
const inputEditDescripcion = document.getElementById("editDescripcion");
const inputEditPrecio = document.getElementById("editPrecio");

let productoAEditar = null;

function abrirModalEditar(id) {
  const prod = productosGlobales.find((p) => p.id_producto === id);
  if (!prod) {
    showToast("No se encontró el producto a editar.", "error");
    return;
  }

  productoAEditar = id;

  if (inputEditNombre) inputEditNombre.value = prod.nombre || "";
  if (inputEditDescripcion)
    inputEditDescripcion.value = prod.descripcion || "";
  if (inputEditPrecio) inputEditPrecio.value = prod.precio || 0;

  if (modalEditar) {
    modalEditar.style.display = "flex";
  }
}

if (btnCancelarEditar && modalEditar) {
  btnCancelarEditar.addEventListener("click", () => {
    productoAEditar = null;
    modalEditar.style.display = "none";
  });
}

if (btnGuardarEditar && modalEditar) {
  btnGuardarEditar.addEventListener("click", async () => {
    if (productoAEditar === null) return;

    const nombre = inputEditNombre ? inputEditNombre.value.trim() : "";
    const descripcion = inputEditDescripcion
      ? inputEditDescripcion.value.trim()
      : "";
    const precioValor = inputEditPrecio ? inputEditPrecio.value.trim() : "";

    if (!nombre || !descripcion || !precioValor) {
      showToast("Completa todos los campos.", "error");
      return;
    }

    const precio = parseFloat(precioValor);
    if (isNaN(precio) || precio <= 0) {
      showToast("Precio inválido.", "error");
      return;
    }

    const body = {
      nombre,
      descripcion,
      precio,
    };

    try {
      const res = await fetch(
        `${API_BASE}/vendedor/productos/${productoAEditar}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Error editando producto:", res.status, data);
        showToast(
          data.error || "No se pudo actualizar el producto.",
          "error"
        );
        return;
      }

      showToast("Producto actualizado correctamente.", "success");
      modalEditar.style.display = "none";
      productoAEditar = null;
      cargarMisProductos();
    } catch (err) {
      console.error("Error editando producto:", err);
      showToast("Error de red al actualizar.", "error");
    }
  });
}

// Cerrar modal edición con clic afuera
if (modalEditar) {
  modalEditar.addEventListener("click", (e) => {
    if (e.target === modalEditar) {
      modalEditar.style.display = "none";
      productoAEditar = null;
    }
  });
}
