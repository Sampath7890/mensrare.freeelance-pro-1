import { cartPage, homePage, loadingPage, productPage, shopPage, wishlistPage } from './ui.js';

const container = document.querySelector('#app-container');
let routeToken = 0;

function parseRoute() {
  const raw = location.hash.slice(1) || '/';
  const [path, query = ''] = raw.split('?');
  return { path, params: new URLSearchParams(query) };
}

async function resolveRoute(path) {
  if (path === '/') return { title: 'Home', view: homePage() };
  if (path === '/shop') return { title: 'Shop', view: shopPage(), after: 'shop' };
  if (path === '/cart') return { title: 'Shopping Bag', view: cartPage(), after: 'cart' };
  if (path === '/wishlist') return { title: 'Wishlist', view: wishlistPage() };
  if (path === '/admin') {
    const { adminPage } = await import('./admin.js');
    return { title: 'Admin', view: adminPage(), after: 'admin' };
  }
  if (path.startsWith('/product/')) {
    const { getProduct } = await import('./products.js');
    const id = decodeURIComponent(path.split('/')[2]);
    const product = await getProduct(id);
    return { title: product?.name || 'Product', view: productPage(product), product };
  }
  return { title: 'Not found', view: productPage(null) };
}

function updateActiveLinks(path) {
  document.querySelectorAll('.nav-link,.mobile-nav-link').forEach((link) => {
    const linkPath = link.getAttribute('href').slice(1);
    link.classList.toggle('active', linkPath === path || (path.startsWith('/product/') && linkPath === '/shop'));
  });
}

export async function navigate() {
  const token = ++routeToken;
  const { path, params } = parseRoute();
  if (path.startsWith('/product/') || path === '/admin') container.replaceChildren(loadingPage());
  try {
    const route = await resolveRoute(path);
    if (token !== routeToken) return;
    const commit = () => {
      container.replaceChildren(route.view);
      document.title = `${route.title} | Mensrare`;
      updateActiveLinks(path);
      scrollTo({ top: 0, behavior: 'auto' });
      container.focus({ preventScroll: true });
    };

    if (document.startViewTransition) {
      await document.startViewTransition(commit).updateCallbackDone;
    } else {
      commit();
    }

    if (route.after === 'shop') {
      const { getProducts } = await import('./products.js');
      const { initShop } = await import('./shop.js');
      initShop(params, await getProducts());
    } else if (route.after === 'cart') {
      const { restoreAddress } = await import('./cart-page.js');
      restoreAddress();
    } else if (route.after === 'admin') {
      const { initAdmin } = await import('./admin.js');
      initAdmin();
    }
  } catch (error) {
    console.error(error);
    container.replaceChildren(productPage(null));
  }
}

addEventListener('hashchange', navigate);
