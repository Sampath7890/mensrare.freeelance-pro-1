import { getCart } from './cart.js';
import { storage } from './storage.js';

const ADDRESS_KEY = 'mensrare_checkout_address';
const saveAddress = (() => {
  let timer;
  return (address) => {
    clearTimeout(timer);
    timer = setTimeout(() => storage.set(ADDRESS_KEY, address), 180);
  };
})();

export function restoreAddress() {
  const address = storage.get(ADDRESS_KEY, {});
  document.querySelectorAll('[data-address]').forEach((input) => {
    input.value = address[input.dataset.address] || '';
  });
}

export function handleAddressInput(input) {
  const address = storage.get(ADDRESS_KEY, {});
  address[input.dataset.address] = input.value;
  saveAddress({ ...address });
}

export function checkoutViaWhatsApp() {
  const inputs = [...document.querySelectorAll('[data-address]')];
  const missing = inputs.find((input) => !input.value.trim());
  if (missing) {
    missing.focus();
    missing.reportValidity();
    return;
  }
  const address = Object.fromEntries(inputs.map((input) => [input.dataset.address, input.value.trim()]));
  const lines = getCart().map((item, index) => `${index + 1}. *${item.name}* — Size ${item.size}, Qty ${item.quantity}, ₹${item.price * item.quantity}`);
  const subtotal = getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  const coupon = storage.get('mensrare_applied_coupon', null);
  const discount = coupon ? Math.round(subtotal * Number(coupon.discount) / 100) : 0;
  const total = subtotal - discount;
  const message = [
    '🛍️ *New Order from Mensrare Storefront*',
    '',
    `Name: ${address.fullname}`,
    `Phone: ${address.phone}`,
    '',
    '📍 *Shipping Address*',
    address.house, address.street, address.village,
    `${address.city}, ${address.district}`,
    `${address.state} - ${address.pincode}`,
    '',
    '🛒 *Order Summary*',
    ...lines,
    ...(coupon ? ['', `🏷️ Coupon ${coupon.code}: -₹${discount}`] : []),
    '',
    `💰 *Total Amount: ₹${total}*`,
    '',
    'Please confirm my order. Thank you!'
  ].join('\n');
  open(`https://wa.me/918019553486?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}

export function applyCoupon(code) {
  const coupon = storage.get('mensrare_coupons', []).find((item) => item.code === code.trim().toUpperCase());
  if (!coupon) return false;
  storage.set('mensrare_applied_coupon', coupon, { debounce: 0 });
  return true;
}

export function removeCoupon() {
  storage.remove('mensrare_applied_coupon');
}
