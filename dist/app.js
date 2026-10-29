const menuItems = [
  {
    id: 1,
    name: 'Burger Cheez Up',
    category: 'burger',
    price: 12.500,
    desc: 'Burger juteux, cheddar, oignon caramélisé et sauce maison.',
    tag: 'Favori',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 2,
    name: 'Pizza Pepperoni',
    category: 'pizza',
    price: 15.000,
    desc: 'Base fine, mozzarella fondante, pepperoni et basilic.',
    tag: 'Incontournable',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 3,
    name: 'Frites gourmandes',
    category: 'side',
    price: 5.500,
    desc: 'Frites croustillantes, cheddar, épices maison et coriandre.',
    tag: 'À partager',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 4,
    name: 'Chicken Crunch',
    category: 'burger',
    price: 11.500,
    desc: 'Poulet croustillant, salade, sauce cream cheese et pickles.',
    tag: 'Nouveau',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 5,
    name: 'Pizza 4 fromages',
    category: 'pizza',
    price: 16.000,
    desc: 'Un mélange généreux de mozzarella, cheddar, gorgonzola et parmesan.',
    tag: 'Signature',
    image: 'https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 6,
    name: 'Ailes croustillantes',
    category: 'side',
    price: 8.500,
    desc: 'Ailes dorées, sauce épicée et accompagnement maison.',
    tag: 'Épicé',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=80'
  }
];

const cart = {};
let activeFilter = 'all';

const menuGrid = document.getElementById('menu-grid');
const filterButtons = [...document.querySelectorAll('.filter')];
const cartCountEls = document.querySelectorAll('[data-cart-count]');
const mobileCount = document.querySelector('[data-mobile-count]');
const cartBody = document.getElementById('cart-body');
const cartTotalEl = document.getElementById('cart-total');
const summaryContent = document.getElementById('summary-content');
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const summaryOverlay = document.getElementById('summary-overlay');
const checkoutButton = document.getElementById('checkout-button');
const copySummaryButton = document.getElementById('copy-summary');
const closeSummaryButton = document.getElementById('close-summary');
const announcer = document.getElementById('announcer');
const menuToggle = document.querySelector('[data-toggle-nav]');
const mobileNav = document.getElementById('mobile-nav');
const cartCloseButton = document.querySelector('[data-close-cart]');

let cartOpener = null;
let summaryOpener = null;

function formatPrice(value) {
  return `${Number(value).toFixed(3).replace('.', ',')} DT`;
}

function getCartItems() {
  return Object.entries(cart)
    .map(([id, qty]) => {
      const item = menuItems.find((entry) => entry.id === Number(id));
      if (!item) return null;
      return { item, qty };
    })
    .filter(Boolean);
}

function getCartTotal() {
  return getCartItems().reduce((total, { item, qty }) => total + item.price * qty, 0);
}

function updateCartCount() {
  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  cartCountEls.forEach((el) => {
    el.textContent = totalItems;
  });
  if (mobileCount) {
    mobileCount.textContent = totalItems === 0 ? '0 article' : `${totalItems} article${totalItems > 1 ? 's' : ''}`;
  }
  const cartTrigger = document.querySelector('.cart-trigger');
  if (cartTrigger) {
    cartTrigger.setAttribute('aria-label', `Ouvrir le panier, ${totalItems} article${totalItems === 1 ? '' : 's'}`);
  }
}

function renderMenu() {
  if (!menuGrid) return;

  const visible = activeFilter === 'all'
    ? menuItems
    : menuItems.filter((item) => item.category === activeFilter);

  menuGrid.innerHTML = visible.map((item) => `
    <article class="menu-card" data-category="${item.category}">
      <div class="menu-card-media" data-category="${item.category}">
        <div class="menu-image-fallback" aria-hidden="true"><span class="menu-fallback-ring"></span><strong>CHEZZUP</strong><small>STREET & FOOD · BOUARGOUB</small></div>
        <img class="menu-card-image" src="${item.image}" alt="" loading="lazy" decoding="async">
        <span class="menu-card-tag">${item.tag}</span>
      </div>
      <div class="menu-card-body">
        <div class="menu-card-top">
          <h3>${item.name}</h3>
          <span class="price-pill">${formatPrice(item.price)}</span>
        </div>
        <p>${item.desc}</p>
        <div class="menu-card-footer">
          <span class="menu-card-stock">À découvrir</span>
          <button type="button" data-add-item="${item.id}" aria-label="Ajouter ${item.name} au panier">Ajouter <span aria-hidden="true">+</span></button>
        </div>
      </div>
    </article>
  `).join('');
}

menuGrid?.addEventListener('error', (event) => {
  if (!(event.target instanceof HTMLImageElement)) return;
  const media = event.target.closest('.menu-card-media');
  if (media) media.dataset.imageFailed = 'true';
}, true);

