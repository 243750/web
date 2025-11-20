// =======================
// CONFIG / VALIDACIÓN ADMIN
// =======================
const API_BASE = "http://52.200.165.176:7070/api";
const token = localStorage.getItem("userToken");
const rol = (localStorage.getItem("rol_usuario") || "").toLowerCase();

// Solo admin puede ver esta vista
if (!token || rol !== "admin") {
  window.location.href = "../login/login.html";
}

// =======================
// NAVBAR: dropdown + logout
// =======================
const perfilArea = document.querySelector(".perfil-area");
const perfilMenu = document.getElementById("perfilMenu");
const logoutBtn = document.getElementById("logoutBtn");

perfilArea.addEventListener("click", (e) => {
  e.stopPropagation();
  perfilArea.classList.toggle("show");
});

window.addEventListener("click", () => {
  perfilArea.classList.remove("show");
});

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../login/login.html";
});

// =======================
// OBTENER ID DEL PRODUCTO
// =======================
const params = new URLSearchParams(window.location.search);
const idProducto = params.get("id");

if (!idProducto) {
  // Si no viene id, regresamos al listado de productos
  window.location.href = "../productosadmin/productosadmin.html";
}

// =======================
// ELEMENTOS DEL DOM
// =======================
const imgProducto = document.getElementById("imgProducto");
const nombreVendedorEl = document.getElementById("nombreVendedor");
const precioEl = document.getElementById("precio");
const nombreProductoEl = document.getElementById("nombreProducto");

const materialEl = document.getElementById("material");
const institucionEl = document.getElementById("institucion");
const categoriaEl = document.getElementById("categoria");
const stockTotalEl = document.getElementById("stockTotal");
const fechaCreacionEl = document.getElementById("fechaCreacion");
const estadoProductoEl = document.getElementById("estadoProducto");

const descripcionEl = document.getElementById("descripcion");
const vendedorEl = document.getElementById("vendedor");
const contactoVendedorEl = document.getElementById("contactoVendedor");

let productoActual = null;

// =======================
// UTILIDADES
// =======================
function formatearFecha(str) {
  if (!str) return "—";
  // Soporta formatos tipo "2025-11-20T03:15:00" o "2025-11-20"
  const d = new Date(str);
  if (isNaN(d.getTime())) return str; // si no se puede parsear, devolvemos tal cual
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

// =======================
// CARGAR PRODUCTO
// =======================
async function cargarProducto() {
  try {
    const res = await fetch(`${API_BASE}/productos/${idProducto}`);

    if (!res.ok) {
      console.error("No se pudo obtener detalle, intento buscar en /productos");
      const resAll = await fetch(`${API_BASE}/productos`);
      if (resAll.ok) {
        const lista = await resAll.json();
        productoActual = lista.find(p => p.id_producto == idProducto);
      }
    } else {
      productoActual = await res.json();
    }

    console.log("📌 Producto admin:", productoActual);

    if (!productoActual) {
      alert("Producto no encontrado.");
      window.location.href = "../productosadmin/productosadmin.html";
      return;
    }

    // Imagen
    imgProducto.src = productoActual.imagen || "../productoscliente/img/defaultproducto.png";

    // Nombre / precio
    nombreProductoEl.textContent = productoActual.nombre || "—";
    precioEl.textContent = productoActual.precio
      ? `$${productoActual.precio}.00 MX`
      : "$0.00 MX";

    // Vendedor
    const nombreVendedor =
      productoActual.nombre_comercial ||
      productoActual.nombre_vendedor ||
      "Vendedor";

    nombreVendedorEl.textContent = nombreVendedor;
    vendedorEl.textContent = nombreVendedor;

    // Info principal
    materialEl.textContent = productoActual.material_nombre || "—";
    institucionEl.textContent = productoActual.universidad_nombre || "—";
    categoriaEl.textContent = productoActual.categoria_nombre || productoActual.categoria || "—";

    // Stock y fechas si vienen
    stockTotalEl.textContent =
      productoActual.stock_total != null
        ? productoActual.stock_total
        : "—";

    fechaCreacionEl.textContent = formatearFecha(
      productoActual.fecha_creacion || productoActual.created_at
    );

    const estado = (productoActual.estado_producto || "APROBADO").toString();
    estadoProductoEl.textContent = estado.toUpperCase();

    // Descripción
    descripcionEl.textContent = productoActual.descripcion || "Sin descripción registrada.";

    // Contacto si existe
    const contactoPieces = [];

    if (productoActual.correo_vendedor) {
      contactoPieces.push(productoActual.correo_vendedor);
    }
    if (productoActual.telefono_vendedor) {
      contactoPieces.push(productoActual.telefono_vendedor);
    }

    contactoVendedorEl.textContent =
      contactoPieces.length > 0 ? contactoPieces.join(" · ") : "No hay datos extra del vendedor.";

  } catch (err) {
    console.error("Error al cargar producto (admin):", err);
    alert("Ocurrió un error al cargar el producto.");
  }
}

// =======================
// INIT
// =======================
cargarProducto();
