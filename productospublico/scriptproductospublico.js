// =======================================================
// API BASE (pública, sin token)
// =======================================================
const API_PRODUCTOS = "http://52.200.165.176:7070/api/productos";

// Lista global
let productosGlobales = [];

// Contenedor
const contenedor = document.getElementById("productosContainer");

// =======================================================
// DROPDOWN CATEGORÍAS NAVBAR
// =======================================================
const categoryBtn  = document.getElementById("categoryBtn");
const categoryMenu = document.getElementById("categoryMenu");

if (categoryMenu) {
  categoryMenu.innerHTML = `
    <a href="productospublico.html?categoria=2">Deportivo</a>
    <a href="productospublico.html?categoria=1">Casual</a>
    <a href="productospublico.html?categoria=3">Formal</a>
    <hr>
    <a href="productospublico.html">Todas las categorías</a>
  `;
}

categoryBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  categoryMenu?.classList.toggle("show");
});
window.addEventListener("click", () => categoryMenu?.classList.remove("show"));

// =======================================================
// RENDER PRODUCTOS (sin favoritos ni carrito)
// =======================================================
function renderProductos(lista) {
  if (!lista || !lista.length) {
    contenedor.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  contenedor.innerHTML = lista
    .map(
      (p) => `
      <div class="producto-card"
           onclick="window.location.href='../productoindividualpublico/productoindividualpublico.html?id=${p.id_producto}'">

        <img src="${p.imagen}"
             alt="${p.nombre}"
             class="producto-img">

        <p class="producto-nombre">${p.nombre}</p>
        <p class="producto-precio">$${p.precio}.00 MX</p>
        <p class="producto-vendedor">${p.nombre_vendedor || ""}</p>
      </div>
    `
    )
    .join("");
}

// =======================================================
// CARGAR PRODUCTOS
// =======================================================
async function cargarProductos() {
  try {
    const res = await fetch(API_PRODUCTOS);
    const data = await res.json();

    productosGlobales = Array.isArray(data) ? data : [];

    // Aplicar filtros iniciales por URL (search / categoria)
    if (!aplicarFiltrosIniciales()) {
      // Si no hay filtros en URL, mostrar todos
      renderProductos(productosGlobales);
    }
  } catch (err) {
    console.error("Error al cargar productos:", err);
    contenedor.innerHTML = "<p>Error al cargar productos.</p>";
  }
}

// =======================================================
// FILTROS POR SELECTS (material, institución, categoría)
// =======================================================
const filtroMaterial    = document.getElementById("filtroMaterial");
const filtroInstitucion = document.getElementById("filtroInstitucion");
const filtroCategoria   = document.getElementById("filtroCategoria");

// Categoría (usa endpoint /categoria/{id})
filtroCategoria?.addEventListener("change", async (e) => {
  const id = e.target.value;
  if (!id) return renderProductos(productosGlobales);

  try {
    const res = await fetch(`${API_PRODUCTOS}/categoria/${id}`);
    const data = await res.json();
    renderProductos(data);
  } catch (err) {
    console.error("Error filtrando categoría:", err);
  }
});

// Material (usa endpoint /material/{id})
filtroMaterial?.addEventListener("change", async (e) => {
  const id = e.target.value;
  if (!id) return renderProductos(productosGlobales);

  try {
    const res = await fetch(`${API_PRODUCTOS}/material/${id}`);
    const data = await res.json();
    renderProductos(data);
  } catch (err) {
    console.error("Error filtrando material:", err);
  }
});

// Institución (usa endpoint /universidad/{id})
filtroInstitucion?.addEventListener("change", async (e) => {
  const id = e.target.value;
  if (!id) return renderProductos(productosGlobales);

  try {
    const res = await fetch(`${API_PRODUCTOS}/universidad/${id}`);
    const data = await res.json();
    renderProductos(data);
  } catch (err) {
    console.error("Error filtrando institución:", err);
  }
});

// =======================================================
// BUSCADOR (navbar de esta misma vista)
// =======================================================
const inputBusqueda = document.getElementById("busqueda");
const btnBuscar     = document.getElementById("btnBuscar");

function aplicarBusqueda(texto) {
  const query = texto.toLowerCase().trim();
  if (!query) {
    renderProductos(productosGlobales);
    return;
  }

  const filtrados = productosGlobales.filter(
    (p) =>
      p.nombre.toLowerCase().includes(query) ||
      (p.nombre_vendedor || "").toLowerCase().includes(query)
  );

  renderProductos(filtrados);
}

btnBuscar?.addEventListener("click", () => {
  aplicarBusqueda(inputBusqueda.value);
});

inputBusqueda?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    aplicarBusqueda(inputBusqueda.value);
  }
});

// =======================================================
// FILTROS INICIALES POR QUERY STRING (?search & ?categoria)
// =======================================================
function aplicarFiltrosIniciales() {
  const params     = new URLSearchParams(window.location.search);
  const searchQS   = params.get("search");
  const categoriaQS = params.get("categoria");

  let aplicado = false;

  if (searchQS) {
    inputBusqueda.value = searchQS;
    aplicarBusqueda(searchQS);
    aplicado = true;
  }

  if (categoriaQS) {
    if (filtroCategoria) filtroCategoria.value = categoriaQS;

    // Reutilizamos endpoint /categoria/{id}
    fetch(`${API_PRODUCTOS}/categoria/${categoriaQS}`)
      .then((r) => r.json())
      .then((data) => renderProductos(data))
      .catch((err) => console.error("Error filtro inicial categoría:", err));

    aplicado = true;
  }

  return aplicado;
}

// =======================================================
// INICIO
// =======================================================
document.addEventListener("DOMContentLoaded", cargarProductos);
