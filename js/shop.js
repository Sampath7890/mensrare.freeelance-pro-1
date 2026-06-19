import { filterProducts, subscribeProducts } from './products.js';
import { renderProductGrid } from './ui.js';

let cleanup;

function debounce(callback, delay = 180) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

export function initShop(params, initialProducts) {
  cleanup?.();
  const search = document.querySelector('#product-search');
  const category = document.querySelector('#product-category');
  const grid = document.querySelector('#product-grid');
  const status = document.querySelector('#product-status');
  if (!search || !category || !grid) return;

  const requestedCategory = params.get('category');
  if (requestedCategory && [...category.options].some((option) => option.value === requestedCategory)) category.value = requestedCategory;

  let products = initialProducts;
  const render = () => {
    const filtered = filterProducts(products, search.value, category.value);
    renderProductGrid(grid, filtered);
    status.textContent = `${filtered.length} item${filtered.length === 1 ? '' : 's'}`;
  };
  const debouncedRender = debounce(render);
  search.addEventListener('input', debouncedRender);
  category.addEventListener('change', render);
  const unsubscribe = subscribeProducts((nextProducts) => {
    products = nextProducts;
    render();
  });
  cleanup = () => {
    unsubscribe();
    search.removeEventListener('input', debouncedRender);
    category.removeEventListener('change', render);
  };
  render();
  if (params.get('focus') === 'search') search.focus();
}
