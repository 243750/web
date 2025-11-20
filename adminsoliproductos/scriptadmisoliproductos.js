document.addEventListener('DOMContentLoaded', () => {
  // ====== NODOS ======
  const notifBtn       = document.getElementById('notif-btn');
  const profileBtn     = document.getElementById('profile-btn');
  const notifDropdown  = document.getElementById('notif-dropdown');
  const profileDropdown= document.getElementById('profile-dropdown');
  const categoryBtn    = document.getElementById('categoryBtn');
  const categoryMenu   = document.getElementById('categoryMenu');

  // Cargar categorías con guardas (si falta el div, no rompe todo)
  if (categoryMenu) {
    categoryMenu.innerHTML = `
      <a href="#">Deportivo</a>
      <a href="#">Casual</a>
      <a href="#">Formal</a>
      <hr style="border:none;border-top:1px solid #eee;margin:6px 0;">
      <a href="#">Todas las categorías</a>
    `;
  }

  const DROPS = [
    { btn: notifBtn,    menu: notifDropdown },
    { btn: profileBtn,  menu: profileDropdown },
    { btn: categoryBtn, menu: categoryMenu },
  ];

  // Utilidad: cerrar todos
  const closeAll = () => {
    DROPS.forEach(({menu, btn}) => {
      if (!menu) return;
      menu.classList.remove('show');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  };

  // Delegación: abrir/cerrar el correspondiente
  DROPS.forEach(({ btn, menu }) => {
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = menu.classList.contains('show');
      closeAll();
      if (!isOpen) {
        menu.classList.add('show');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Evitar que clicks dentro del menú cierren todo
    menu.addEventListener('click', (e) => e.stopPropagation());
  });

  // Cierre global
  window.addEventListener('click', closeAll);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

  // ====== RENDER DEMO ======
  const productList = document.getElementById("productList");
  function render(productos) {
    if (!productList) return;
    if (!productos?.length) {
      productList.innerHTML = `<p class="no-products">No hay solicitudes de productos pendientes.</p>`;
      return;
    }
    productList.innerHTML = productos.map(p => `
      <div class="product-card">
        <img src="${p.imagen}" alt="${p.nombre}">
        <div class="product-info">
          <h3>${p.nombre}</h3>
          <p>${p.material} - ${p.categoria}</p>
          <p><strong>$${Number(p.precio).toFixed(2)}</strong></p>
          <p><strong>Vendedor:</strong> ${p.vendedor}</p>
        </div>
        <div class="card-actions">
          <button class="btn-approve" onclick="aprobarProducto(${p.id})">✔ Aceptar</button>
          <button class="btn-reject"  onclick="rechazarProducto(${p.id})">✖ Rechazar</button>
        </div>
      </div>
    `).join('');
  }

  render([
    { id:1, nombre:'Sudadera UNICACH', categoria:'Deportivo', material:'Algodón',  precio:300, vendedor:'Jarvis', imagen:'https://picsum.photos/seed/a/600/400' },
    { id:2, nombre:'Chaqueta UNACH',   categoria:'Casual',    material:'Algodón',  precio:400, vendedor:'Mars',   imagen:'https://picsum.photos/seed/b/600/400' },
    { id:3, nombre:'Jersey UP',        categoria:'Deportivo', material:'Poliéster',precio:220, vendedor:'Pogo',   imagen:'https://picsum.photos/seed/c/600/400' },
  ]);
});

// ====== ALERTAS (global) ======
window.aprobarProducto = (id) => {
  if (confirm('¿Seguro que deseas aprobar este producto?')) {
    alert('✅ Producto aprobado exitosamente.');
  }
};
window.rechazarProducto = (id) => {
  if (confirm('¿Seguro que deseas rechazar este producto?')) {
    alert('❌ Solicitud de producto rechazada.');
  }
};
