// ===============================
// CONFIGURACIÓN GENERAL
// ===============================
const API = "http://52.200.165.176:7070/api";
const token = localStorage.getItem("userToken");
const rol = localStorage.getItem("rol_usuario");

if (!token || rol !== "cliente") {
  window.location.href = "../login/login.html";
}

let carritoActual = [];


// ===============================
// TOAST BONITO
// ===============================
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}


// ===============================
// CARGAR CARRITO
// ===============================
const carritoContainer = document.getElementById("carritoContainer");
const carritoVacio = document.getElementById("carritoVacio");

async function cargarCarrito() {
  try {
    const res = await fetch(`${API}/carrito`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const lista = await res.json();
    carritoActual = lista;

    if (!lista.length) {
      carritoContainer.innerHTML = "";
      carritoVacio.classList.remove("oculto");
      return;
    }

    carritoVacio.classList.add("oculto");
    renderCarrito(lista);

  } catch (err) {
    console.error("Error:", err);
  }
}


// ===============================
// AGRUPAR POR VENDEDOR
// ===============================
function agrupar(items) {
  const groups = {};

  items.forEach(it => {
    if (!groups[it.nombre_vendedor]) groups[it.nombre_vendedor] = [];
    groups[it.nombre_vendedor].push(it);
  });

  return groups;
}


// ===============================
// RENDER PRINCIPAL
// ===============================
function renderCarrito(items) {
  const grupos = agrupar(items);
  carritoContainer.innerHTML = "";

  Object.keys(grupos).forEach(vendedor => {
    const productos = grupos[vendedor];
    const total = productos.reduce((s, p) => s + p.precio * p.cantidad, 0);

    carritoContainer.innerHTML += `
      <div class="carrito-vendedor">

        <h2 class="vendedor-titulo">${vendedor}</h2>

        <div class="items-vendedor">
          ${productos.map(p => renderItem(p)).join("")}
        </div>

        <div class="total-vendedor">
          <p>Total vendedor:</p>
          <span>$${total}.00 MX</span>
        </div>

        <div class="orden-vendedor">
          <select class="select-entrega" id="entrega-${vendedor}">
            <option value="">Punto de entrega</option>
            <option value="1">UNACH</option>
            <option value="2">UNICACH</option>
            <option value="3">UP</option>
            <option value="4">TEC</option>
          </select>

          <button class="btn-pagar" onclick="crearOrden('${vendedor}')">
            Generar orden
          </button>
        </div>

      </div>
    `;
  });
}


// ===============================
// RENDER ITEM
// ===============================
function renderItem(i) {
  return `
    <div class="carrito-item">

      <img src="${i.imagen}" class="item-img">

      <div class="item-info">
        <h3>${i.nombre_producto}</h3>
        <p class="item-precio">$${i.precio}.00 MX</p>
        <p class="item-talla">Talla: ${i.nombre_talla}</p>

        <div class="cantidad-box">
          <label>Cantidad:</label>
          <select onchange="cambiarCantidad(${i.id_item}, this.value)">
            ${[1,2,3,4,5].map(n => `
              <option value="${n}" ${n == i.cantidad ? "selected" : ""}>${n}</option>
            `).join("")}
          </select>
        </div>
      </div>

      <button class="btn-eliminar" onclick="abrirModalEliminar(${i.id_item})">
        ✖
      </button>

    </div>
  `;
}


// ===============================
// MODAL DE CONFIRMACIÓN (ELIMINAR)
// ===============================
let idItemAEliminar = null;

const modal = document.getElementById("modalEliminar");
const btnCancelarModal = document.getElementById("btnCancelarModal");
const btnConfirmarModal = document.getElementById("btnConfirmarModal");

// Abrir modal
function abrirModalEliminar(idItem) {
  idItemAEliminar = idItem;
  modal.classList.add("mostrar");
}

// Cancelar
btnCancelarModal.addEventListener("click", () => {
  idItemAEliminar = null;
  modal.classList.remove("mostrar");
});

// Confirmar eliminación
btnConfirmarModal.addEventListener("click", async () => {
  if (!idItemAEliminar) return;

  try {
    await fetch(`${API}/carrito/items/${idItemAEliminar}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    toast("Producto eliminado 🗑");
    cargarCarrito();

  } catch (err) {
    console.error(err);
    toast("Error eliminando");
  }

  idItemAEliminar = null;
  modal.classList.remove("mostrar");
});


// ===============================
// CAMBIAR CANTIDAD
// ===============================
async function cambiarCantidad(idItem, nueva) {
  try {
    const item = carritoActual.find(x => x.id_item === idItem);

    if (!item) return toast("Error interno");

    // DELETE item viejo
    await fetch(`${API}/carrito/items/${idItem}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    // Re-crear con nueva cantidad
    await fetch(`${API}/carrito/items`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_producto: item.id_producto,
        id_talla: item.id_talla,
        cantidad: Number(nueva)
      })
    });

    toast("Cantidad actualizada ✓");
    cargarCarrito();

  } catch (err) {
    console.error(err);
  }
}


// ===============================
// CREAR ORDEN
// ===============================
async function crearOrden(vendedor) {
  const select = document.getElementById(`entrega-${vendedor}`);
  const idUni = Number(select.value);

  if (!idUni) return toast("Selecciona punto de entrega");

  try {
    const res = await fetch(`${API}/ordenes`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_universidad_entrega: idUni
      })
    });

    if (!res.ok) return toast("Error al generar orden");

    toast("Orden generada ✔");

    setTimeout(() => {
      window.location.href = "../mispedidoscliente/mispedidoscliente.html";
    }, 800);

  } catch (err) {
    console.error(err);
  }
}


// ===============================
// BOTÓN "VER PRODUCTOS"
// ===============================
document.getElementById("btnIrProductos").addEventListener("click", () => {
  window.location.href = "../productoscliente/productoscliente.html";
});


// ===============================
// INICIO
// ===============================
cargarCarrito();
