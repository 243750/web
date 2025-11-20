// ============================
// NAVBAR CLIENTE DINÁMICO
// ============================

(function () {

  // Helper seguro para leer valores del localStorage
  function localProperty(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  }

  const token = localProperty("userToken");
  const rol = localProperty("rol_usuario");

  const navContainer =
    document.getElementById("navbarCliente") ||
    document.getElementById("navbar-cliente") ||
    document.getElementById("navbar");

  if (!navContainer) return;

  // ============================
  // HTML DEL NAVBAR
  // ============================
  navContainer.innerHTML = `
    <header class="navbar">
      <a href="../homecliente/homecliente.html" class="logo">CREW</a>

      <!-- Categoría -->
      <div class="category-area">
        <button class="category-btn" id="categoryBtn">
          <img src="../navbarcliente/img/iconocategoria.png" class="icon-category" alt="Categoría" />
          Categoría
        </button>
        <div id="categoryMenu" class="category-dropdown"></div>
      </div>

      <!-- Buscador -->
      <div class="search-container">
        <input type="text" id="navBusqueda" placeholder="Buscar productos..." />
        <button class="search-btn" id="navBtnBuscar">Buscar</button>
      </div>

      <!-- Iconos derecha -->
      <div class="nav-icons">
        <a href="../misfavoritos/misfavoritos.html">
          <img src="../navbarcliente/img/iconofavorito.png" class="icon" alt="Favoritos" />
        </a>

        <a href="../carrito/carrito.html">
          <img src="../navbarcliente/img/iconocarrito.png" class="icon" alt="Carrito" />
        </a>

        <div class="cuenta-area">
          <button class="cuenta-btn" id="cuentaBtn">
            <img src="../navbarcliente/img/iconoperfilnuevo.png" class="icon" alt="Cuenta" />
          </button>

          <div id="cuentaMenu" class="cuenta-dropdown">
            <a href="../perfilcliente/perfilcliente.html">Mi perfil</a>
            <a href="../mispedidoscliente/mispedidoscliente.html">Mis pedidos</a>
            <hr />
            <a href="#" id="logoutBtn" class="logout">Cerrar sesión</a>
          </div>
        </div>
      </div>
    </header>
  `;

  // ============================
  // LÓGICA NAVBAR
  // ============================

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);

    setTimeout(() => t.classList.add("show"), 50);
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 300);
    }, 2000);
  }

  // --- Categorías ---
  const categoryBtn = document.getElementById("categoryBtn");
  const categoryMenu = document.getElementById("categoryMenu");

  if (categoryMenu) {
    categoryMenu.innerHTML = `
      <a data-cat="2">Deportivo</a>
      <a data-cat="1">Casual</a>
      <a data-cat="3">Formal</a>
      <hr>
      <a href="../productoscliente/productoscliente.html">Todas las categorías</a>
    `;
  }

  categoryBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    categoryMenu.classList.toggle("show");
  });

  categoryMenu?.addEventListener("click", (e) => {
    const link = e.target.closest("[data-cat]");
    if (!link) return;
    const idCat = link.getAttribute("data-cat");
    window.location.href =
      `../productoscliente/productoscliente.html?categoria=${encodeURIComponent(idCat)}`;
  });

  // --- Cuenta / logout ---
  const cuentaBtn = document.getElementById("cuentaBtn");
  const cuentaMenu = document.getElementById("cuentaMenu");
  const logoutBtn = document.getElementById("logoutBtn");

  cuentaBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    cuentaMenu.classList.toggle("show");
  });

  logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "../login/login.html";
  });

  window.addEventListener("click", () => {
    categoryMenu?.classList.remove("show");
    cuentaMenu?.classList.remove("show");
  });

  // ============================
  // BUSCADOR GLOBAL — FIX
  // ============================
  const inputBusqueda = document.getElementById("navBusqueda");
  const btnBuscar = document.getElementById("navBtnBuscar");

  function ejecutarBusqueda() {
    const texto = (inputBusqueda.value || "").trim();
    if (!texto) {
      toast("Escribe algo para buscar ");
      return;
    }

    // CORREGIDO: usamos search= en vez de buscar=
    window.location.href =
      `../productoscliente/productoscliente.html?search=${encodeURIComponent(texto)}`;
  }

  btnBuscar?.addEventListener("click", ejecutarBusqueda);
  inputBusqueda?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") ejecutarBusqueda();
  });

})();
