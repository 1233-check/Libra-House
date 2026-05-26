/* ============================================
   LIBRA HOUSE — App Logic
   ============================================ */

const PRODUCTS = [
  { id: 1, name: 'The Sage Intrecciato', price: 3800, image_url: 'images/bag-01.jpg', model_image_url: 'images/model-01.png', inventory_count: 4, desc: 'A masterclass in woven leather. The Sage Intrecciato features an unstructured hobo silhouette, perfectly slouchy yet incredibly refined. Crafted from supple lambskin.' },
  { id: 2, name: 'The Rose Bucket', price: 2900, image_url: 'images/bag-02.jpg', model_image_url: 'images/model-02.png', inventory_count: 4, desc: 'A sculptural take on the classic bucket bag. Minimalist lines meet a rich rose hue, complete with a tonal leather interior and subtle silver hardware.' },
  { id: 3, name: 'The Petal Shoulder', price: 1950, image_url: 'images/bag-03.jpg', model_image_url: 'images/model-03.png', inventory_count: 4, desc: 'Lightweight and elegant. The Petal Shoulder bag features a soft fabric body with leather trim, ideal for everyday effortless style.' },
  { id: 4, name: 'The Dune Mini', price: 3999, image_url: 'images/bag-04.jpg', model_image_url: 'images/model-04.png', inventory_count: 4, desc: 'The crown jewel of the collection. The Dune Mini is distinguished by its striking gold-tone sculptural handle, contrasting beautifully with the soft beige leather.' },
  { id: 5, name: 'The Cognac Croissant', price: 3200, image_url: 'images/bag-05.jpg', model_image_url: 'images/model-05.png', inventory_count: 4, desc: 'Rich, buttery leather folded into an organic crescent shape. The Cognac Croissant is spacious, versatile, and instantly iconic.' },
  { id: 6, name: 'The Citrine Perle', price: 3600, image_url: 'images/bag-06.jpg', model_image_url: 'images/model-06.png', inventory_count: 4, desc: 'Woven leather meets artisanal beadwork. The Citrine Perle features a statement handle made of oversized resin pearls.' },
  { id: 7, name: 'The Tartan Bead', price: 2400, image_url: 'images/bag-07.jpg', model_image_url: 'images/model-07.png', inventory_count: 4, desc: 'A playful yet sophisticated piece. Woven tartan fabric with a distinctive beaded handle and delicate chain strap.' },
  { id: 8, name: 'The Onyx Crescent', price: 3100, image_url: 'images/bag-08.jpg', model_image_url: 'images/model-08.png', inventory_count: 4, desc: 'The ultimate little black bag. A sleek crescent shape crafted from crinkled patent leather for a subtle, mysterious shine.' },
  { id: 9, name: 'The Azure Charm', price: 2800, image_url: 'images/bag-09.jpg', model_image_url: 'images/model-09.png', inventory_count: 4, desc: 'Soft azure suede elevated by contrasting burgundy leather trim and a signature knot detail.' },
  { id: 10, name: 'The Blush Tartan', price: 2400, image_url: 'images/bag-10.jpg', model_image_url: 'images/model-10.png', inventory_count: 4, desc: 'A softer take on our beaded handle design. Features a muted blush and grey tartan weave.' },
  { id: 11, name: 'The Graphite Tote', price: 1900, image_url: 'images/bag-11.jpg', model_image_url: 'images/model-11.png', inventory_count: 4, desc: 'Minimalist utility. A spacious tote crafted from durable technical fabric with structured leather handles and subtle stud details.' },
  { id: 12, name: 'The Buttercream Shoulder', price: 2100, image_url: 'images/bag-12.jpg', model_image_url: 'images/model-12.png', inventory_count: 4, desc: 'Clean, simple, and elegant. A classic 90s-inspired shoulder bag silhouette in smooth buttercream leather.' },
  { id: 13, name: 'The Noir Buckle', price: 3400, image_url: 'images/bag-13.jpg', model_image_url: 'images/model-13.png', inventory_count: 4, desc: 'Edgy yet elevated. A slouchy hobo shape grounded by an oversized, statement silver buckle.' },
  { id: 14, name: 'The Ivory Whipstitch', price: 2950, image_url: 'images/bag-14.jpg', model_image_url: 'images/model-14.png', inventory_count: 4, desc: 'Textured ivory leather featuring beautiful artisanal whipstitch detailing along the edges.' },
  { id: 15, name: 'The Midnight Frame', price: 2200, image_url: 'images/bag-15.jpg', model_image_url: 'images/model-15.png', inventory_count: 4, desc: 'A minimalist masterpiece. Sleek black technical fabric framed by a thin leather strap and metallic clasp.' }
];

