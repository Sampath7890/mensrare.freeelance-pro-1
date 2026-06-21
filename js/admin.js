import { getProducts, removeProduct, upsertProduct } from './products.js';
import { storage } from './storage.js';
import { createPage } from './ui.js';
import { addReview, deleteReview, getReviews } from './reviews.js';
import { supabase } from './supabase.js';

export function adminPage() {
  const authenticated = true;
  return createPage(`
    <section class="mx-auto max-w-6xl px-6 pb-24 pt-32">
      <div id="admin-login" class="${authenticated ? 'hidden' : ''} mx-auto max-w-md glass-card p-8"><h1 class="mb-6 text-4xl">Admin Access</h1><form id="admin-login-form" class="space-y-4"><input id="admin-email" class="field" type="email" placeholder="Email" required><input id="admin-password" class="field" type="password" placeholder="Password" required><button class="btn-primary w-full">Sign in</button></form></div>
      <div id="admin-dashboard" class="${authenticated ? '' : 'hidden'}"><div class="mb-8 flex items-center justify-between"><h1 class="text-5xl">Inventory</h1><button data-admin-action="logout" class="btn-secondary">Log out</button></div>
        <form id="product-form" class="glass-card mb-8 grid gap-4 p-6 md:grid-cols-2"><input type="hidden" name="id"><input class="field" name="name" placeholder="Product name" required><input class="field" name="category" placeholder="Category" required><input class="field" name="price" type="number" min="0" placeholder="Price" required><input class="field" name="image_url" type="url" placeholder="Image URL"><input class="field md:col-span-2" name="image_file" type="file" accept="image/*"><textarea class="field md:col-span-2" name="description" placeholder="Description"></textarea><div class="md:col-span-2 flex gap-3"><button class="btn-primary">Save product</button><button type="reset" class="btn-secondary">Clear</button></div></form>
        <div id="admin-products" class="space-y-3" aria-live="polite">Loading…</div>
        <div class="mt-10 grid gap-8 lg:grid-cols-2">
          <section class="glass-card p-6"><h2 class="mb-5 text-3xl">Coupons</h2><form id="coupon-form" class="flex gap-2"><input name="code" class="field uppercase" placeholder="CODE" required><input name="discount" class="field max-w-28" type="number" min="1" max="100" placeholder="%" required><button class="btn-primary !px-4">Add</button></form><div id="admin-coupons" class="mt-5 space-y-2"></div></section>
          <section class="glass-card p-6"><h2 class="mb-5 text-3xl">Reviews</h2><form id="review-form" class="grid gap-3"><select name="productId" id="review-product" class="field" required></select><input name="name" class="field" placeholder="Customer name" required><textarea name="text" class="field" placeholder="Review" required></textarea><input name="rating" class="field" type="number" min="1" max="5" value="5" required><button class="btn-primary">Add review</button></form><div id="admin-reviews" class="mt-5 space-y-2"></div></section>
        </div>
      </div>
    </section>`);
}

export async function initAdmin() {
  const loginForm = document.querySelector('#admin-login-form');
  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.querySelector('#admin-email').value;
    const password = document.querySelector('#admin-password').value;
    if ((email === 'admin@mensrare.com' && password === 'admin') || (email === 'admin' && password === 'admin')) {
      storage.set('adminAuth', true, { debounce: 0 });
      document.querySelector('#admin-login').classList.add('hidden');
      document.querySelector('#admin-dashboard').classList.remove('hidden');
      renderAdminProducts();
    } else alert('Invalid admin credentials');
  }, { once: true });

  document.querySelector('#product-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.submitter;
    button.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      if (data.image_file?.size) data.image_url = await supabase.uploadProductImage(data.image_file);
      delete data.image_file;
      if (!data.image_url) throw new Error('Add an image URL or choose an image file.');
      await upsertProduct(data);
      event.currentTarget.reset();
      await renderAdminProducts();
    } catch (error) {
      alert(error.message);
    } finally {
      button.disabled = false;
    }
  });
  document.querySelector('#coupon-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    storage.update('mensrare_coupons', [], (coupons) => [...coupons.filter((item) => item.code !== data.code.toUpperCase()), { code: data.code.toUpperCase(), discount: Number(data.discount) }], { debounce: 0 });
    event.currentTarget.reset();
    renderCoupons();
  });
  document.querySelector('#review-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    addReview({ ...data, rating: Number(data.rating) });
    event.currentTarget.reset();
    renderReviews();
  });
  if (storage.get('adminAuth', false)) await renderAdminProducts();
  renderCoupons();
  renderReviews();
}

async function renderAdminProducts() {
  const container = document.querySelector('#admin-products');
  if (!container) return;
  const products = await getProducts({ force: true });
  const fragment = document.createDocumentFragment();
  products.forEach((product) => {
    const row = document.createElement('article');
    row.className = 'glass-card flex items-center gap-4 p-4';
    row.innerHTML = `<img src="${product.image_url}" width="64" height="64" loading="lazy" decoding="async" class="h-16 w-16 rounded-xl object-cover" alt=""><div class="min-w-0 flex-1"><strong class="block truncate">${product.name}</strong><span class="text-sm opacity-60">${product.category} · ₹${product.price}</span></div><button data-admin-action="edit" data-id="${product.id}" class="icon-button"><span class="material-symbols-outlined">edit</span></button><button data-admin-action="delete" data-id="${product.id}" class="icon-button text-red-600"><span class="material-symbols-outlined">delete</span></button>`;
    fragment.append(row);
  });
  container.replaceChildren(fragment);
  container.dataset.products = JSON.stringify(products);
  const select = document.querySelector('#review-product');
  if (select) select.innerHTML = '<option value="">Select product</option>' + products.map((product) => `<option value="${product.id}">${product.name}</option>`).join('');
}

function renderCoupons() {
  const container = document.querySelector('#admin-coupons');
  if (!container) return;
  container.innerHTML = storage.get('mensrare_coupons', []).map((coupon) => `<div class="flex items-center justify-between rounded-xl bg-black/5 p-3"><span><strong>${coupon.code}</strong> · ${coupon.discount}%</span><button data-admin-action="delete-coupon" data-code="${coupon.code}">Delete</button></div>`).join('') || '<p class="text-sm opacity-60">No coupons.</p>';
}

function renderReviews() {
  const container = document.querySelector('#admin-reviews');
  if (!container) return;
  container.innerHTML = getReviews().map((review) => `<div class="flex items-center justify-between gap-3 rounded-xl bg-black/5 p-3"><span class="truncate"><strong>${review.name}</strong> · ${review.text}</span><button data-admin-action="delete-review" data-id="${review.id}">Delete</button></div>`).join('') || '<p class="text-sm opacity-60">No reviews.</p>';
}

export async function handleAdminAction(button) {
  const action = button.dataset.adminAction;
  if (action === 'logout') {
    storage.remove('adminAuth');
    location.reload();
  }
  if (action === 'delete' && confirm('Delete this product?')) {
    await removeProduct(button.dataset.id);
    await renderAdminProducts();
  }
  if (action === 'edit') {
    const container = document.querySelector('#admin-products');
    const product = JSON.parse(container.dataset.products).find((item) => String(item.id) === button.dataset.id);
    const form = document.querySelector('#product-form');
    Object.entries(product).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value ?? ''; });
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  if (action === 'delete-coupon') {
    storage.update('mensrare_coupons', [], (coupons) => coupons.filter((coupon) => coupon.code !== button.dataset.code), { debounce: 0 });
    renderCoupons();
  }
  if (action === 'delete-review') {
    deleteReview(button.dataset.id);
    renderReviews();
  }
}
