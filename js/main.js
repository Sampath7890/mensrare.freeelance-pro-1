import '../styles.css';
import { addToCart, cartCount, removeFromCart, subscribeCart, updateQuantity } from './cart.js';
import { navigate } from './router.js';
import { storage } from './storage.js';

function updateBadges() {
  const count = cartCount();
  document.querySelectorAll('[data-cart-count]').forEach((badge) => {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  });
}

function updateThemeIcon() {
  const icon = document.querySelector('#theme-icon');
  if (icon) icon.textContent = document.documentElement.classList.contains('dark') ? 'dark_mode' : 'light_mode';
}

function initializeTheme() {
  const saved = storage.get('theme', null);
  const dark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', dark);
  updateThemeIcon();
}

document.addEventListener('click', async (event) => {
  const action = event.target.closest('[data-action]');
  if (action) {
    if (action.dataset.action === 'toggle-theme') {
      const dark = document.documentElement.classList.toggle('dark');
      storage.set('theme', dark ? 'dark' : 'light', { debounce: 0 });
      updateThemeIcon();
    }
    if (action.dataset.action === 'add-to-cart') {
      const { getProduct } = await import('./products.js');
      const product = await getProduct(action.dataset.productId);
      const size = document.querySelector('input[name="size"]:checked')?.value || 'M';
      addToCart(product, size);
      action.textContent = 'Added to bag ✓';
    }
    if (action.dataset.action === 'remove-cart') {
      removeFromCart(action.dataset.id, action.dataset.size);
      navigate();
    }
    if (action.dataset.action === 'quantity') {
      updateQuantity(action.dataset.id, action.dataset.size, Number(action.dataset.delta));
      navigate();
    }
    if (action.dataset.action === 'checkout') {
      const { checkoutViaWhatsApp } = await import('./cart-page.js');
      checkoutViaWhatsApp();
    }
    if (action.dataset.action === 'apply-coupon') {
      const { applyCoupon } = await import('./cart-page.js');
      if (applyCoupon(document.querySelector('#coupon-input')?.value || '')) navigate();
      else alert('Invalid coupon code');
    }
    if (action.dataset.action === 'remove-coupon') {
      const { removeCoupon } = await import('./cart-page.js');
      removeCoupon();
      navigate();
    }
  }
  const adminAction = event.target.closest('[data-admin-action]');
  if (adminAction) {
    const { handleAdminAction } = await import('./admin.js');
    await handleAdminAction(adminAction);
  }
});

document.addEventListener('input', async (event) => {
  if (event.target.matches('[data-address]')) {
    const { handleAddressInput } = await import('./cart-page.js');
    handleAddressInput(event.target);
  }
});

let scrollFrame = 0;
addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = max > 0 ? scrollY / max : 0;
    document.querySelector('#scroll-progress').style.transform = `scaleX(${ratio})`;
    scrollFrame = 0;
  });
}, { passive: true });

subscribeCart(updateBadges);
initializeTheme();
updateBadges();
navigate();

requestAnimationFrame(() => {
  const loader = document.querySelector('#global-loader');
  loader?.classList.add('opacity-0', 'pointer-events-none');
  loader?.addEventListener('transitionend', () => loader.remove(), { once: true });
});
