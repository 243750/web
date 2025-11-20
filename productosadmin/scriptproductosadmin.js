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
// PERFIL DROPDOWN
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

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../login/login.html";
});


// =====================
// BOTÓN SOLICITUDES
// =====================
document.getElementById("btnSolicitudes").addEventListener("click", () => {
  window.location.href = "../solicitudesproductosadmin/solicitudesproductosadmin.html";
});


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
    console.error("❌ Error cargando productos:", err);
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
cargarProductos();
