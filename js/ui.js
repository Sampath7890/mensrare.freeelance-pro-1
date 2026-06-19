import { cartTotal, getCart } from './cart.js';
import { getReviews } from './reviews.js';
import { storage } from './storage.js';

const placeholder = '/images/formal_shirt-720.webp';

function responsiveUrl(url, width) {
  if (!url) return placeholder;
  if (url.includes('images.unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}auto=format&fit=crop&q=75&w=${width}`;
  }
  if (url.includes('/storage/v1/object/public/')) {
    return `${url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')}?width=${width}&quality=75&resize=cover`;
  }
  return url;
}

export function imageMarkup(product, { eager = false, sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw' } = {}) {
  const source = product.image_url || placeholder;
  const srcset = [360, 720, 1080].map((width) => `${responsiveUrl(source, width)} ${width}w`).join(', ');
  return `<img src="${responsiveUrl(source, 720)}" srcset="${srcset}" sizes="${sizes}" width="720" height="960" alt="${product.name || 'Mensrare product'}" loading="${eager ? 'eager' : 'lazy'}" fetchpriority="${eager ? 'high' : 'auto'}" decoding="async" class="h-full w-full object-cover">`;
}

export function createPage(html) {
  const template = document.createElement('template');
  template.innerHTML = `<div class="page-enter">${html}</div>`;
  return template.content;
}

export function homePage() {
  return createPage(`
    <section class="relative flex min-h-[680px] items-center overflow-hidden pt-20">
      <picture class="absolute inset-0">
        <source srcset="/images/hero_model-640.webp 640w, /images/hero_model-960.webp 960w, /images/hero_model-1440.webp 1440w" sizes="100vw" type="image/webp">
        <img src="/images/hero_model-960.webp" width="960" height="1200" fetchpriority="high" decoding="async" alt="Mensrare premium menswear" class="h-full w-full object-cover">
      </picture>
      <div class="hero-gradient absolute inset-0"></div>
      <div class="relative mx-auto w-full max-w-7xl px-6 py-24">
        <div class="max-w-2xl text-white">
          <span class="mb-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-[11px] font-black uppercase tracking-[.3em] backdrop-blur">✦ New Season 2026</span>
          <h1 class="mb-6 text-5xl font-bold uppercase leading-[.95] !text-white md:text-7xl">Drench Your<br><em class="text-orange-300">Style in Color</em></h1>
          <p class="mb-8 max-w-lg text-lg text-white/90">Meticulously crafted linen and cotton shirts from the Mensrare boutique. Bold aesthetics for the modern man.</p>
          <div class="flex flex-wrap gap-4"><a class="btn-primary" href="#/shop">Browse Inventory <span class="material-symbols-outlined">arrow_outward</span></a><a class="btn-secondary" href="#/shop">View Lookbook</a></div>
          <div class="mt-10 flex flex-wrap gap-6 text-sm font-bold"><span>✓ Free Shipping</span><span>✓ Premium Quality</span><span>✓ Easy Returns</span></div>
        </div>
      </div>
    </section>
    <section class="mx-auto max-w-7xl px-6 py-20">
      <div class="mb-10 flex items-end justify-between"><div><h2 class="text-4xl font-bold uppercase md:text-5xl">Shop by Category</h2><p class="mt-2 opacity-75">Curated styles for every occasion</p></div><a href="#/shop" class="font-bold text-primary">View all →</a></div>
      <div class="grid gap-4 md:grid-cols-12">
        ${categoryTile('Casual Tees', '/images/casual_tee-720.webp', 'md:col-span-7 md:min-h-[520px]')}
        <div class="grid gap-4 md:col-span-5">
          ${categoryTile('Executive Shirts', '/images/formal_shirt-720.webp', 'min-h-[250px]')}
          ${categoryTile('Atelier Jackets', '/images/jacket-720.webp', 'min-h-[250px]')}
        </div>
      </div>
    </section>
    <section class="mx-auto max-w-7xl px-6 pb-24">
      <div class="glass-card grid items-center gap-10 p-8 md:grid-cols-2 md:p-14">
        <img src="/images/shirt-720.webp" srcset="/images/shirt-360.webp 360w, /images/shirt-720.webp 720w" sizes="(min-width:768px) 45vw, 90vw" width="720" height="960" loading="lazy" decoding="async" alt="Premium Mensrare shirt" class="aspect-[4/3] w-full rounded-3xl object-cover">
        <div><span class="text-xs font-black uppercase tracking-[.35em] text-primary">Fabric excellence</span><h2 class="my-5 text-5xl font-bold">Feel the Excellence</h2><p class="text-lg leading-8 opacity-75">Every thread is chosen for breathability, durability, and the way it holds vibrant dyes over time.</p></div>
      </div>
    </section>
  `);
}

function categoryTile(title, image, classes) {
  return `<a href="#/shop?category=${encodeURIComponent(title.includes('Tee') ? 'T-Shirts' : title.includes('Jacket') ? 'Jackets' : 'Shirts')}" class="group relative overflow-hidden rounded-[2rem] ${classes}">
    <img src="${image}" width="720" height="960" loading="lazy" decoding="async" alt="${title}" class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105">
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div><h3 class="absolute bottom-7 left-7 text-3xl font-bold uppercase !text-white">${title}</h3>
  </a>`;
}

export function shopPage() {
  return createPage(`
    <section class="mx-auto max-w-7xl px-6 pb-24 pt-32">
      <div class="mb-10 max-w-2xl"><span class="text-xs font-black uppercase tracking-[.35em] text-secondary">New arrivals</span><h1 class="mt-4 text-5xl font-bold md:text-6xl">Vibrant Summer Drop</h1><p class="mt-5 text-lg opacity-75">Premium menswear for the modern professional who is not afraid of color.</p></div>
      <div class="sticky top-[72px] z-30 mb-10 rounded-3xl border border-black/5 bg-background/90 p-4 shadow-sm backdrop-blur-xl">
        <div class="flex flex-col gap-3 md:flex-row">
          <label class="relative flex-1"><span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">search</span><input id="product-search" type="search" class="field pl-12" placeholder="Search products…" autocomplete="off"></label>
          <select id="product-category" class="field md:max-w-56"><option>All</option><option>Shirts</option><option>T-Shirts</option><option>Jackets</option></select>
        </div>
      </div>
      <div id="product-status" class="mb-5 text-sm opacity-65" aria-live="polite">Loading inventory…</div>
      <div id="product-grid" class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3"></div>
    </section>
  `);
}

export function productCard(product) {
  const article = document.createElement('article');
  article.className = 'product-card group cursor-pointer';
  article.dataset.productId = product.id;
  article.innerHTML = `
    <a href="#/product/${encodeURIComponent(product.id)}" class="block">
      <div class="aspect-[3/4] overflow-hidden bg-orange-50">${imageMarkup(product)}</div>
      <div class="p-5"><p class="text-[10px] font-black uppercase tracking-[.25em] text-primary">${product.category || 'Collection'}</p><div class="mt-2 flex items-start justify-between gap-3"><h2 class="text-2xl font-bold">${product.name}</h2><strong class="whitespace-nowrap text-primary">₹${Number(product.price).toLocaleString('en-IN')}</strong></div></div>
    </a>`;
  return article;
}

export function renderProductGrid(container, products) {
  const fragment = document.createDocumentFragment();
  products.forEach((product) => fragment.append(productCard(product)));
  container.replaceChildren(fragment);
}

export function productPage(product) {
  if (!product) return createPage(`<section class="grid min-h-[70vh] place-items-center pt-24"><div class="text-center"><h1 class="text-4xl">Product not found</h1><a href="#/shop" class="mt-5 inline-block text-primary">Back to shop</a></div></section>`);
  const reviews = getReviews(product.id);
  return createPage(`
    <section class="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-32 lg:grid-cols-2">
      <div id="image-magnifier-container" class="glass-card aspect-[3/4] overflow-hidden">${imageMarkup(product, { eager: true, sizes: '(min-width:1024px) 50vw, 100vw' })}</div>
      <div class="lg:pt-14"><span class="text-xs font-black uppercase tracking-[.35em] text-primary">${product.category}</span><h1 class="mt-4 text-5xl font-bold md:text-6xl">${product.name}</h1><p class="mt-5 text-3xl font-black text-primary">₹${Number(product.price).toLocaleString('en-IN')}</p><p class="mt-7 text-lg leading-8 opacity-75">${product.description || 'Premium fabric, refined construction, and a contemporary fit.'}</p>
        <fieldset class="mt-8"><legend class="mb-3 text-xs font-black uppercase tracking-widest">Select size</legend><div class="flex gap-2">${['S','M','L','XL'].map((size) => `<label><input class="peer sr-only" type="radio" name="size" value="${size}" ${size === 'M' ? 'checked' : ''}><span class="grid h-12 w-12 cursor-pointer place-items-center rounded-xl border border-black/10 font-bold peer-checked:bg-zinc-950 peer-checked:text-white">${size}</span></label>`).join('')}</div></fieldset>
        <button data-action="add-to-cart" data-product-id="${product.id}" class="btn-primary mt-8 w-full md:w-auto">Add to bag <span class="material-symbols-outlined">shopping_bag</span></button>
      </div>
    </section>
    <section class="mx-auto max-w-7xl px-6 pb-24"><h2 class="mb-8 text-4xl font-bold">Customer Reviews</h2><div class="grid gap-5 md:grid-cols-3">${(reviews.length ? reviews : defaultReviews()).map(reviewCard).join('')}</div></section>
  `);
}

function defaultReviews() {
  return [
    { name: 'Rajesh K.', rating: 5, text: 'The fabric feels premium and the fit is exactly as described.' },
    { name: 'Aman S.', rating: 5, text: 'Breathes well, looks excellent, and arrived quickly.' },
    { name: 'Vikram M.', rating: 5, text: 'Beautiful packaging and craftsmanship.' }
  ];
}

function reviewCard(review) {
  return `<article class="glass-card p-6"><div class="mb-4 text-amber-500">${'★'.repeat(review.rating || 5)}</div><p class="mb-5 italic opacity-75">“${review.text}”</p><strong>${review.name}</strong><small class="ml-2 uppercase tracking-wider opacity-50">Verified buyer</small></article>`;
}

export function cartPage() {
  const cart = getCart();
  if (!cart.length) return createPage(`<section class="grid min-h-[75vh] place-items-center px-6 pt-24"><div class="text-center"><span class="material-symbols-outlined text-8xl opacity-20">shopping_basket</span><h1 class="mt-4 text-5xl">Your bag is empty</h1><a href="#/shop" class="btn-primary mt-8">Start shopping</a></div></section>`);
  const coupon = storage.get('mensrare_applied_coupon', null);
  const subtotal = cartTotal();
  const discount = coupon ? Math.round(subtotal * Number(coupon.discount) / 100) : 0;
  const total = subtotal - discount;
  return createPage(`
    <section class="mx-auto max-w-7xl px-6 pb-24 pt-32"><h1 class="mb-10 text-5xl font-bold">Shopping Bag</h1>
      <div class="grid gap-10 lg:grid-cols-[1fr_380px]"><div class="space-y-5">${cart.map(cartItem).join('')} ${addressForm()}</div>
      <aside class="glass-card h-fit p-7 lg:sticky lg:top-28"><h2 class="text-3xl">Order Summary</h2><div class="my-5 flex gap-2">${coupon ? `<input class="field" value="${coupon.code}" disabled><button data-action="remove-coupon" class="btn-secondary !px-4">Remove</button>` : '<input id="coupon-input" class="field uppercase" placeholder="Coupon code"><button data-action="apply-coupon" class="btn-primary !px-4">Apply</button>'}</div><div class="space-y-3 border-b border-black/10 pb-5"><div class="flex justify-between"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>${coupon ? `<div class="flex justify-between text-emerald-700"><span>${coupon.code} (-${coupon.discount}%)</span><span>-₹${discount.toLocaleString('en-IN')}</span></div>` : ''}<div class="flex justify-between pt-3"><strong>Total</strong><strong class="text-2xl text-primary">₹${total.toLocaleString('en-IN')}</strong></div></div><button data-action="checkout" class="btn-primary mt-6 w-full !bg-[#25D366]">Checkout via WhatsApp</button></aside></div>
    </section>`);
}

function cartItem(item) {
  return `<article class="glass-card flex gap-5 p-4"><img src="${responsiveUrl(item.image_url, 360)}" width="144" height="192" loading="lazy" decoding="async" alt="${item.name}" class="h-36 w-28 rounded-2xl object-cover"><div class="min-w-0 flex-1"><div class="flex justify-between gap-3"><div><h2 class="text-2xl">${item.name}</h2><p class="text-sm opacity-60">${item.category} · Size ${item.size}</p></div><button data-action="remove-cart" data-id="${item.id}" data-size="${item.size}" aria-label="Remove"><span class="material-symbols-outlined">close</span></button></div><div class="mt-6 flex items-center justify-between"><div class="flex items-center rounded-xl bg-black/5"><button data-action="quantity" data-id="${item.id}" data-size="${item.size}" data-delta="-1" class="p-2">−</button><span class="w-8 text-center font-bold">${item.quantity}</span><button data-action="quantity" data-id="${item.id}" data-size="${item.size}" data-delta="1" class="p-2">+</button></div><strong class="text-primary">₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong></div></div></article>`;
}

function addressForm() {
  const fields = [['fullname','Full name'],['phone','Phone number'],['house','House / Flat'],['street','Street / Area'],['village','Village'],['city','City'],['district','District'],['state','State'],['pincode','Pincode']];
  return `<section class="glass-card mt-8 p-6"><h2 class="mb-5 text-3xl">Shipping Information</h2><div class="grid gap-4 md:grid-cols-2">${fields.map(([key,label]) => `<label class="${['fullname','house','street','village'].includes(key) ? 'md:col-span-2' : ''}"><span class="mb-1 block text-[10px] font-black uppercase tracking-widest opacity-60">${label}</span><input class="field" data-address="${key}" autocomplete="shipping ${key === 'fullname' ? 'name' : key === 'phone' ? 'tel' : key}" required></label>`).join('')}</div></section>`;
}

export function wishlistPage() {
  return createPage(`<section class="grid min-h-[75vh] place-items-center px-6 pt-24"><div class="text-center"><span class="material-symbols-outlined text-8xl text-primary/25">favorite</span><h1 class="mt-4 text-5xl">Your Wishlist</h1><p class="mt-4 opacity-70">Save items you love and they will appear here.</p><a href="#/shop" class="btn-primary mt-8">Explore collection</a></div></section>`);
}

export function loadingPage() {
  return createPage(`<section class="grid min-h-[70vh] place-items-center pt-24"><div class="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div></section>`);
}