const state = {
  products: JSON.parse(JSON.stringify(PRODUCTS)),
  cart: [],
  wishlist: [],
  filter: 'all',
  sort: 'default'
};

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const els = {
  grid: $('#product-grid'), count: $('#product-count-text'),
  cartToggle: $('#cart-toggle'), cartClose: $('#cart-close'), cartOverlay: $('#cart-overlay'), cartDrawer: $('#cart-drawer'), cartItems: $('#cart-items'), cartBadge: $('#cart-badge'), cartSubtotal: $('#cart-subtotal'), cartProgress: $('#cart-progress-fill'), cartProgText: $('#cart-progress-text'),
  wishlistToggle: $('#wishlist-toggle'), wishlistClose: $('#wishlist-close'), wishlistOverlay: $('#wishlist-overlay'), wishlistDrawer: $('#wishlist-drawer'), wishlistItems: $('#wishlist-items'), wishlistBadge: $('#wishlist-badge'),
  modal: $('#quick-view-modal'), modalOverlay: $('#modal-overlay'), modalClose: $('#modal-close'), modalInfo: $('#modal-info'), modalImg: $('#modal-img'),
  toast: $('#toast'),
  filterTabs: $$('.filter-tab'), sortSelect: $('#sort-select')
};

const formatPrice = amount => `₹${amount.toLocaleString('en-IN')}`;
const getProduct = id => state.products.find(p => p.id === id);
const getStock = id => getProduct(id).inventory_count - (state.cart.find(c => c.productId === id)?.quantity || 0);

function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add('visible');
  setTimeout(() => els.toast.classList.remove('visible'), 2500);
}

// --- RENDER PRODUCTS ---
function getFilteredSortedProducts() {
  let filtered = [...state.products];
  if (state.filter === 'under-500') filtered = filtered.filter(p => p.price < 2500);
  if (state.filter === '500-700') filtered = filtered.filter(p => p.price >= 2500 && p.price <= 3000);
  if (state.filter === 'over-700') filtered = filtered.filter(p => p.price > 3000);

  if (state.sort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
  if (state.sort === 'price-desc') filtered.sort((a,b) => b.price - a.price);
  if (state.sort === 'name-az') filtered.sort((a,b) => a.name.localeCompare(b.name));

  return filtered;
}

function renderProducts() {
  const products = getFilteredSortedProducts();
  els.count.textContent = `Showing ${products.length} pieces`;
  els.grid.innerHTML = products.map((p, i) => {
    const isWished = state.wishlist.includes(p.id);
    return `
      <div class="product-card fade-up" style="transition-delay: ${i*0.05}s" data-id="${p.id}">
        <div class="product-card-img">
          <img src="${p.image_url}" alt="${p.name}" class="product-img-primary" loading="lazy"/>
          <img src="${p.model_image_url}" alt="${p.name} — on model" class="product-img-model" loading="lazy"/>
          <button class="wishlist-btn ${isWished ? 'active' : ''}" data-wishlist-id="${p.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isWished?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </button>
          <div class="product-quick-view"><span>Quick View</span></div>
        </div>
        <div class="product-card-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-price">${formatPrice(p.price)}</p>
        </div>
      </div>
    `;
  }).join('');

  setTimeout(() => $$('.product-card').forEach(el => el.classList.add('visible')), 50);

  $$('.product-card-img').forEach(el => el.addEventListener('click', e => {
    if (e.target.closest('.wishlist-btn')) return;
    openModal(parseInt(el.parentElement.dataset.id));
  }));
  $$('.wishlist-btn').forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();
    toggleWishlist(parseInt(btn.dataset.wishlistId));
  }));
}

// --- FILTER & SORT ---
els.filterTabs.forEach(tab => tab.addEventListener('click', () => {
  els.filterTabs.forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  state.filter = tab.dataset.filter;
  renderProducts();
}));
els.sortSelect.addEventListener('change', e => {
  state.sort = e.target.value;
  renderProducts();
});

