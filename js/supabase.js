const url = import.meta.env.VITE_SUPABASE_URL || 'https://vtmhwfvifxtyjngjazxe.supabase.co';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bWh3ZnZpZnh0eWpuZ2phenhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTQwMjIsImV4cCI6MjA5MjMzMDAyMn0.fpIeovPu_BUfJGzO7mtX9GBnNHHRvDH3NwivD4_bctA';

export const PRODUCT_COLUMNS = 'id,name,category,price,image_url,description';

async function request(path, options = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
      ...options.headers
    }
  });
  if (!response.ok) throw new Error(`Inventory request failed (${response.status})`);
  if (response.status === 204 || response.headers.get('content-length') === '0') return null;
  return response.json();
}

export const supabase = {
  listProducts() {
    return request(`products?select=${PRODUCT_COLUMNS}&order=name.asc`, { headers: { Prefer: 'return=representation' } });
  },
  getProduct(id) {
    return request(`products?select=${PRODUCT_COLUMNS}&id=eq.${encodeURIComponent(id)}&limit=1`, { headers: { Prefer: 'return=representation' } })
      .then((rows) => rows?.[0] || null);
  },
  insertProduct(product) {
    return request('products', { method: 'POST', body: JSON.stringify(product) });
  },
  updateProduct(id, product) {
    return request(`products?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(product) });
  },
  deleteProduct(id) {
    return request(`products?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
  async uploadProductImage(file) {
    const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '-')}`;
    const response = await fetch(`${url}/storage/v1/object/product-images/${filename}`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': file.type, 'x-upsert': 'true' },
      body: file
    });
    if (!response.ok) throw new Error(`Image upload failed (${response.status})`);
    return `${url}/storage/v1/object/public/product-images/${filename}`;
  }
};
