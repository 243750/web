/* ============================================
   CONFIGURACIÓN BASE
============================================ */
const API = "http://52.200.165.176:7070/api";
const token = localStorage.getItem("userToken");
const rol = (localStorage.getItem("rol_usuario") || "").toLowerCase();

if (!token || rol !== "empresa") {
  window.location.href = "../login/login.html";
}

const pedidosContainer = document.getElementById("pedidosContainer");


/* ============================================
   ALERTA PROFESIONAL CREW
============================================ */
function mostrarAlerta(msg, ok = true) {
  const fondo = document.createElement("div");
  fondo.style.position = "fixed";
  fondo.style.top = 0;
  fondo.style.left = 0;
  fondo.style.width = "100%";
  fondo.style.height = "100%";
  fondo.style.background = "rgba(0,0,0,.45)";
  fondo.style.display = "flex";
  fondo.style.justifyContent = "center";
  fondo.style.alignItems = "center";
  fondo.style.zIndex = "3000";

  const card = document.createElement("div");
  card.style.background = "#fff";
  card.style.padding = "25px 35px";
  card.style.borderRadius = "12px";
  card.style.fontFamily = "Philosopher";
  card.style.textAlign = "center";
  card.style.maxWidth = "420px";
  card.style.animation = "fadeIn .2s";

  const icon = ok ? "✔️" : "❌";

  card.innerHTML = `
    <h2 style="margin-bottom:12px; color:${ok ? "#4CAF50" : "#C62828"}">${icon}</h2>
    <p style="font-size:17px; margin-bottom:22px;">${msg}</p>
    <button id="alertOkBtn" 
      style="padding:10px 20px; background:#6B1FAD; color:#fff;
      border:none; border-radius:8px; cursor:pointer; font-family:Philosopher">
      Aceptar
    </button>
  `;

  fondo.appendChild(card);
  document.body.appendChild(fondo);

  document.getElementById("alertOkBtn").onclick = () => fondo.remove();
}


/* ============================================
   FOTO PERFIL VENDEDOR
============================================ */
async function cargarFotoPerfil() {
  try {
    const res = await fetch(`${API}/vendedor/perfil`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;

    const data = await res.json();
    document.getElementById("imgPerfilNav").src =
      data.logo || "../img/defaultuser.png";
  } catch (err) {
    console.error("Error al cargar perfil:", err);
  }
}

cargarFotoPerfil();

/* DROPDOWN PERFIL */
const perfilArea = document.querySelector(".perfil-area");

perfilArea.addEventListener("click", () => {
  perfilArea.classList.toggle("show");
});

window.addEventListener("click", (e) => {
  if (!perfilArea.contains(e.target)) {
    perfilArea.classList.remove("show");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../login/login.html";
});


/* ============================================
   FECHAS
============================================ */
function formatearFecha(f) {
  const y = f[0];
  const m = f[1].toString().padStart(2, "0");
  const d = f[2].toString().padStart(2, "0");
  return `${d}/${m}/${y}`;
}

function fechaInputValue(f) {
  const y = f[0];
  const m = f[1].toString().padStart(2, "0");
  const d = f[2].toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}


/* ============================================
   CARGAR PEDIDOS
============================================ */
async function cargarPedidos() {
  try {
    const res = await fetch(`${API}/vendedor/pedidos`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    console.log("DEBUG → Pedido crudo:", JSON.stringify(data, null, 2));

    renderPedidos(data);

  } catch (err) {
    console.error("Error cargando pedidos:", err);
  }
}

cargarPedidos();


/* ============================================
   RENDER PEDIDOS
============================================ */
function renderPedidos(lista) {
  pedidosContainer.innerHTML = "";

  lista.forEach(pedido => {
    const fechaOrden = formatearFecha(pedido.fecha_orden);
    const fechaEntrega = pedido.fecha_entrega
      ? fechaInputValue(pedido.fecha_entrega)
      : "";

    pedidosContainer.innerHTML += `
      <article class="pedido-card">
        
        <h3>
          Pedido #${pedido.id_orden} — ${fechaOrden}
        </h3>

        <p style="margin:6px 0 14px; font-family:Philosopher; color:#6B1FAD;">
          👤 Cliente: <strong>${pedido.nombre_cliente}</strong>
        </p>

        <div class="pedido-body">
          <img src="${pedido.imagen_producto}" class="pedido-img">

          <div class="pedido-info">

            <label>Estado del pedido</label>
            <select id="estado_${pedido.id_orden}" class="estado-select">
              <option value="Ordenado" ${pedido.estado_orden === "Ordenado" ? "selected" : ""}>Ordenado</option>
              <option value="En proceso" ${pedido.estado_orden === "En proceso" ? "selected" : ""}>En proceso</option>
              <option value="Entregado" ${pedido.estado_orden === "Entregado" ? "selected" : ""}>Entregado</option>
            </select>

            <label style="margin-top:10px;">Fecha estimada de entrega:</label>
            <input type="date" id="fecha_${pedido.id_orden}" value="${fechaEntrega}" />

            <button class="guardar-btn" onclick="guardarCambios(${pedido.id_orden})">
              Guardar cambios
            </button>

            ${
              pedido.comprobante_url
                ? `<button class="btn-ver-comprobante"
                     onclick="verComprobante('${pedido.comprobante_url}')"
                     style="margin-top:12px; background:#6B1FAD; color:#fff; border:none; padding:8px 14px; border-radius:8px; cursor:pointer;">
                     Ver comprobante
                   </button>`
                : ""
            }

          </div>
        </div>
      </article>
    `;
  });
}


/* ============================================
   MODAL COMPROBANTE
============================================ */
function verComprobante(url) {
  const modal = document.getElementById("modalComprobante");
  document.getElementById("imgComprobante").src = url;
  modal.classList.remove("oculto");
}

function cerrarModal() {
  document.getElementById("modalComprobante").classList.add("oculto");
}


/* ============================================
   GUARDAR CAMBIOS
============================================ */
async function guardarCambios(id) {
  const estado = document.getElementById(`estado_${id}`).value;
  const fecha = document.getElementById(`fecha_${id}`).value;

  const body = {
    estado,
    fecha_entrega: fecha || null
  };

  try {
    const res = await fetch(`${API}/vendedor/pedidos/${id}/estado`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      mostrarAlerta("No se pudo actualizar el pedido.", false);
      return;
    }

    mostrarAlerta("Cambios guardados correctamente.");

  } catch (err) {
    console.error("Error guardando:", err);
    mostrarAlerta("Error al conectar con servidor.", false);
  }
}