function renderCart() {
  const entries = getCartItems();
  if (!cartBody) return;

  if (!entries.length) {
    cartBody.innerHTML = '<p class="cart-empty">Votre panier est vide.<br>Ajoutez un plat pour commencer.</p>';
    cartTotalEl.textContent = '0,000 DT';
    if (checkoutButton) checkoutButton.disabled = true;
    return;
  }

  cartBody.innerHTML = entries.map(({ item, qty }) => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">
          <span>${formatPrice(item.price)}</span>
          <span>${qty} x</span>
        </div>
      </div>
      <div class="cart-item-actions">
        <button class="qty-button" type="button" data-qty-change="-" data-item-id="${item.id}" aria-label="Retirer un ${item.name} du panier">−</button>
        <span aria-live="polite">${qty}</span>
        <button class="qty-button" type="button" data-qty-change="+" data-item-id="${item.id}" aria-label="Ajouter un ${item.name} au panier">+</button>
      </div>
    </div>
  `).join('');

  cartTotalEl.textContent = formatPrice(getCartTotal());
  if (checkoutButton) checkoutButton.disabled = false;
}

function updateSummary() {
  const entries = getCartItems();
  if (!summaryContent) return;

  if (!entries.length) {
    summaryContent.innerHTML = '<p>Votre panier est vide.</p>';
    return;
  }

  const rows = entries.map(({ item, qty }) => `
    <div class="summary-item">
      <span>${item.name} x${qty}</span>
      <strong>${formatPrice(item.price * qty)}</strong>
    </div>
  `).join('');

  summaryContent.innerHTML = `
    ${rows}
    <div class="summary-item summary-total">
      <span>Total</span>
      <strong>${formatPrice(getCartTotal())}</strong>
    </div>
  `;
}

function openCart(opener = document.activeElement) {
  if (cartDrawer?.hidden) cartOpener = opener;
  if (cartOverlay) cartOverlay.hidden = false;
  if (cartDrawer) cartDrawer.hidden = false;
  renderCart();
  cartCloseButton?.focus();
}

function closeCart(restoreFocus = true) {
  if (cartOverlay) cartOverlay.hidden = true;
  if (cartDrawer) cartDrawer.hidden = true;
  if (restoreFocus && cartOpener instanceof HTMLElement && cartOpener.isConnected) cartOpener.focus();
}

function openSummary(opener = cartOpener) {
  summaryOpener = opener;
  updateSummary();
  if (summaryOverlay) summaryOverlay.hidden = false;
  closeSummaryButton?.focus();
}

function closeSummary() {
  if (summaryOverlay) summaryOverlay.hidden = true;
  if (summaryOpener instanceof HTMLElement && summaryOpener.isConnected) summaryOpener.focus();
}

function addToCart(itemId, opener) {
  const id = Number(itemId);
  const item = menuItems.find((entry) => entry.id === id);
  cart[id] = (cart[id] || 0) + 1;
  updateCartCount();
  renderCart();
  if (announcer && item) announcer.textContent = `${item.name} ajouté au panier.`;
  openCart(opener);
}

function changeQty(itemId, delta) {
  const id = Number(itemId);
  if (!cart[id]) return;

  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];

  updateCartCount();
  renderCart();
  const nextControl = cartBody.querySelector(`[data-qty-change="${delta > 0 ? '+' : '-'}"][data-item-id="${id}"]`);
  (nextControl || cartBody.querySelector('.qty-button') || cartCloseButton)?.focus();
  const item = menuItems.find((entry) => entry.id === id);
  if (announcer && item) announcer.textContent = cart[id]
    ? `Quantité de ${item.name} mise à jour : ${cart[id]}.`
    : `${item.name} retiré du panier.`;
}

function closeMobileNav() {
  if (!mobileNav || !menuToggle) return;
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((btn) => {
      const active = btn === button;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    renderMenu();
  });
});

document.addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-add-item]');
  if (addButton) {
    addToCart(addButton.dataset.addItem, addButton);
  }

  const qtyButton = event.target.closest('[data-qty-change]');
  if (qtyButton) {
    changeQty(qtyButton.dataset.itemId, Number(qtyButton.dataset.qtyChange));
  }

  const openCartButton = event.target.closest('[data-open-cart]');
  if (openCartButton) {
    openCart(openCartButton);
  }

  const closeCartButton = event.target.closest('[data-close-cart]');
  if (closeCartButton) {
    closeCart();
  }

  if (event.target === cartOverlay) {
    closeCart();
  }

  if (event.target === summaryOverlay) {
    closeSummary();
  }

  if (event.target.closest('#mobile-nav a')) closeMobileNav();
});

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
    mobileNav.hidden = isOpen;
    if (!isOpen) mobileNav.querySelector('a')?.focus();
  });
}

if (checkoutButton) {
  checkoutButton.addEventListener('click', () => {
    const opener = cartOpener;
    closeCart(false);
    openSummary(opener);
  });
}

if (copySummaryButton) {
  copySummaryButton.addEventListener('click', async () => {
    const text = summaryContent?.innerText || 'Panier vide';
    try {
      await navigator.clipboard.writeText(text);
      copySummaryButton.textContent = 'Copié ✓';
      setTimeout(() => {
        copySummaryButton.textContent = 'Copier le récapitulatif';
      }, 1600);
    } catch (error) {
      copySummaryButton.textContent = 'Copier impossible';
    }
  });
}

if (closeSummaryButton) {
  closeSummaryButton.addEventListener('click', closeSummary);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (summaryOverlay && !summaryOverlay.hidden) closeSummary();
    else if (cartDrawer && !cartDrawer.hidden) closeCart();
    else if (mobileNav && !mobileNav.hidden) {
      closeMobileNav();
      menuToggle?.focus();
    }
    return;
  }

  if (event.key !== 'Tab') return;
  const activeDialog = summaryOverlay && !summaryOverlay.hidden
    ? summaryOverlay.querySelector('[role="dialog"]')
    : cartDrawer && !cartDrawer.hidden ? cartDrawer : null;
  if (!activeDialog) return;

  const focusable = [...activeDialog.querySelectorAll('a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hasAttribute('hidden'));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

renderMenu();
renderCart();
updateCartCount();
closeCart();
closeSummary();
