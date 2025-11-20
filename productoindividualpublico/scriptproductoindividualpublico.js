// ========================
// API + ID PRODUCTO
// ========================
const API = "http://52.200.165.176:7070/api";

const params = new URLSearchParams(window.location.search);
const idProducto = params.get("id");

if (!idProducto) {
  window.location.href = "../productospublico/productospublico.html";
}

// ========================
// DOM
// ========================
const imgProducto = document.getElementById("imgProducto");
const nombreVendedor = document.getElementById("nombreVendedor");
const precio = document.getElementById("precio");
const nombreProducto = document.getElementById("nombreProducto");
const material = document.getElementById("material");
const institucion = document.getElementById("institucion");
const vendedor = document.getElementById("vendedor");
const selectTalla = document.getElementById("selectTalla");

// ========================
// CARGAR PRODUCTO
// ========================
async function cargarProducto() {
  try {
    const res = await fetch(`${API}/productos/${idProducto}`);
    const data = await res.json();

    imgProducto.src = data.imagen;
    nombreProducto.textContent = data.nombre;
    precio.textContent = `$${data.precio}.00 MX`;

    material.textContent = data.material_nombre || "—";
    institucion.textContent = data.universidad_nombre || "—";

    nombreVendedor.textContent = data.nombre_vendedor || "Vendedor";
    vendedor.textContent = data.nombre_vendedor || "Vendedor";

  } catch (err) {
    console.error("Error cargando producto:", err);
  }
}

// ========================
// TALLAS
// ========================
async function cargarTallas() {
  try {
    const res = await fetch(`${API}/productos/${idProducto}/tallas`);
    const tallas = await res.json();

    selectTalla.innerHTML = "";

    if (!tallas.length) {
      selectTalla.innerHTML = "<option>No disponible</option>";
      return;
    }

    tallas.forEach(t => {
      const opt = document.createElement("option");
      opt.textContent = `${t.nombre_talla} (${t.stock_disponible} disponibles)`;
      selectTalla.appendChild(opt);
    });

  } catch (err) {
    console.error("Error con tallas:", err);
  }
}

// ========================
// INICIALIZAR
// ========================
(async function () {
  cargarProducto();
  cargarTallas();
})();
