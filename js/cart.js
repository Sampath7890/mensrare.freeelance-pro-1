import { storage } from './storage.js';

const KEY = 'rare_rat_cart';
let cart = storage.get(KEY, []);
const listeners = new Set();

function commit() {
  storage.set(KEY, cart);
  listeners.forEach((listener) => listener(cart));
}

export function getCart() { return cart; }
export function subscribeCart(listener) { listeners.add(listener); return () => listeners.delete(listener); }

export function addToCart(product, size = 'M') {
  const existing = cart.find((item) => String(item.id) === String(product.id) && item.size === size);
  if (existing) existing.quantity += 1;
  else cart = [...cart, { ...product, size, quantity: 1 }];
  commit();
}

export function removeFromCart(id, size) {
  cart = cart.filter((item) => !(String(item.id) === String(id) && (!size || item.size === size)));
  commit();
}

export function updateQuantity(id, size, delta) {
  cart = cart
    .map((item) => String(item.id) === String(id) && item.size === size ? { ...item, quantity: item.quantity + delta } : item)
    .filter((item) => item.quantity > 0);
  commit();
}

export function updateSize(id, oldSize, size) {
  cart = cart.map((item) => String(item.id) === String(id) && item.size === oldSize ? { ...item, size } : item);
  commit();
}

export function cartCount() { return cart.reduce((sum, item) => sum + item.quantity, 0); }
export function cartTotal() { return cart.reduce((sum, item) => sum + item.price * item.quantity, 0); }
