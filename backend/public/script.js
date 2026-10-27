/* ═══════════════════════════════════
   NØMAD — Frontend Interactivo con CRUD
   Conectado a MongoDB y SQL Server
   ═══════════════════════════════════ */

let productosGlobales = [];
let categoriasGlobales = [];
let carrito = JSON.parse(localStorage.getItem('nomad_cart') || '[]');
let currentFilter = 'todos';
let currentCategory = null;
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCart();
  cargarProductos();
  cargarResenas();
  initSearch();
  initFilters();
});


// ═══════════════════════════════════
// 1. NAVBAR & NAVEGACIÓN
// ═══════════════════════════════════
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  let open = false;

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      open = !open;
      mobileMenu.style.maxHeight = open ? mobileMenu.scrollHeight + 'px' : '0';
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        open = false;
        mobileMenu.style.maxHeight = '0';
      });
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = (navbar?.offsetHeight || 70) + 10;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}


// ═══════════════════════════════════
// 2. PRODUCTOS (MONGODB CRUD)
// ═══════════════════════════════════
async function cargarProductos() {
  const grid = document.getElementById('productos-grid');
  try {
    const res = await fetch('/api/productos');
    const json = await res.json();
    productosGlobales = json.data || [];

    if (productosGlobales.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-humo">
          <p class="font-display text-lg mb-2">No hay prendas registradas en MongoDB.</p>
          <a href="admin.html" class="inline-block bg-carbon text-white text-xs uppercase px-5 py-2.5 mt-2 hover:bg-terracota transition-colors">
            + Crear primer producto en Admin
          </a>
        </div>
      `;
      return;
    }

    renderProductos();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-humo">
        <p class="text-sm text-red-500 mb-2">No se pudo conectar con el servidor backend (${error.message}).</p>
        <p class="text-xs">Asegurate de que el servidor Node esté corriendo con <code class="bg-carbon/10 px-1 py-0.5 rounded font-mono">npm run dev</code>.</p>
      </div>
    `;
  }
}

function renderProductos() {
  const grid = document.getElementById('productos-grid');
  let filtrados = productosGlobales;

  // Filtro de género
  if (currentFilter !== 'todos') {
    filtrados = filtrados.filter(p => (p.genero || 'unisex').toLowerCase() === currentFilter.toLowerCase());
  }

  // Filtro de categoría
  if (currentCategory) {
    filtrados = filtrados.filter(p => (p.categoria || '').toLowerCase() === currentCategory.toLowerCase());
  }

  // Búsqueda en vivo
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filtrados = filtrados.filter(p => 
      (p.nombre && p.nombre.toLowerCase().includes(q)) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(q)) ||
      (p.categoria && p.categoria.toLowerCase().includes(q))
    );
  }

  if (filtrados.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-14 text-center text-humo">
        <p class="text-base font-display mb-2">No encontramos prendas con esos filtros.</p>
        <button onclick="resetFilters()" class="text-xs text-terracota underline underline-offset-4">
          Restablecer filtros
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtrados.map(p => {
    const imgUrl = (p.imagenes && p.imagenes.length > 0 && p.imagenes[0])
      ? p.imagenes[0]
      : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80';

    const precioFormateado = '$' + Number(p.precio).toLocaleString('es-CO');
    const badgeNuevo = (p.etiquetas && p.etiquetas.includes('nuevo'))
      ? `<span class="absolute top-3 left-3 bg-oliva text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5">Nuevo</span>`
      : '';
    const badgeDescuento = (p.precio_descuento && p.precio_descuento > p.precio)
      ? `<span class="absolute top-3 right-3 bg-terracota text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5">Promo</span>`
      : '';

    const tallasStr = (p.tallas && p.tallas.length > 0) ? p.tallas.join(' · ') : 'Única';

    return `
      <article class="product-card group relative flex flex-col justify-between" data-id="${p._id}">
        <div>
          <!-- Contenedor imagen -->
          <div class="relative aspect-[3/4] overflow-hidden bg-arena/40 mb-4 cursor-pointer">
            <img
              src="${imgUrl}"
              alt="${p.nombre}"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            >
            ${badgeNuevo}
            ${badgeDescuento}

            <!-- Botón hover rápido añadir -->
            <div class="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onclick="agregarAlCarrito('${p._id}')"
                class="w-full bg-carbon text-white text-xs font-semibold tracking-wider uppercase py-2.5 hover:bg-terracota transition-colors shadow-lg flex items-center justify-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                Añadir al carrito
              </button>
            </div>
          </div>

          <!-- Metadatos de la prenda -->
          <div>
            <div class="flex justify-between items-start gap-1">
              <h3 class="font-medium text-sm text-carbon mb-0.5 leading-snug">${p.nombre}</h3>
            </div>
            <p class="text-humo text-xs mb-2">Tallas: ${tallasStr} · <span class="capitalize">${p.genero || 'unisex'}</span></p>
          </div>
        </div>

        <div class="flex items-baseline gap-2 pt-1 border-t border-carbon/5">
          <span class="font-bold text-sm text-carbon">${precioFormateado}</span>
          ${p.precio_descuento ? `<span class="text-humo text-xs line-through">$${Number(p.precio_descuento).toLocaleString('es-CO')}</span>` : ''}
          <span class="ml-auto text-[10px] text-humo font-mono">${p.stock} disp.</span>
        </div>
      </article>
    `;
  }).join('');

  // Activar animación de entrada progresiva
  const cards = grid.querySelectorAll('.product-card');
  cards.forEach((c, idx) => {
    setTimeout(() => c.classList.add('visible'), idx * 50);
  });
}

