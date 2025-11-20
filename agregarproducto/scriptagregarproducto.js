// ===============================
//  CONFIG / PROTECCIÓN DE RUTA
// ===============================
const API_BASE = "http://52.200.165.176:7070/api";
const token = localStorage.getItem("userToken");
const rol = (localStorage.getItem("rol_usuario") || "").trim().toLowerCase();

// Solo empresas pueden ver esta vista
if (!token || rol !== "empresa") {
  window.location.href = "../login/login.html";
}

// ===============================
//  TOASTS (NOTIFICACIONES BONITAS)
// ===============================
const toastContainer = document.getElementById("toastContainer");

function showToast(type, message) {
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.classList.add(type === "success" ? "toast-success" : "toast-error");

  toast.innerHTML = `
    <span>${message}</span>
    <button>&times;</button>
  `;

  const closeBtn = toast.querySelector("button");
  closeBtn.addEventListener("click", () => {
    toastContainer.removeChild(toast);
  });

  toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toastContainer.removeChild(toast);
    }
  }, 3500);
}

// ===============================
//  CARGAR FOTO DEL VENDEDOR
// ===============================
async function cargarPerfilVendedor() {
  try {
    const res = await fetch(`${API_BASE}/vendedor/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      console.warn("No se pudo cargar perfil vendedor");
      return;
    }

    const data = await res.json();
    const imgPerfil = document.getElementById("imgPerfilNav");

    if (imgPerfil) {
      imgPerfil.src = data.logo || "../img/defaultuser.png";
    }
  } catch (err) {
    console.error("Error perfil:", err);
  }
}

cargarPerfilVendedor();

// ===============================
//  DROPDOWN PERFIL
// ===============================
const perfilArea = document.querySelector(".perfil-area");
const perfilMenu = document.getElementById("perfilMenu");

if (perfilArea) {
  perfilArea.addEventListener("click", (e) => {
    e.stopPropagation();
    perfilArea.classList.toggle("show");
  });
}

window.addEventListener("click", (e) => {
  if (perfilArea && !perfilArea.contains(e.target)) {
    perfilArea.classList.remove("show");
  }
});

// ===============================
//  LOGOUT
// ===============================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../login/login.html";
  });
}

// ===============================
//  CARGA / PREVIEW DE IMAGEN
// ===============================
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const previewContainer = document.getElementById("previewContainer");
const imagePreview = document.getElementById("imagePreview");
const removeImageBtn = document.getElementById("removeImage");

if (uploadBox && fileInput) {
  uploadBox.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Solo permitir PNG
    if (file.type !== "image/png") {
      showToast("error", "Solo se permiten imágenes PNG (.png).");
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (imagePreview && previewContainer && uploadBox) {
        imagePreview.src = reader.result;
        uploadBox.style.display = "none";
        previewContainer.style.display = "block";
      }
    };
    reader.readAsDataURL(file);
  });
}

if (removeImageBtn) {
  removeImageBtn.addEventListener("click", () => {
    if (!fileInput || !imagePreview || !previewContainer || !uploadBox) return;

    fileInput.value = "";
    imagePreview.src = "";
    previewContainer.style.display = "none";
    uploadBox.style.display = "flex";
  });
}

// ===============================
//  FORMULARIO: ENVIAR A BACKEND
// ===============================
const productForm = document.getElementById("productForm");

if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!fileInput || !fileInput.files[0]) {
      showToast("error", "Sube una imagen PNG del producto.");
      return;
    }

    const file = fileInput.files[0];

    // Validar selects básicos
    const categoria = parseInt(document.getElementById("categoria").value);
    const material = parseInt(document.getElementById("material").value);
    const institucion = parseInt(document.getElementById("institucion").value);

    if (isNaN(categoria) || isNaN(material) || isNaN(institucion)) {
      showToast("error", "Selecciona material, categoría e institución válidos.");
      return;
    }

    const nombre = document.getElementById("productName").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio = document.getElementById("precio").value;

    if (!nombre || !descripcion || !precio) {
      showToast("error", "Completa todos los campos obligatorios.");
      return;
    }

    const stockCH = parseInt(document.getElementById("stockCH").value) || 0;
    const stockM  = parseInt(document.getElementById("stockM").value) || 0;
    const stockG  = parseInt(document.getElementById("stockG").value) || 0;

    const tallas = [
      { nombre_talla: "CH", stock_disponible: stockCH },
      { nombre_talla: "M",  stock_disponible: stockM },
      { nombre_talla: "G",  stock_disponible: stockG }
    ];

    const formData = new FormData();
    formData.append("nombre_producto", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", precio);
    formData.append("id_categoria", categoria);
    formData.append("id_material", material);
    formData.append("id_institucion", institucion);
    formData.append("tallas", JSON.stringify(tallas));
    formData.append("imagen", file);

    const statusMsg = document.getElementById("statusMsg");
    if (statusMsg) {
      statusMsg.textContent = "Enviando producto...";
    }

    try {
      const response = await fetch(`${API_BASE}/vendedor/productos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}` // importante: SOLO auth, sin Content-Type
        },
        body: formData
      });

      let data = null;
      try {
        data = await response.json();
      } catch (_) {
        // puede que el backend no devuelva JSON, no pasa nada
      }

      if (response.ok) {
        showToast("success", "Producto enviado para aprobación ✅");

        console.log("Producto creado:", data);

        // Resetear formulario
        productForm.reset();
        if (fileInput) fileInput.value = "";
        if (imagePreview && previewContainer && uploadBox) {
          imagePreview.src = "";
          previewContainer.style.display = "none";
          uploadBox.style.display = "flex";
        }

        if (statusMsg) statusMsg.textContent = "Producto guardado correctamente.";

      } else {
        console.error("Error en backend:", data);
        const msgError = (data && (data.error || data.message)) || "Revisa los campos o el token.";
        showToast("error", `No se pudo guardar el producto: ${msgError}`);
        if (statusMsg) statusMsg.textContent = "Error al guardar el producto.";
      }

    } catch (error) {
      console.error("Error de red:", error);
      showToast("error", "No se pudo conectar con el servidor.");
      if (statusMsg) statusMsg.textContent = "Error de conexión.";
    }
  });
}
