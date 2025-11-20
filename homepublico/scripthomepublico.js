// =======================================================
// 🔷 DROPDOWNS (Categoría)
// =======================================================
const categoryBtn  = document.getElementById('categoryBtn');
const categoryMenu = document.getElementById('categoryMenu');

if (categoryMenu) {
  categoryMenu.innerHTML = `
    <a href="../productospublico/productospublico.html?cat=2">Deportivo</a>
    <a href="../productospublico/productospublico.html?cat=1">Casual</a>
    <a href="../productospublico/productospublico.html?cat=3">Formal</a>
    <hr style="border:none;border-top:1px solid #eee;margin:6px 0;">
    <a href="../productospublico/productospublico.html">Todas las categorías</a>
  `;
}

categoryBtn?.addEventListener("click", e => {
  e.stopPropagation();
  categoryMenu.classList.toggle("show");
});
window.addEventListener("click", () => categoryMenu.classList.remove("show"));


// ===================================================================
// 🔷 BOTÓN ÚNETE → registro
// ===================================================================
document.getElementById("joinBtn")?.addEventListener("click", () => {
  window.location.href = "../registro/registro.html";
});

// ===================================================================
// 🔷 BOTÓN DESCUBRE → productos público
// ===================================================================
document.getElementById("discoverBtn")?.addEventListener("click", () => {
  window.location.href = "../productospublico/productospublico.html";
});


// ===================================================================
// 🔷 VENDEDORES (API real)
// ===================================================================
const vendorsContainer = document.getElementById("vendorsContainer");

async function cargarVendedores() {
  try {
    const res = await fetch("http://52.200.165.176:7070/api/empresas");
    const data = await res.json();

    vendorsContainer.innerHTML = data
      .filter(e => e.estado_aprobacion === "aprobada")
      .map(e => `
        <div class="vendor-card"
             onclick="window.location.href='../productospublico/productospublico.html?vendor=${e.id_empresa}'">

          <div class="vendor-circle"
               style="background-image:url('${e.logo || "img/default.png"}')">
          </div>

          <p class="vendor-name">${e.nombre_comercial}</p>
        </div>
      `)
      .join("");

  } catch (err) {
    vendorsContainer.innerHTML = "<p>Error cargando vendedores</p>";
  }
}


// ===================================================================
// 🔷 PRODUCTOS DESTACADOS (API real)
// ===================================================================
const productosContainer = document.getElementById("productosContainer");

async function cargarProductosPublico() {
  try {
    const res = await fetch("http://52.200.165.176:7070/api/productos");
    const lista = await res.json();

    productosContainer.innerHTML = lista
      .map(p => `
        <div class="producto-card" 
             onclick="window.location.href='../productoindividualpublico/productoindividualpublico.html?id=${p.id_producto}'">

          <img src="${p.imagen}" class="producto-img">
          <p class="producto-nombre">${p.nombre}</p>
          <p class="producto-precio">$${p.precio}.00 MX</p>
          <p class="producto-vendedor">${p.nombre_vendedor ?? ""}</p>
        </div>
      `)
      .join("");

  } catch (err) {
    productosContainer.innerHTML = "<p>Error al cargar productos.</p>";
  }
}


// ===================================================================
// INICIO
// ===================================================================
cargarVendedores();
cargarProductosPublico();