function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active', 'bg-carbon', 'text-white');
        b.classList.add('text-humo', 'border-carbon/20');
      });
      btn.classList.add('active', 'bg-carbon', 'text-white');
      btn.classList.remove('text-humo', 'border-carbon/20');

      currentFilter = btn.dataset.filter || 'todos';
      renderProductos();
    });
  });
}

function setCategoryFilter(categoria) {
  currentCategory = categoria;
  mostrarToast(`Filtrando por categoría: ${categoria}`);
  renderProductos();
  const coleccionEl = document.getElementById('coleccion');
  if (coleccionEl) {
    const top = coleccionEl.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

function resetFilters() {
  currentCategory = null;
  currentFilter = 'todos';
  searchQuery = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(b => {
    if (b.dataset.filter === 'todos') {
      b.classList.add('active', 'bg-carbon', 'text-white');
      b.classList.remove('text-humo', 'border-carbon/20');
    } else {
      b.classList.remove('active', 'bg-carbon', 'text-white');
      b.classList.add('text-humo', 'border-carbon/20');
    }
  });

  renderProductos();
}

function initSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProductos();
  });
}


// ═══════════════════════════════════
// 3. CARRITO & PEDIDOS (SQL SERVER CRUD)
// ═══════════════════════════════════
function initCart() {
  const openBtn = document.getElementById('open-cart-btn');
  if (openBtn) {
    openBtn.addEventListener('click', () => toggleCartDrawer(true));
  }
  actualizarVistaCarrito();
}

function toggleCartDrawer(open) {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (!drawer || !overlay) return;

  if (open) {
    drawer.classList.add('open');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100');
  } else {
    drawer.classList.remove('open');
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0', 'pointer-events-none');
  }
}

function agregarAlCarrito(productoId) {
  const prod = productosGlobales.find(p => p._id === productoId);
  if (!prod) return;

  const itemExistente = carrito.find(item => item.producto_id === productoId);
  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carrito.push({
      producto_id: prod._id,
      nombre: prod.nombre,
      precio: prod.precio,
      imagen: (prod.imagenes && prod.imagenes[0]) || '',
      talla: (prod.tallas && prod.tallas[0]) || 'M',
      cantidad: 1
    });
  }

  guardarCarrito();
  actualizarVistaCarrito();
  mostrarToast(`✓ "${prod.nombre}" añadido al carrito.`);

  // Animación del badge
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.classList.add('scale-125');
    setTimeout(() => badge.classList.remove('scale-125'), 200);
  }
}

function modificarCantidad(productoId, delta) {
  const item = carrito.find(i => i.producto_id === productoId);
  if (!item) return;

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    carrito = carrito.filter(i => i.producto_id !== productoId);
  }

  guardarCarrito();
  actualizarVistaCarrito();
}

function eliminarDelCarrito(productoId) {
  carrito = carrito.filter(i => i.producto_id !== productoId);
  guardarCarrito();
  actualizarVistaCarrito();
}

function guardarCarrito() {
  localStorage.setItem('nomad_cart', JSON.stringify(carrito));
}

