// ===============================
// CONFIGURACIÓN Y PROTECCIÓN
// ===============================
const API_BASE = "http://52.200.165.176:7070/api";
const token = localStorage.getItem("userToken");
const rol = (localStorage.getItem("rol_usuario") || "").trim().toLowerCase();

// Debugging: Verificar token
console.log("Token encontrado:", token ? "Sí" : "No");
console.log("Longitud del token:", token ? token.length : 0);
console.log("Primeros caracteres del token:", token ? token.substring(0, 20) + "..." : "N/A");

if (!token || rol !== "empresa") {
  console.error("Redirigiendo - Token:", !!token, "Rol:", rol);
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
// FUNCIÓN AUXILIAR PARA FETCH
// ===============================
async function fetchConToken(url, opciones = {}) {
  const headers = {
    ...opciones.headers,
    Authorization: `Bearer ${token}`,
  };

  console.log("🔵 Petición a:", url);
  console.log("🔵 Método:", opciones.method || "GET");
  console.log("🔵 Headers:", headers);

  const res = await fetch(url, { ...opciones, headers });

  console.log("🟢 Respuesta status:", res.status);

  // Si es 401, token inválido o expirado
  if (res.status === 401) {
    console.error("❌ Token inválido o expirado. Redirigiendo al login...");
    
    // Intentar obtener más info del error
    try {
      const errorData = await res.json();
      console.error("❌ Detalle del error:", errorData);
    } catch (e) {
      const errorText = await res.text();
      console.error("❌ Respuesta del servidor:", errorText);
    }
    
    localStorage.removeItem("userToken");
    localStorage.removeItem("rol_usuario");
    
    alert("Tu sesión ha expirado. Serás redirigido al login.");
    window.location.href = "../login/login.html";
    throw new Error("Token inválido");
  }

  return res;
}

// ===============================
// CARGAR PERFIL DEL VENDEDOR
// ===============================
async function cargarPerfil() {
  try {
    const res = await fetchConToken(`${API_BASE}/vendedor/perfil`);

    if (!res.ok) return;

    const data = await res.json();
    const img = document.getElementById("imgPerfilNav");
    img.src = data.logo || "../img/defaultuser.png";
  } catch (err) {
    console.error("Error perfil:", err);
  }
}

cargarPerfil();

// ===============================
// CARGAR PRODUCTOS DEL VENDEDOR
// ===============================
let productosGlobales = [];

async function cargarMisProductos() {
  try {
    const res = await fetchConToken(`${API_BASE}/vendedor/productos`);

    if (!res.ok) {
      showToast("No se pudieron cargar los productos.", "error");
      return;
    }

    productosGlobales = await res.json();

    const aprobados = productosGlobales.filter(
      p => p.estado_aprobacion?.toLowerCase() === "aprobado"
    );

    renderProductos(aprobados);

  } catch (err) {
    console.error("Error cargando productos:", err);
    showToast("Error de conexión.", "error");
  }
}

cargarMisProductos();

// ===============================
// RENDER DE PRODUCTOS
// ===============================
const contenedor = document.getElementById("productosContainer");

function renderProductos(lista) {
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="producto-card agregar-card"
         onclick="window.location.href='../agregarproducto/agregarproductos.html'">
      <div class="agregar-icon">+</div>
      <p>Agregar producto</p>
    </div>
  `;

  lista.forEach(p => {
    contenedor.innerHTML += `
      <div class="producto-card">
        <img src="${p.imagen}" class="producto-img" alt="${p.nombre}">
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
let productoAEliminar = null;

function abrirModalEliminar(id) {
  productoAEliminar = id;
  modalEliminar.style.display = "flex";
}

document.getElementById("btnCancelarEliminar").onclick = () => {
  productoAEliminar = null;
  modalEliminar.style.display = "none";
};

document.getElementById("btnConfirmarEliminar").onclick = async () => {
  if (productoAEliminar === null) return;

  try {
    console.log("🗑️ Eliminando producto:", productoAEliminar);
    console.log("🗑️ Token disponible:", !!token);

    // OPCIÓN 1: Intentar con fetchConToken (con todos los headers)
    const res = await fetch(`${API_BASE}/vendedor/productos/${productoAEliminar}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("🗑️ Status de eliminación:", res.status);
    console.log("🗑️ Headers de respuesta:", [...res.headers.entries()]);

    if (res.status === 401) {
      const errorData = await res.json().catch(() => res.text());
      console.error("❌ Error 401 - Detalles:", errorData);
      showToast("Error de autenticación. Intenta cerrar sesión y volver a entrar.", "error");
      return;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error del servidor:", errorText);
      showToast("No se pudo eliminar el producto.", "error");
      return;
    }

    showToast("Producto eliminado correctamente.");
    modalEliminar.style.display = "none";
    productoAEliminar = null;
    cargarMisProductos();
  } catch (err) {
    console.error("❌ Error eliminando producto:", err);
    showToast("Error al eliminar producto.", "error");
  }
};

// ===============================
// MODAL EDITAR PRODUCTO
// ===============================
let productoAEditar = null;
const modalEditar = document.getElementById("modalEditar");

function abrirModalEditar(id) {
  const prod = productosGlobales.find(p => p.id_producto === id);
  if (!prod) return showToast("No se encontró el producto.", "error");

  productoAEditar = id;

  document.getElementById("editNombre").value = prod.nombre;
  document.getElementById("editDescripcion").value = prod.descripcion;
  document.getElementById("editPrecio").value = prod.precio;

  modalEditar.style.display = "flex";
}

document.getElementById("btnCancelarEditar").onclick = () => {
  productoAEditar = null;
  modalEditar.style.display = "none";
};

document.getElementById("btnGuardarEditar").onclick = async () => {
  if (!productoAEditar) return;

  const body = {
    nombre: document.getElementById("editNombre").value,
    descripcion: document.getElementById("editDescripcion").value,
    precio: parseFloat(document.getElementById("editPrecio").value)
  };

  try {
    const res = await fetchConToken(`${API_BASE}/vendedor/productos/${productoAEditar}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error del servidor:", errorText);
      return showToast("Error al actualizar.", "error");
    }

    showToast("Producto actualizado correctamente.");
    modalEditar.style.display = "none";
    cargarMisProductos();
  } catch (err) {
    console.error("Error actualizando producto:", err);
    showToast("Error al actualizar producto.", "error");
  }
};

// ===============================
// MENÚ DESPLEGABLE DE PERFIL (CORREGIDO)
// ===============================

const perfilImg = document.getElementById("imgPerfilNav");
const perfilMenu = document.getElementById("perfilMenu");
const perfilArea = document.querySelector(".perfil-area");

if (perfilImg && perfilMenu && perfilArea) {

    // Abrir / cerrar al hacer click en la imagen
    perfilImg.addEventListener("click", (e) => {
        e.stopPropagation();
        perfilArea.classList.toggle("show");
    });

    // Cerrar al hacer click fuera
    document.addEventListener("click", () => {
        perfilArea.classList.remove("show");
    });
}


// ===============================
// LOGOUT
// ===============================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.onclick = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("rol_usuario");
    window.location.href = "../login/login.html";
  };
}