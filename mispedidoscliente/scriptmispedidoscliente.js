// ===============================
// CONFIGURACIÓN
// ===============================
const API = "http://52.200.165.176:7070/api";
const token = localStorage.getItem("userToken");
const rol = localStorage.getItem("rol_usuario");

if (!token || rol !== "cliente") {
  window.location.href = "../login/login.html";
}

const pedidosContainer = document.getElementById("pedidosContainer");
const sinPedidos = document.getElementById("sinPedidos");


// ===============================
// FORMATEAR FECHA (C sin hora)
// ===============================
function formatearFecha(arr) {
  const meses = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre"
  ];
  return `${arr[2]} de ${meses[arr[1]-1]} de ${arr[0]}`;
}


// ===============================
// AGRUPAR POR ORDEN
// ===============================
function agrupar(lista) {
  const map = {};
  lista.forEach(item => {
    if (!map[item.id_orden]) map[item.id_orden] = [];
    map[item.id_orden].push(item);
  });
  return map;
}


// ===============================
// CARGAR PEDIDOS
// ===============================
async function cargarPedidos() {
  try {
    const res = await fetch(`${API}/ordenes`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const lista = await res.json();

    if (!lista.length) {
      sinPedidos.classList.remove("oculto");
      return;
    }

    sinPedidos.classList.add("oculto");
    renderPedidos(lista);

  } catch (err) {
    console.error("Error:", err);
  }
}


// ===============================
// MAPEAR ESTADOS A ESTILO CREW
// ===============================
function estadoBonito(estado) {
  const e = estado.toLowerCase();

  if (e === "pendiente" || e === "proceso") {
    return { texto: "En proceso", clase: "estado proceso" }; // naranja
  }
  if (e === "entregado") {
    return { texto: "Entregado", clase: "estado entregado" }; // verde
  }
  if (e === "cancelado") {
    return { texto: "Cancelado", clase: "estado cancelado" }; // rojo
  }

  return { texto: estado, clase: "estado otro" }; // neutro
}


// ===============================
// RENDER PEDIDOS
// ===============================
function renderPedidos(lista) {
  const grupos = agrupar(lista);
  pedidosContainer.innerHTML = "";

  Object.keys(grupos).forEach(id => {
    const items = grupos[id];
    const primero = items[0];

    const fecha = formatearFecha(primero.fecha_orden);
    const estadoInfo = estadoBonito(primero.estado_orden);

    const mostrarBoton =
      estadoInfo.texto.toLowerCase().includes("pendiente") ||
      estadoInfo.texto.toLowerCase().includes("validación");

    pedidosContainer.innerHTML += `
      <article class="pedido-card">
        <h3 class="pedido-header">
          Pedido #${id}
          <span class="pedido-fecha">Pedido realizado el ${fecha}</span>
        </h3>

        <div class="pedido-body">
          <img src="${primero.imagen_producto}" class="pedido-img">

          <div class="pedido-info">
            <h2 class="${estadoInfo.clase}">
              ${estadoInfo.texto}
            </h2>

            <p class="vendedor">Vendedor: ${primero.nombre_vendedor}</p>
            <p class="cantidad">${items.length} productos en esta orden</p>

            <p class="total">Total: <strong>$${primero.total_orden}.00 MX</strong></p>

            ${
              mostrarBoton
                ? `<button class="btn-voucher" onclick="abrirModalComprobante(${id})">
                    Subir comprobante
                   </button>`
                : ""
            }
          </div>
        </div>
      </article>
    `;
  });
}

let ordenActualSubida = null;

function abrirModalComprobante(idOrden) {
  ordenActualSubida = idOrden;

  const modal = document.createElement("div");
  modal.classList.add("modal-bg");
  modal.id = "modalPago";

  modal.innerHTML = `
    <div class="modal">
      <h2>Subir Comprobante de Pago</h2>

      <div class="tarjeta">
        <p><strong>TRANSFERENCIA A:</strong></p>
        <p class="tarjeta-numero">2025 7789 4419 5521</p>
        <p>Banco BBVA · Titular: CREW Oficial</p>
      </div>

      <input type="file" id="filePago" class="input-file" accept="image/*, .pdf">

      <button class="btn-subir" onclick="enviarComprobante()">Enviar comprobante</button>
      <br><br>
      <button class="btn-subir" style="background:#bbb;color:black" onclick="cerrarModal()">Cancelar</button>
    </div>
  `;

  document.body.appendChild(modal);
}

function cerrarModal() {
  const modal = document.getElementById("modalPago");
  if (modal) modal.remove();
}

async function enviarComprobante() {
  const file = document.getElementById("filePago").files[0];
  if (!file) return alert("Selecciona un archivo.");

  const formData = new FormData();
  formData.append("comprobante", file);

  try {
    const res = await fetch(`${API}/ordenes/${ordenActualSubida}/comprobante`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) throw new Error("Error subiendo comprobante");

    alert("Comprobante enviado correctamente ✔");
    cerrarModal();
    cargarPedidos();

  } catch (err) {
    console.error(err);
    alert("Hubo un error al subir el comprobante.");
  }
}



// ===============================
// INICIO
// ===============================
cargarPedidos();