function actualizarVistaCarrito() {
  const badge = document.getElementById('cart-badge');
  const countEl = document.getElementById('cart-drawer-count');
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const finalizarBtn = document.getElementById('btn-finalizar-pedido');

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  if (badge) badge.textContent = totalItems;
  if (countEl) countEl.textContent = `${totalItems} prenda${totalItems === 1 ? '' : 's'}`;
  if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toLocaleString('es-CO');

  if (finalizarBtn) {
    finalizarBtn.disabled = carrito.length === 0;
  }

  if (!container) return;

  if (carrito.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center text-humo">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <p class="font-display text-base">Tu bolsa está vacía</p>
        <p class="text-xs text-humo mt-1">Explorá la colección y elegí tus piezas favoritas.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = carrito.map(item => `
    <div class="flex items-center gap-3 bg-white p-3 rounded-lg border border-carbon/10 shadow-sm">
      ${item.imagen ? `<img src="${item.imagen}" class="w-14 h-14 object-cover rounded bg-arena/40 shrink-0">` : '<div class="w-14 h-14 bg-arena/40 rounded shrink-0"></div>'}
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-xs text-carbon truncate">${item.nombre}</h4>
        <p class="text-[11px] text-humo">Talla: ${item.talla} · $${Number(item.precio).toLocaleString('es-CO')}</p>
        <div class="flex items-center gap-2 mt-2">
          <button onclick="modificarCantidad('${item.producto_id}', -1)" class="w-5 h-5 bg-crema hover:bg-carbon/10 rounded flex items-center justify-center text-xs font-bold transition-colors">−</button>
          <span class="text-xs font-semibold px-1">${item.cantidad}</span>
          <button onclick="modificarCantidad('${item.producto_id}', 1)" class="w-5 h-5 bg-crema hover:bg-carbon/10 rounded flex items-center justify-center text-xs font-bold transition-colors">+</button>
        </div>
      </div>
      <div class="text-right">
        <p class="font-semibold text-xs text-carbon">$${(item.precio * item.cantidad).toLocaleString('es-CO')}</p>
        <button onclick="eliminarDelCarrito('${item.producto_id}')" class="text-[11px] text-red-500 hover:underline mt-2">Quitar</button>
      </div>
    </div>
  `).join('');
}

// Envío del pedido al backend (SQL Server: POST /api/pedidos)
async function realizarPedido() {
  if (carrito.length === 0) return;

  const nombre = document.getElementById('checkout-nombre')?.value.trim() || 'Cliente Web';
  const ciudad = document.getElementById('checkout-ciudad')?.value.trim() || 'Bogotá';
  const direccion = document.getElementById('checkout-direccion')?.value.trim();
  const metodo = document.getElementById('checkout-metodo')?.value || 'tarjeta';

  if (!direccion) {
    alert('Por favor ingresa la dirección de entrega.');
    document.getElementById('checkout-direccion')?.focus();
    return;
  }

  const btn = document.getElementById('btn-finalizar-pedido');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Procesando en SQL Server...';
  }

  const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const payload = {
    id_usuario: 1, // Usuario por defecto en SQL Server
    total: subtotal,
    direccion_envio: direccion,
    ciudad_envio: ciudad,
    metodo_pago: metodo,
    items: carrito.map(item => ({
      producto_mongo_id: item.producto_id,
      nombre_producto: item.nombre,
      talla: item.talla,
      color: 'Predeterminado',
      cantidad: item.cantidad,
      precio_unitario: item.precio
    }))
  };

  try {
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.mensaje);

    // Éxito: vaciar carrito y notificar
    carrito = [];
    guardarCarrito();
    actualizarVistaCarrito();
    toggleCartDrawer(false);

    mostrarToast(`🎉 ¡Pedido #${json.data.id_pedido} registrado exitosamente en SQL Server!`);

    setTimeout(() => {
      alert(`¡Gracias por tu compra, ${nombre}!\n\nTu pedido #${json.data.id_pedido} ha sido registrado en la base de datos SQL Server.\nPuedes verlo y gestionarlo en cualquier momento desde el Panel Administrativo.`);
    }, 400);

  } catch (error) {
    console.error('Error al crear pedido:', error);
    alert('Error al registrar el pedido en SQL Server: ' + error.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Finalizar Pedido →';
    }
  }
}


