document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://54.163.133.21:7070/api/vendedor/productos";
  const productosContainer = document.querySelector(".content-row");
  const noProductsMsg = document.getElementById("noProducts");

  // 🔸 Token temporal (se reemplazará al conectar con login real)
  const token = localStorage.getItem("token") || "FAKE_TOKEN_POR_AHORA";

  // 🔹 Cargar productos del vendedor
  async function cargarProductos() {
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al obtener los productos");
      const productos = await response.json();

      // Limpiar la vista
      document.querySelectorAll(".producto-card").forEach(el => el.remove());

      if (!productos.length) {
        noProductsMsg.style.display = "block";
        return;
      }

      noProductsMsg.style.display = "none";

      productos.forEach(producto => {
        const card = document.createElement("div");
        card.classList.add("producto-card");

        card.innerHTML = `
          <img src="${producto.imagen || 'img/placeholder.png'}" alt="${producto.nombre}">
          <h3>${producto.nombre}</h3>
          <p>${producto.material} - ${producto.categoria}</p>
          <p class="precio">$${producto.precio.toFixed(2)}</p>
          <div class="acciones">
            <button class="btn-editar" data-id="${producto.id_producto}">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-eliminar" data-id="${producto.id_producto}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        `;

        productosContainer.appendChild(card);
      });

      agregarEventos();
    } catch (error) {
      console.error("Error cargando productos:", error);
      noProductsMsg.textContent = "No se pueden cargar los productos.";
      noProductsMsg.style.color = "red";
    }
  }
const cuentaBtn  = document.getElementById("cuentaBtn");
const cuentaMenu = document.getElementById("cuentaMenu");

cuentaBtn.addEventListener("click", e => {
  e.stopPropagation();
  cuentaMenu.classList.toggle("show");
});

window.addEventListener("click", () => cuentaMenu.classList.remove("show"));

  // 🔹 Eliminar producto
  async function eliminarProducto(id) {
    const confirmar = confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmar) return;

    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("No se pudo eliminar el producto");
      alert("Producto eliminado con éxito");
      cargarProductos();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el producto");
    }
  }

  // 🔹 Eventos de botones (eliminar y editar)
  function agregarEventos() {
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", () => eliminarProducto(btn.dataset.id));
    });

    document.querySelectorAll(".btn-editar").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        alert(`Redirigiendo a editar producto ${id}...`);
        // window.location.href = `/editar-producto.html?id=${id}`;
      });
    });
  }

  // 🔹 Simulación de dropdown de Categoría
  const categoryBtn = document.getElementById("categoryBtn");
  const categoryMenu = document.getElementById("categoryMenu");

  const opcionesCategoria = [
    "Deportivo", "Casual", "Formal",
    "UP", "UNACH", "UNICACH", "TEC"
  ];

  opcionesCategoria.forEach(opcion => {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = opcion;
    a.addEventListener("click", () => {
      alert(`Filtrando por ${opcion}`);
      categoryMenu.style.display = "none";
    });
    categoryMenu.appendChild(a);
  });

  categoryBtn.addEventListener("click", () => {
    categoryMenu.style.display = categoryMenu.style.display === "block" ? "none" : "block";
  });

  // 🔹 Dropdown de notificaciones y perfil
  const notifBtn = document.getElementById("notif-btn");
  const notifDropdown = document.getElementById("notif-dropdown");
  const profileBtn = document.getElementById("profile-btn");
  const profileDropdown = document.getElementById("profile-dropdown");

  notifBtn.addEventListener("click", () => {
    notifDropdown.classList.toggle("show");
    profileDropdown.classList.remove("show");
  });

  profileBtn.addEventListener("click", () => {
    profileDropdown.classList.toggle("show");
    notifDropdown.classList.remove("show");
  });

  window.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown") && !e.target.closest(".category-area")) {
      notifDropdown.classList.remove("show");
      profileDropdown.classList.remove("show");
      categoryMenu.style.display = "none";
    }
  });

  // Inicialización
  cargarProductos();
});
