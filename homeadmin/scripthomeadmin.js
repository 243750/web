// =====================
// VALIDACIÓN ADMIN
// =====================
const token = localStorage.getItem("userToken");
const rol = (localStorage.getItem("rol_usuario") || "").toLowerCase();

if (!token || rol !== "admin") {
  window.location.href = "../login/login.html";
}

const API_BASE = "http://52.200.165.176:7070/api";


// =====================
// DROPDOWN PERFIL + REDIRECCIONES
// =====================
const perfilArea = document.querySelector(".perfil-area");
const perfilMenu = document.getElementById("perfilMenu");
const logoutBtn = document.getElementById("logoutBtn");

// Abrir menú
perfilArea.addEventListener("click", e => {
  e.stopPropagation();
  perfilArea.classList.toggle("show");
});

// Cerrar click afuera
window.addEventListener("click", () => {
  perfilArea.classList.remove("show");
});

// Cerrar sesión
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../login/login.html";
});

// 🔥 REDIRECCIONES DEL MENU
document.querySelector('a[href="../vendedoresadmin/vendedoresadmin.html"]')
  .addEventListener("click", () => {
    window.location.href = "../vendedoresadmin/vendedoresadmin.html";
  });

document.querySelector('a[href="../productosadmin/productosadmin.html"]')
  .addEventListener("click", () => {
    window.location.href = "../productosadmin/productosadmin.html";
  });

document.querySelector('a[href="../perfiladmin/perfiladmin.html"]')
  .addEventListener("click", () => {
    window.location.href = "../perfiladmin/perfiladmin.html";
  });


// =====================
// CLICK EN BANNER — REDIRIGIR A PRODUCTOS ADMIN
// =====================
const bannerRight = document.querySelector(".banner-right");

if (bannerRight) {
  bannerRight.style.cursor = "pointer";
  bannerRight.addEventListener("click", () => {
    window.location.href = "../productosadmin/productosadmin.html";
  });
}


// =====================
// CARGAR EMPRESAS
// =====================
const vendorsContainer = document.getElementById("vendorsContainer");

async function cargarEmpresas() {
  try {
    const res = await fetch(`${API_BASE}/empresas`);
    const data = await res.json();
    renderEmpresas(data);

  } catch (err) {
    console.error("Error cargando empresas:", err);
  }
}

function renderEmpresas(lista) {
  vendorsContainer.innerHTML = lista
    .map(e => `
      <div class="vendor-card"
           onclick="window.location.href='../vendedoresadmin/vendedoresadmin.html?id=${e.id_empresa}'">
        <div class="vendor-circle" style="background-image:url('${e.logo}')"></div>
        <p class="vendor-name">${e.nombre_comercial}</p>
      </div>
    `)
    .join("");
}


// =====================
// CARGAR PRODUCTOS
// =====================
const productosContainer = document.getElementById("productosContainer");

async function cargarProductos() {
  try {
    const res = await fetch(`${API_BASE}/productos`);
    const data = await res.json();
    renderProductos(data);

  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}

function renderProductos(lista) {
  productosContainer.innerHTML = lista
    .map(p => `
      <div class="producto-card"
           onclick="window.location.href='../productoindividualadmin/productoindividualadmin.html?id=${p.id_producto}'">
        <img src="${p.imagen}" class="producto-img">
        <p class="producto-nombre">${p.nombre}</p>
        <p class="producto-precio">$${p.precio}.00 MX</p>
        <p class="producto-vendedor">${p.nombre_vendedor || "Sin vendedor"}</p>
      </div>
    `)
    .join("");
}


// =====================
// INIT
// =====================
cargarEmpresas();
cargarProductos();
