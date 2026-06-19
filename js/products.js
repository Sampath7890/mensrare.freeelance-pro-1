import { supabase } from './supabase.js';

const FALLBACK_PRODUCTS = [
  { id: 'local-shirt', name: 'Terracotta Signature Shirt', category: 'Shirts', price: 1299, image_url: '/images/formal_shirt-720.webp', description: 'A breathable premium shirt cut for a clean modern silhouette.' },
  { id: 'local-tee', name: 'Cobalt Essential Tee', category: 'T-Shirts', price: 799, image_url: '/images/casual_tee-720.webp', description: 'Soft cotton, saturated color, and an easy everyday fit.' },
  { id: 'local-jacket', name: 'Midnight Atelier Jacket', category: 'Jackets', price: 2499, image_url: '/images/jacket-720.webp', description: 'Structured outerwear with a refined boutique finish.' },
  { id: 'local-casual', name: 'Summer Resort Shirt', category: 'Shirts', price: 1499, image_url: '/images/shirt-720.webp', description: 'A relaxed statement shirt made for warm days.' }
];

const cache = { products: null, timestamp: 0, request: null };
const MAX_AGE = 60_000;
const STALE_AGE = 10 * 60_000;
const listeners = new Set();

function notify() { listeners.forEach((listener) => listener(cache.products)); }

async function requestProducts() {
  if (cache.request) return cache.request;
  cache.request = supabase
    .listProducts()
    .then((data) => {
      cache.products = data?.length ? data : FALLBACK_PRODUCTS;
      cache.timestamp = Date.now();
      notify();
      return cache.products;
    })
    .catch((error) => {
      console.warn('Using local products because inventory refresh failed.', error);
      cache.products ||= FALLBACK_PRODUCTS;
      return cache.products;
    })
    .finally(() => { cache.request = null; });
  return cache.request;
}

export function getProducts({ force = false } = {}) {
  const age = Date.now() - cache.timestamp;
  if (!force && cache.products && age < MAX_AGE) return Promise.resolve(cache.products);
  if (!force && cache.products && age < STALE_AGE) {
    requestProducts();
    return Promise.resolve(cache.products);
  }
  return requestProducts();
}

export async function getProduct(id) {
  const products = await getProducts();
  const cached = products.find((item) => String(item.id) === String(id));
  if (cached) return cached;
  return supabase.getProduct(id);
}

export function subscribeProducts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function invalidateProducts() {
  cache.timestamp = 0;
}

export function seedProductCache(products) {
  cache.products = products;
  cache.timestamp = Date.now();
  notify();
}

export function filterProducts(products, query, category) {
  const normalized = query.trim().toLocaleLowerCase();
  return products.filter((product) => {
    const categoryMatch = !category || category === 'All' || product.category === category;
    if (!normalized) return categoryMatch;
    const haystack = `${product.name} ${product.category} ${product.description || ''}`.toLocaleLowerCase();
    return categoryMatch && haystack.includes(normalized);
  });
}

export async function upsertProduct(product) {
  const payload = {
    name: product.name,
    category: product.category,
    price: Number(product.price),
    image_url: product.image_url,
    description: product.description
  };
  if (product.id) await supabase.updateProduct(product.id, payload);
  else await supabase.insertProduct(payload);
  invalidateProducts();
}

export async function removeProduct(id) {
  await supabase.deleteProduct(id);
  invalidateProducts();
}