// ═══════════════════════════════════
// 4. RESEÑAS DINÁMICAS (MONGODB CRUD)
// ═══════════════════════════════════
async function cargarResenas() {
  const container = document.getElementById('resenas-grid');
  if (!container) return;

  try {
    const res = await fetch('/api/resenas');
    const json = await res.json();
    const resenas = json.data || [];

    if (resenas.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-8 text-center text-humo text-sm">
          Aún no hay opiniones publicadas. ¡Sé el primero en compartir tu experiencia!
        </div>
      `;
      return;
    }

    // Renderizar hasta 6 reseñas
    container.innerHTML = resenas.slice(0, 6).map(r => {
      const estrellas = '★'.repeat(r.calificacion) + '☆'.repeat(5 - r.calificacion);
      const fecha = r.fecha ? new Date(r.fecha).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }) : 'Reciente';

      // Buscar nombre de producto si está en el catálogo
      const prod = productosGlobales.find(p => p._id === r.producto_id);
      const nombrePrenda = prod ? prod.nombre : 'Prenda NØMAD';

      return `
        <div class="bg-white p-6 rounded-xl border border-carbon/10 shadow-sm flex flex-col justify-between text-left">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-terracota text-sm tracking-wider">${estrellas}</span>
              <span class="text-[11px] text-humo">${fecha}</span>
            </div>
            <p class="text-carbon/90 text-sm leading-relaxed italic mb-4">"${r.comentario || 'Excelente prenda.'}"</p>
          </div>
          <div class="border-t border-carbon/5 pt-3 flex items-center justify-between">
            <span class="text-xs font-semibold text-carbon">Cliente #${r.usuario_sql_id}</span>
            <span class="text-[11px] text-humo truncate max-w-[140px]">${nombrePrenda}</span>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error al cargar reseñas:', error);
    container.innerHTML = `<div class="col-span-full py-4 text-center text-humo text-xs">No se pudieron cargar las reseñas de MongoDB.</div>`;
  }
}

function openReviewModal() {
  const modal = document.getElementById('review-modal');
  const select = document.getElementById('review-product-select');
  if (!modal || !select) return;

  // Llenar select con productos actuales
  select.innerHTML = '<option value="">Selecciona una prenda...</option>' + 
    productosGlobales.map(p => `<option value="${p._id}">${p.nombre}</option>`).join('');

  modal.classList.add('open');
}

function closeReviewModal() {
  const modal = document.getElementById('review-modal');
  if (modal) modal.classList.remove('open');
}

async function submitReview(e) {
  e.preventDefault();
  const productoId = document.getElementById('review-product-select').value;
  const calificacion = document.querySelector('input[name="modal_calificacion"]:checked')?.value || 5;
  const comentario = document.getElementById('review-comment').value.trim();

  if (!productoId || !comentario) {
    alert('Completa los campos obligatorios');
    return;
  }

  const payload = {
    producto_id: productoId,
    usuario_sql_id: 1, // ID del usuario de SQL Server
    calificacion: Number(calificacion),
    comentario
  };

  try {
    const res = await fetch('/api/resenas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.mensaje);

    closeReviewModal();
    document.getElementById('review-comment').value = '';
    mostrarToast('✓ Reseña guardada con éxito en MongoDB.');
    cargarResenas();

  } catch (error) {
    alert('Error al publicar reseña: ' + error.message);
  }
}


// ═══════════════════════════════════
// 5. TOAST NOTIFICACIONES
// ═══════════════════════════════════
function mostrarToast(mensaje) {
  const container = document.getElementById('frontend-toast');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-anim bg-carbon text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-white/10';
  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-oliva"></span>
    <span>${mensaje}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  if (input) input.value = '';
  mostrarToast('✓ ¡Gracias por suscribirte a la comunidad NØMAD!');
}

  } catch (error) {
    alert('Error al publicar reseña: ' + error.message);
  }
}


// ═══════════════════════════════════
// 5. TOAST NOTIFICACIONES
// ═══════════════════════════════════
function mostrarToast(mensaje) {
  const container = document.getElementById('frontend-toast');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-anim bg-carbon text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-white/10';
  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-oliva"></span>
    <span>${mensaje}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  if (input) input.value = '';
  mostrarToast('✓ ¡Gracias por suscribirte a la comunidad NØMAD!');
}

