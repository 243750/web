const API = "http://52.200.165.176:7070/api";
const token = localStorage.getItem("userToken");
const rol   = localStorage.getItem("rol_usuario");

if (!token || rol !== "cliente") {
  window.location.href = "../login/login.html";
}

const contenedor = document.getElementById("favoritosContainer");

// ============================
// CARGAR FAVORITOS
// ============================
async function cargarFavoritos() {
  try {
    const res = await fetch(`${API}/favoritos`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const lista = await res.json(); 
    const ids = lista.map(f => f.id_producto);

    if (ids.length === 0) {
      contenedor.innerHTML = "<p style='text-align:center;'>No tienes productos en favoritos.</p>";
      return;
    }

    // Cargar productos completos
    const resProd = await fetch(`${API}/productos`);
    const productos = await resProd.json();

    const filtrados = productos.filter(p => ids.includes(p.id_producto));

    renderFavoritos(filtrados);

  } catch (err) {
    console.error("Error cargando favoritos:", err);
  }
}

// ============================
// RENDERIZAR LISTA
// ============================
function renderFavoritos(lista) {
  contenedor.innerHTML = lista.map(p => `
    <div class="producto-card">

      <img src="${p.imagen}" class="producto-img"
           onclick="window.location.href='../productoindividualcliente/productoindividualcliente.html?id=${p.id_producto}'">

      <h3>${p.nombre}</h3>
      <p>$${p.precio}.00 MX</p>

      <img src="img/iconofavoritorojo.png"
           class="icono-btn"
           onclick="event.stopPropagation(); eliminarFavorito(${p.id_producto});">
    </div>
  `).join("");
}

// ============================
// ELIMINAR FAVORITO
// ============================
function eliminarFavorito(id) {
  fetch(`${API}/favoritos/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  }).then(() => cargarFavoritos());
}

// ============================
// INICIO
// ============================
cargarFavoritos();