// --- MODAL ---
function openModal(id) {
  const p = getProduct(id);
  const isWished = state.wishlist.includes(id);
  
  els.modalImg.src = p.image_url;
  els.modalInfo.innerHTML = `
    <h2 class="modal-name">${p.name}</h2>
    <p class="modal-price">${formatPrice(p.price)}</p>
    <p class="modal-desc">${p.desc}</p>
    <div class="modal-actions">
      <button class="btn btn-primary modal-add-btn" data-id="${p.id}">
        Add to Cart
      </button>
      <button class="modal-wishlist ${isWished ? 'active' : ''}" data-id="${p.id}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWished?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
      </button>
    </div>
    <div class="modal-meta">
      <span>✦ Complimentary worldwide shipping</span>
      <span>✦ Authenticity guaranteed</span>
    </div>
  `;

  $('.modal-add-btn').addEventListener('click', e => {
    addToCart(parseInt(e.target.dataset.id));
    closeModal();
  });
  $('.modal-wishlist').addEventListener('click', e => toggleWishlist(parseInt(e.currentTarget.dataset.id)));

  els.modalOverlay.classList.add('open');
  els.modal.classList.add('open');
}
const closeModal = () => { els.modal.classList.remove('open'); els.modalOverlay.classList.remove('open'); };
els.modalClose.addEventListener('click', closeModal);
els.modalOverlay.addEventListener('click', closeModal);

// --- CART ---
function addToCart(id) {
  const item = state.cart.find(c => c.productId === id);
  if (item) item.quantity++; else state.cart.push({ productId: id, quantity: 1 });
  showToast(`${getProduct(id).name} added to cart`);
  renderCart();
  renderProducts();
}

function renderCart() {
  const count = state.cart.reduce((s, c) => s + c.quantity, 0);
  els.cartBadge.textContent = count;
  els.cartBadge.classList.toggle('visible', count > 0);

  const subtotal = state.cart.reduce((s, c) => s + (getProduct(c.productId).price * c.quantity), 0);
  els.cartSubtotal.textContent = formatPrice(subtotal);

  // Progress bar
  const threshold = 5000;
  const pct = Math.min(100, (subtotal / threshold) * 100);
  els.cartProgress.style.width = `${pct}%`;
  els.cartProgText.textContent = subtotal >= threshold ? "You've unlocked free shipping!" : `Add ${formatPrice(threshold - subtotal)} more for free shipping`;

  els.cartItems.innerHTML = state.cart.length ? state.cart.map(c => {
    const p = getProduct(c.productId);
    return `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${p.image_url}"/></div>
        <div class="cart-item-details">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${formatPrice(p.price)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn qty-dec" data-id="${p.id}">-</button>
            <span>${c.quantity}</span>
            <button class="qty-btn qty-inc" data-id="${p.id}">+</button>
          </div>
          <button class="cart-item-remove" data-id="${p.id}">Remove</button>
        </div>
      </div>
    `;
  }).join('') : `<div style="padding:40px;text-align:center;color:var(--gray-500)">Your bag is empty</div>`;

  $$('.qty-inc').forEach(b => b.addEventListener('click', () => { addToCart(parseInt(b.dataset.id)); }));
  $$('.qty-dec').forEach(b => b.addEventListener('click', () => {
    const item = state.cart.find(c => c.productId === parseInt(b.dataset.id));
    if (item.quantity > 1) item.quantity--; else state.cart = state.cart.filter(c => c.productId !== item.productId);
    renderCart(); renderProducts();
  }));
  $$('.cart-item-remove').forEach(b => b.addEventListener('click', () => {
    state.cart = state.cart.filter(c => c.productId !== parseInt(b.dataset.id));
    renderCart(); renderProducts();
  }));
}

// --- WISHLIST ---
function toggleWishlist(id) {
  if (state.wishlist.includes(id)) {
    state.wishlist = state.wishlist.filter(w => w !== id);
    showToast("Removed from wishlist");
  } else {
    state.wishlist.push(id);
    showToast("Added to wishlist");
  }
  els.wishlistBadge.textContent = state.wishlist.length;
  els.wishlistBadge.classList.toggle('visible', state.wishlist.length > 0);
  renderProducts();
  renderWishlist();
  if (els.modal.classList.contains('open')) openModal(id); // re-render modal
}

