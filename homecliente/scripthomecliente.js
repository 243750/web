// =====================================
// TOKEN
// =====================================
const token = localStorage.getItem("userToken");
const rol = localStorage.getItem("rol_usuario");

if (!token || rol !== "cliente") {
  window.location.href = "../login/login.html";
}

// =====================================
// TOAST
// =====================================
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

// =====================================
// REDIRIGE DESCUBRE
// =====================================
const discoverBtn = document.getElementById("discoverBtn");

if (discoverBtn) {
  discoverBtn.addEventListener("click", () => {
    window.location.href = "../productoscliente/productoscliente.html";
  });

  discoverBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.location.href = "../productoscliente/productoscliente.html";
    }
  });
}

// =====================================
// FAVORITOS
// =====================================
let favoritosUser = [];

async function cargarFavoritos() {
  try {
    const res = await fetch("http://52.200.165.176:7070/api/favoritos", {
      headers: { Authorization: `Bearer ${token}` },
    });

    favoritosUser = await res.json();
  } catch (err) {
    console.error("Error cargando favoritos", err);
  }
}

// =====================================
// EMPRESAS
// =====================================
const vendorsContainer = document.getElementById("vendorsContainer");
const EMPRESAS_URL = "http://52.200.165.176:7070/api/empresas";

async function cargarEmpresas() {
  try {
    const res = await fetch(EMPRESAS_URL);
    const empresas = await res.json();

    renderEmpresas(empresas);
  } catch (err) {
    console.error("Error cargando empresas:", err);
    vendorsContainer.innerHTML = "<p>No se pudieron cargar los vendedores.</p>";
  }
}

function renderEmpresas(lista) {
  vendorsContainer.innerHTML = lista
    .filter((e) => e.estado_aprobacion === "aprobada")
    .map(
      (e) => `
      <div class="vendor-card"
           onclick="window.location.href='../productoscliente/productoscliente.html?vendor=${e.id_empresa}'">

        <div class="vendor-circle"
             style="background-image: url('${e.logo || "../homecliente/img/defaultuser.png"}')">
        </div>

        <p class="vendor-name">${e.nombre_comercial}</p>
      </div>
    `
    )
    .join("");
}

// =====================================
// PRODUCTOS DESTACADOS
// =====================================
const contenedor = document.getElementById("productosContainer");
const API_URL = "http://52.200.165.176:7070/api/productos";
let productosGlobales = [];

async function cargarProductos() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    productosGlobales = Array.isArray(data) ? data : [];

    renderProductos(productosGlobales);
  } catch (err) {
    console.error("Error al cargar productos:", err);
    contenedor.innerHTML = "<p>Error al cargar productos.</p>";
  }
}

function renderProductos(lista) {
  contenedor.innerHTML = lista
    .map((p) => {
      const esFavorito = favoritosUser.some(
        (f) => f.id_producto === p.id_producto
      );

      return `
        <div class="producto-card">
          <img src="${p.imagen}"
              class="producto-img"
              onclick="window.location.href='../productoindividualcliente/productoindividualcliente.html?id=${p.id_producto}'">

          <p class="producto-nombre">${p.nombre}</p>
          <p class="producto-precio">$${p.precio}.00 MX</p>
          <p class="producto-vendedor">${p.nombre_vendedor ?? ""}</p>

          <div class="iconos-inferiores">
            <img 
              src="img/${esFavorito ? "iconofavoritorojo.png" : "iconofavorito.png"}"
              class="icono-btn"
              onclick="toggleFavorito(${p.id_producto}, this)">
          </div>
        </div>
      `;
    })
    .join("");
}

// =====================================
// FAVORITO TOGGLE
// =====================================
function toggleFavorito(id, btn) {
  const yaEsFavorito = favoritosUser.some((f) => f.id_producto === id);

  if (!yaEsFavorito) {
    fetch("http://52.200.165.176:7070/api/favoritos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id_producto: id }),
    }).then(() => {
      favoritosUser.push({ id_producto: id });
      btn.src = "img/iconofavoritorojo.png";
      toast("Añadido a favoritos ");
    });
  } else {
    fetch(`http://52.200.165.176:7070/api/favoritos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      favoritosUser = favoritosUser.filter((f) => f.id_producto !== id);
      btn.src = "img/iconofavorito.png";
      toast("Eliminado de favoritos ");
    });
  }
}

// =====================================
// INICIALIZACIÓN
// =====================================
(async () => {
  await cargarFavoritos();
  await cargarEmpresas();
  await cargarProductos();
})();
