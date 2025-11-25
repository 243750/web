const API = "http://52.200.165.176:7070/api";
const token = localStorage.getItem("userToken");
const rol = localStorage.getItem("rol_usuario");

if (!token || rol !== "admin") {
  window.location.href = "../login/login.html";
}

// =====================================================
// CARGAR TODAS LAS ESTADÍSTICAS CON 3 ENDPOINTS REALES
// =====================================================
async function cargarEstadisticas() {
  try {
    //  Productos más vendidos
    const resProd = await fetch(`${API}/admin/estadisticas/productos-mas-vendidos`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const productos = await resProd.json();

    // Usuarios
    const resUsers = await fetch(`${API}/admin/estadisticas/usuarios`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const usuarios = await resUsers.json();

    // Ventas por mes
    const resVentas = await fetch(`${API}/admin/estadisticas/ventas`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const ventas = await resVentas.json();

    renderProductos(productos);
    renderUsuarios(usuarios);
    renderVentas(ventas);

  } catch (err) {
    console.error("Error cargando estadísticas:", err);
  }
}

// =====================================================
// PRODUCTOS MÁS VENDIDOS
// =====================================================
function renderProductos(lista) {
  const ctx = document.getElementById("productosVendidosChart");

  if (!lista || lista.length === 0) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: lista.map(x => x.nombre),
      datasets: [{
        label: "Ventas",
        data: lista.map(x => x.cantidad),
        backgroundColor: "#6B1FAD"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// =====================================================
// USUARIOS (CLIENTES / VENDEDORES)
// =====================================================
function renderUsuarios(data) {
  const ctx = document.getElementById("usuariosChart");

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Clientes", "Vendedores"],
      datasets: [{
        data: [data.clientes, data.vendedores],
        backgroundColor: ["#9b58ff", "#6B1FAD"]
      }]
    }
  });
}

// =====================================================
// VENTAS POR MES
// =====================================================
function renderVentas(lista) {
  const ctx = document.getElementById("ventasPorDiaChart");

  if (!lista || lista.length === 0) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: lista.map(x => x.mes),
      datasets: [{
        label: "Total vendido",
        data: lista.map(x => x.total),
        borderColor: "#6B1FAD",
        borderWidth: 3,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

cargarEstadisticas();
