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
// TOAST BONITO CREW
// ===============================
function showToast(msg, tipo = "ok") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "toast show " + tipo;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}


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
// NORMALIZAR ESTADO (ULTRA ROBUSTO)
// ===============================
function estadoBonito(estado) {
  if (!estado) return { texto: "Desconocido", clase: "estado otro" };

  const e = estado.toLowerCase();

  if (
    e.includes("pend") ||
    e.includes("pago") ||
    e.includes("proceso") ||
    e.includes("revision") ||
    e.includes("valid")
  ) {
    return { texto: "En proceso", clase: "estado proceso" };
  }

  if (e.includes("entreg")) return { texto: "Entregado", clase: "estado entregado" };
  if (e.includes("cancel")) return { texto: "Cancelado", clase: "estado cancelado" };

  return { texto: estado, clase: "estado otro" };
}


// ===============================
// ¿PUEDO SUBIR COMPROBANTE?
// ===============================
function puedeSubirComprobante(estadoBackend) {
  if (!estadoBackend) return false;
  const e = estadoBackend.toLowerCase();

  return (
    e.includes("ordenado") ||
    e.includes("pend") ||
    e.includes("pago") ||
    e.includes("revision") ||
    e.includes("valid")
  );
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

    const mostrarBoton = puedeSubirComprobante(primero.estado_orden);

    // --- NUEVO: FORMATEAR FECHA DE ENTREGA ---
    let fechaEntregaHTML = "";
    if (primero.fecha_entrega && (
      estadoInfo.texto === "En proceso" || 
      estadoInfo.texto === "Entregado"
    )) {
      const f = primero.fecha_entrega;
      const fechaBonita = `${f[2]} de ${[
        "enero","febrero","marzo","abril","mayo","junio",
        "julio","agosto","septiembre","octubre","noviembre","diciembre"
      ][f[1]-1]} de ${f[0]}`;

      fechaEntregaHTML = `
        <p class="entrega-estimada">
         <strong>Entrega estimada:</strong> ${fechaBonita}
        </p>
      `;
    }

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

            ${fechaEntregaHTML}

            <p class="vendedor">Vendedor: ${primero.nombre_vendedor || "—"}</p>
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




// ===============================
// MODAL SUBIR COMPROBANTE
// ===============================
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

      <input type="file" id="filePago" class="input-file" accept="image/*">

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


// ===============================
// ENVIAR COMPROBANTE (CON TOAST)
// ===============================
async function enviarComprobante() {
  const file = document.getElementById("filePago").files[0];

  if (!file) return showToast("Selecciona una imagen.", "error");

  const formData = new FormData();
  formData.append("comprobante", file);

  try {
    const res = await fetch(`${API}/ordenes/${ordenActualSubida}/comprobante`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) throw new Error("Error subiendo comprobante");

    showToast("Comprobante enviado correctamente ✔", "ok");

    cerrarModal();
    cargarPedidos();

  } catch (err) {
    console.error(err);
    showToast("Error al subir el comprobante", "error");
  }
}



// ===============================
// INICIO
// ===============================
cargarPedidos();
