// =======================
// CONFIG / CONSTANTES
// =======================
const API_BASE = "http://52.200.165.176:7070/api";
const token = localStorage.getItem("userToken");
const rol = localStorage.getItem("rol_usuario");

// Proteger ruta
if (!token || rol !== "cliente") {
  window.location.href = "../login/login.html";
}

// Obtener el id=XX
const params = new URLSearchParams(window.location.search);
const idProducto = params.get("id");

if (!idProducto) {
  window.location.href = "../productoscliente/productoscliente.html";
}

// =======================
// DOM ELEMENTOS
// =======================
const imgProducto = document.getElementById("imgProducto");
const nombreVendedor = document.getElementById("nombreVendedor");
const precioEl = document.getElementById("precio");
const nombreProducto = document.getElementById("nombreProducto");
const materialEl = document.getElementById("material");
const institucionEl = document.getElementById("institucion");
const vendedorEl = document.getElementById("vendedor");

const selectTalla = document.getElementById("selectTalla");
const selectCantidad = document.getElementById("selectCantidad");

const btnComprar = document.getElementById("btnComprar");
const btnCarrito = document.getElementById("btnCarrito");

const favoritoBox = document.getElementById("favoritoBox");
const iconFavorito = document.getElementById("iconFavorito");

let productoActual = null;
let favoritosUser = [];

// =======================
// FAVORITOS
// =======================
async function cargarFavoritos() {
  try {
    const res = await fetch(`${API_BASE}/favoritos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) favoritosUser = await res.json();
  } catch (err) {
    console.error("Error cargando favoritos:", err);
  }
}

function esFavorito(id) {
  return favoritosUser.some(f => f.id_producto == id);
}

function actualizarEstadoFavorito() {
  if (!productoActual) return;

  if (esFavorito(productoActual.id_producto)) {
    iconFavorito.src = "img/iconofavoritorojo.png";
    favoritoBox.classList.add("activo");
  } else {
    iconFavorito.src = "img/iconofavorito.png";
    favoritoBox.classList.remove("activo");
  }
}

// =======================
// CARGAR PRODUCTO
// =======================
async function cargarProducto() {
  try {
    const res = await fetch(`${API_BASE}/productos/${idProducto}`);

    if (!res.ok) {
      const all = await (await fetch(`${API_BASE}/productos`)).json();
      productoActual = all.find(p => p.id_producto == idProducto);
    } else {
      productoActual = await res.json();

      console.log(" PRODUCTO DESDE API:", productoActual);
    }

    if (!productoActual) {
      alert("Producto no encontrado");
      return;
    }

    imgProducto.src = productoActual.imagen;
    nombreProducto.textContent = productoActual.nombre;
    precioEl.textContent = `$${productoActual.precio}.00 MX`;

    // ========== ACTUALIZACIÓN AQUÍ ==========
    const vendedor = productoActual.nombre_comercial || "Vendedor";
    nombreVendedor.textContent = vendedor;
    vendedorEl.textContent = vendedor;
    // ========================================

    materialEl.textContent = productoActual.material_nombre || "—";
    institucionEl.textContent = productoActual.universidad_nombre || "—";

    actualizarEstadoFavorito();
  } catch (err) {
    console.error("Error al cargar producto:", err);
  }
}

// =======================
// TALLAS
// =======================
async function cargarTallas() {
  try {
    const res = await fetch(`${API_BASE}/productos/${idProducto}/tallas`);
    if (!res.ok) return;

    const tallas = await res.json();
    selectTalla.innerHTML = '<option value="">Selecciona una talla</option>';

    tallas.forEach(t => {
      if (t.stock_disponible > 0) {
        const opt = document.createElement("option");
        opt.value = t.id_talla;
        opt.textContent = `${t.nombre_talla} (stock: ${t.stock_disponible})`;
        selectTalla.appendChild(opt);
      }
    });
  } catch (err) {
    console.error("Error cargando tallas:", err);
  }
}

// =======================
// TOGGLE FAVORITO
// =======================
favoritoBox.addEventListener("click", async () => {
  const id = productoActual.id_producto;
  const activo = esFavorito(id);

  if (!activo) {
    await fetch(`${API_BASE}/favoritos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id_producto: id })
    });
    favoritosUser.push({ id_producto: id });
  } else {
    await fetch(`${API_BASE}/favoritos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    favoritosUser = favoritosUser.filter(f => f.id_producto != id);
  }

  actualizarEstadoFavorito();
});

// =======================
// CARRITO + ANIMACIÓN
// =======================
function mostrarCheck() {
  const box = document.getElementById("addToCartCheck");
  box.classList.remove("oculto");
  setTimeout(() => box.classList.add("show"), 30);
  setTimeout(() => {
    box.classList.remove("show");
    setTimeout(() => box.classList.add("oculto"), 200);
  }, 1500);
}

async function agregarAlCarrito(redir) {
  if (!selectTalla.value) return alert("Selecciona una talla.");

  await fetch(`${API_BASE}/carrito/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      id_producto: productoActual.id_producto,
      id_talla: selectTalla.value,
      cantidad: parseInt(selectCantidad.value)
    })
  });

  if (redir) {
    window.location.href = "../carrito/carrito.html";
  } else {
    mostrarCheck();
  }
}

btnCarrito.addEventListener("click", () => agregarAlCarrito(false));
btnComprar.addEventListener("click", () => agregarAlCarrito(true));

// =======================
// INICIALIZAR
// =======================
(async function init() {
  await cargarFavoritos();
  await cargarProducto();
  await cargarTallas();
})();