function renderWishlist() {
  els.wishlistItems.innerHTML = state.wishlist.length ? state.wishlist.map(id => {
    const p = getProduct(id);
    return `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${p.image_url}"/></div>
        <div class="cart-item-details">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${formatPrice(p.price)}</div>
          <button class="btn btn-primary" style="padding:6px 12px;font-size:0.7rem;margin-top:8px;" onclick="addToCart(${p.id})">Move to Bag</button>
          <button class="cart-item-remove" onclick="toggleWishlist(${p.id})">Remove</button>
        </div>
      </div>
    `;
  }).join('') : `<div style="padding:40px;text-align:center;color:var(--gray-500)">Your wishlist is empty</div>`;
}

// --- DRAWERS ---
const toggleDrawer = (drawer, overlay, open) => {
  drawer.classList.toggle('open', open);
  overlay.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
};
els.cartToggle.addEventListener('click', () => toggleDrawer(els.cartDrawer, els.cartOverlay, true));
[els.cartClose, els.cartOverlay, $('#continue-btn')].forEach(el => el?.addEventListener('click', () => toggleDrawer(els.cartDrawer, els.cartOverlay, false)));

els.wishlistToggle.addEventListener('click', () => toggleDrawer(els.wishlistDrawer, els.wishlistOverlay, true));
[els.wishlistClose, els.wishlistOverlay].forEach(el => el?.addEventListener('click', () => toggleDrawer(els.wishlistDrawer, els.wishlistOverlay, false)));

// --- IMMERSIVE HERO LOAD SEQUENCE ---
function initHero() {
  const hero = $('#hero');
  if (!hero) return;

  // Trigger staggered load animation
  requestAnimationFrame(() => {
    setTimeout(() => hero.classList.add('loaded'), 100);
  });

  // Apply staggered delays to headline words
  $$('.headline-word').forEach(word => {
    const delay = word.dataset.delay || '0';
    word.style.transitionDelay = `${delay}s`;
  });
}

// --- PARALLAX & SCROLL EFFECTS ---
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    // Hero parallax
    const heroBg = $('#hero-bg');
    const heroAccent = $('#hero-accent');
    if (heroBg && scrollY < vh * 1.5) {
      const parallaxOffset = scrollY * 0.4;
      heroBg.style.transform = `translateY(${parallaxOffset}px)`;
      // Fade out hero content as user scrolls
      const heroContent = $('.hero-content');
      if (heroContent) {
        const opacity = Math.max(0, 1 - (scrollY / (vh * 0.6)));
        heroContent.style.opacity = opacity;
      }
    }
    if (heroAccent && scrollY < vh) {
      heroAccent.style.transform = `translateY(${scrollY * -0.15}px)`;
    }

    // Navbar behavior
    const navbar = $('#navbar');
    navbar.classList.toggle('scrolled', scrollY > 50);
    navbar.classList.toggle('hero-dark', scrollY < vh * 0.7);

    // Back to top
    $('#back-to-top')?.classList.toggle('visible', scrollY > 600);

    // Scroll hint fade
    const scrollHint = $('#hero-scroll');
    if (scrollHint) {
      scrollHint.style.opacity = Math.max(0, 1 - (scrollY / 200));
    }

    ticking = false;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });

// --- INTERSECTION OBSERVER FOR REVEALS ---
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // Animate numbers
      if (entry.target.dataset.count) {
        animateValue(entry.target, 0, parseInt(entry.target.dataset.count), 2000);
        delete entry.target.dataset.count;
      }

      // Stagger children with .stagger-item class
      const staggerItems = entry.target.querySelectorAll('.stagger-item');
      staggerItems.forEach((item, i) => {
        setTimeout(() => item.classList.add('visible'), i * 100);
      });

      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -60px 0px'
});

