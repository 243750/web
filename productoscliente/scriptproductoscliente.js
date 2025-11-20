// =======================
// TOKEN Y ROL
// =======================
const token = localStorage.getItem("userToken");
const rol = localStorage.getItem("rol_usuario");

if (!token || rol !== "cliente") {
  window.location.href = "../login/login.html";
}

// =======================
// TOAST PROFESIONAL
// =======================
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

// =======================
// API BASE
// =======================
const API_PRODUCTOS = "http://52.200.165.176:7070/api/productos";
const API_FAVORITOS = "http://52.200.165.176:7070/api/favoritos";

let productosGlobales = [];
let favoritosUser = [];

// =======================
// CARGAR FAVORITOS
// =======================
async function cargarFavoritos() {
  try {
    const res = await fetch(API_FAVORITOS, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) favoritosUser = await res.json();
    else favoritosUser = [];

  } catch (err) {
    console.error("Error cargando favoritos:", err);
  }
}

function esFavorito(idProducto) {
  return favoritosUser.some((f) => f.id_producto === idProducto);
}

// =======================
// CARGAR NOMBRE DEL VENDEDOR (NUEVO)
// =======================
async function cargarNombreVendedor(vendorId) {
  try {
    const res = await fetch(`http://52.200.165.176:7070/api/productos/empresa/${vendorId}`);
    const data = await res.json();

    const titulo = document.getElementById("tituloProductos");

    if (data && data.empresa) {
      titulo.textContent = `Productos de ${data.empresa}`;
    } else {
      titulo.textContent = "Productos del vendedor";
    }

  } catch (err) {
    console.error("Error obteniendo nombre del vendedor:", err);
  }
}

// =======================
// CARGAR PRODUCTOS
// =======================
async function cargarProductos() {
  try {
    const params = new URLSearchParams(window.location.search);
    const vendor = params.get("vendor");

    const url = vendor
      ? `${API_PRODUCTOS}?vendor=${vendor}`
      : API_PRODUCTOS;

    const res = await fetch(url);
    const data = await res.json();

    productosGlobales = Array.isArray(data) ? data : [];

    console.log("PARAM vendor =", vendor);
    console.log("PRODUCTOS DESDE API:", productosGlobales);

    // ▼ Cargar nombre del vendedor si aplica
    if (vendor) {
      cargarNombreVendedor(vendor);
    }

    // Primero favoritos
    await cargarFavoritos();

    console.log("📌 URL llamada →", url);
    console.log("📌 DATA COMPLETA →", data);
    console.log("📌 DATA[0] →", data[0]);
    console.log("📌 NOMBRE VENDEDOR DESDE API →", data[0]?.nombre_vendedor);

    // Render inicial
    renderProductos(productosGlobales);

    // Search inicial
    aplicarSearchInicial();

    // Categoría inicial
    aplicarFiltroInicialCategoria();

  } catch (err) {
    console.error("Error al cargar productos:", err);
  }
}

cargarProductos();

// =======================
// RENDER PRODUCTOS
// =======================
const contenedor = document.getElementById("productosContainer");

function renderProductos(lista) {
  contenedor.innerHTML = lista
    .map((p) => {
      const fav = esFavorito(p.id_producto);
      const icono = fav ? "iconofavoritorojo.png" : "iconofavorito.png";

      return `
      <div class="producto-card">

        <img src="${p.imagen}"
             class="producto-img"
             onclick="window.location.href='../productoindividualcliente/productoindividualcliente.html?id=${p.id_producto}'">

        <p class="producto-nombre">${p.nombre}</p>
        <p class="producto-precio">$${p.precio}.00 MX</p>
        <p class="producto-vendedor">${p.nombre_vendedor || "Vendedor"}</p>

        <div class="iconos-inferiores">
          <img src="img/${icono}"
               class="icono-btn"
               onclick="toggleFavorito(${p.id_producto}, this)">
        </div>

      </div>`;
    })
    .join("");
}

// =======================
// FAVORITOS TOGGLE
// =======================
function toggleFavorito(id, btn) {
  const yaEsFav = esFavorito(id);

  if (!yaEsFav) {
    fetch(API_FAVORITOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id_producto: id }),
    })
      .then(() => {
        favoritosUser.push({ id_producto: id });
        btn.src = "img/iconofavoritorojo.png";
        toast("Añadido a favoritos 💜");
      })
      .catch((err) => console.error("Error favoritos:", err));
  } else {
    fetch(`${API_FAVORITOS}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        favoritosUser = favoritosUser.filter((f) => f.id_producto !== id);
        btn.src = "img/iconofavorito.png";
        toast("Eliminado de favoritos 🤍");
      })
      .catch((err) => console.error("Error favoritos:", err));
  }
}

// =======================
// FILTROS
// =======================

// CATEGORÍA
async function filtrarCategoria(id) {
  if (!id) return renderProductos(productosGlobales);

  try {
    const res = await fetch(`${API_PRODUCTOS}/categoria/${id}`);
    const data = await res.json();
    renderProductos(data);
  } catch (err) {
    console.error("Error filtrado categoría:", err);
  }
}

document.getElementById("filtroCategoria").addEventListener("change", (e) => {
  filtrarCategoria(e.target.value);
});

// MATERIAL
document.getElementById("filtroMaterial").addEventListener("change", async (e) => {
  const id = e.target.value;
  if (!id) return renderProductos(productosGlobales);

  try {
    const res = await fetch(`${API_PRODUCTOS}/material/${id}`);
    const data = await res.json();
    renderProductos(data);
  } catch (err) {
    console.error(err);
  }
});

// INSTITUCIÓN
document.getElementById("filtroInstitucion").addEventListener("change", async (e) => {
  const id = e.target.value;
  if (!id) return renderProductos(productosGlobales);

  try {
    const res = await fetch(`${API_PRODUCTOS}/universidad/${id}`);
    const data = await res.json();
    renderProductos(data);
  } catch (err) {
    console.error(err);
  }
});

// =======================
// BUSCADOR
// =======================
const inputBusqueda = document.getElementById("busqueda");
const btnBuscar = document.getElementById("btnBuscar");

btnBuscar.addEventListener("click", filtrarBusqueda);
inputBusqueda.addEventListener("keypress", (e) => {
  if (e.key === "Enter") filtrarBusqueda();
});

function filtrarBusqueda() {
  const texto = inputBusqueda.value.toLowerCase();
  if (!texto) return renderProductos(productosGlobales);

  const filtrados = productosGlobales.filter(
    (p) =>
      p.nombre.toLowerCase().includes(texto) ||
      (p.nombre_vendedor || "").toLowerCase().includes(texto)
  );

  renderProductos(filtrados);
}

// =======================
// FILTRO INICIAL POR SEARCH
// =======================
function aplicarSearchInicial() {
  const params = new URLSearchParams(window.location.search);
  const search = params.get("search");

  if (!search) return;

  const texto = search.toLowerCase();

  const filtrados = productosGlobales.filter(
    (p) =>
      p.nombre.toLowerCase().includes(texto) ||
      (p.nombre_vendedor || "").toLowerCase().includes(texto)
  );

  renderProductos(filtrados);
}

// =======================
// FILTRO INICIAL POR CATEGORIA
// =======================
function aplicarFiltroInicialCategoria() {
  const params = new URLSearchParams(window.location.search);
  const catInicial = params.get("categoria");

  if (catInicial) {
    document.getElementById("filtroCategoria").value = catInicial;
    filtrarCategoria(catInicial);
  }
}