// Observe all animatable elements
function observeElements() {
  $$('.fade-up, .fade-in, .section-reveal, .hero-stat-num').forEach(el => revealObserver.observe(el));
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    obj.innerHTML = Math.floor(eased * (end - start) + start);
    if (progress < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

// --- SMOOTH SECTION SCROLL ---
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// --- BACK TO TOP ---
$('#back-to-top')?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

// --- INIT ---
renderProducts();
renderCart();
renderWishlist();
initHero();
observeElements();
onScroll(); // Set initial state

// --- CUSTOM CURSOR ---
const dot = $('#cursor-dot');
const ring = $('#cursor-ring');
if (window.matchMedia("(pointer: fine)").matches && dot && ring) {
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // Smooth follow for ring
  function updateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(updateRing);
  }
  updateRing();

  // Cursor effects on interactive elements
  $$('a, button, .product-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '60px';
      ring.style.height = '60px';
      ring.style.borderColor = 'rgba(255,255,255,0.5)';
      dot.style.opacity = '0.3';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '40px';
      ring.style.height = '40px';
      ring.style.borderColor = '';
      dot.style.opacity = '1';
    });
  });
} else {
  if (dot) dot.style.display = 'none';
  if (ring) ring.style.display = 'none';
}

// --- NEWSLETTER ---
$('#newsletter-form')?.addEventListener('submit', e => {
  e.preventDefault();
  showToast("Thank you for subscribing! Check your email soon.");
  $('#newsletter-email').value = '';
});

// --- IMAGE PRELOADER FOR HERO ---
function preloadHeroImages() {
  const heroImg = new Image();
  heroImg.src = 'images/hero-model-1.png';
  const accentImg = new Image();
  accentImg.src = 'images/hero-model-2.png';
}
preloadHeroImages();

// --- RAZORPAY CHECKOUT ---
async function initiateCheckout() {
  // Validate cart
  if (state.cart.length === 0) {
    showToast('Your bag is empty');
    return;
  }

  const checkoutBtn = $('#checkout-btn');
  const originalText = checkoutBtn.textContent;
  checkoutBtn.textContent = 'Processing...';
  checkoutBtn.disabled = true;

  try {
    // Calculate total in paise (₹ × 100)
    const subtotal = state.cart.reduce((sum, c) => {
      const p = getProduct(c.productId);
      return sum + (p.price * c.quantity);
    }, 0);
    const amountInPaise = subtotal * 100;

    // Prepare cart items for order record
    const items = state.cart.map(c => {
      const p = getProduct(c.productId);
      return { id: p.id, name: p.name, price: p.price, quantity: c.quantity };
    });

    // Step 1: Create order on backend
    const orderRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `libra_${Date.now()}`,
        items,
      }),
    });

    const orderData = await orderRes.json();

    if (!orderData.success) {
      throw new Error(orderData.error || 'Failed to create order');
    }

    // Step 2: Fetch public key from server
    const keyRes = await fetch('/api/get-key');
    const keyData = await keyRes.json();

    // Step 3: Open Razorpay checkout modal
    const options = {
      key: keyData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.order_id,
      name: 'Libra House',
      description: `${state.cart.length} item${state.cart.length > 1 ? 's' : ''} — Spring/Summer 2026`,
      image: 'images/bag-04.jpg',
      theme: {
        color: '#000000',
        backdrop_color: 'rgba(0,0,0,0.6)',
      },
      handler: async function (response) {
        // Step 4: Verify payment on backend
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            // Save order locally for quick access
            localStorage.setItem('libra_last_order', JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              items,
              amount: subtotal,
              date: new Date().toISOString(),
            }));

            // Clear cart
            state.cart = [];
            renderCart();
            renderProducts();
            toggleDrawer(els.cartDrawer, els.cartOverlay, false);

            showToast('Payment successful! Redirecting to order tracking...');

            // Redirect to tracking page
            setTimeout(() => {
              window.location.href = `/tracking.html?order_id=${response.razorpay_order_id}`;
            }, 1500);
          } else {
            showToast('Payment verification failed. Contact support.');
          }
        } catch (err) {
          console.error('Verification error:', err);
          showToast('Payment received but verification pending. Contact support.');
        }
      },
      modal: {
        ondismiss: function () {
          showToast('Payment cancelled');
          checkoutBtn.textContent = originalText;
          checkoutBtn.disabled = false;
        },
      },
      prefill: {},
    };

    const rzp = new Razorpay(options);

    rzp.on('payment.failed', function (response) {
      console.error('Payment failed:', response.error);
      showToast(`Payment failed: ${response.error.description}`);
      checkoutBtn.textContent = originalText;
      checkoutBtn.disabled = false;
    });

    rzp.open();
  } catch (error) {
    console.error('Checkout error:', error);
    showToast(error.message || 'Checkout failed. Please try again.');
  } finally {
    checkoutBtn.textContent = originalText;
    checkoutBtn.disabled = false;
  }
}
