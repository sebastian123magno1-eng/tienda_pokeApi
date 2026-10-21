/**
 * Products API client.
 * Talks to the Spring Boot back-end (/api/products) backed by PostgreSQL.
 * If the back-end is not running (e.g. the HTML is opened directly), it falls
 * back to an in-memory list so the page can still be demonstrated.
 */
import { SAMPLE_PRODUCTS } from './sampleProducts.js';

const API_URL =
    window.location.port === '8080' ? '/api/products' : 'http://localhost:8080/api/products';

let offlineMode = false;
let offlineProducts = [];

async function request(url, options = {}) {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

/** GET /api/products */
export async function getProducts() {
    try {
        const products = await request(API_URL);
        offlineMode = false;
        return products;
    } catch (error) {
        console.warn('Back-end not available, using in-memory sample data.', error);
        offlineMode = true;
        offlineProducts = SAMPLE_PRODUCTS.map((product) => ({ ...product }));
        return [...offlineProducts];
    }
}

/** POST /api/products */
export async function createProduct(product) {
    if (offlineMode) {
        const created = { ...product, id: Date.now() };
        offlineProducts.unshift(created);
        return created;
    }
    return request(API_URL, { method: 'POST', body: JSON.stringify(product) });
}

/** PUT /api/products/{id} */
export async function updateProduct(id, product) {
    if (offlineMode) {
        offlineProducts = offlineProducts.map((p) => (p.id === id ? { ...p, ...product, id } : p));
        return offlineProducts.find((p) => p.id === id);
    }
    return request(`${API_URL}/${id}`, { method: 'PUT', body: JSON.stringify(product) });
}

/** DELETE /api/products/{id} */
export async function deleteProduct(id) {
    if (offlineMode) {
        offlineProducts = offlineProducts.filter((p) => p.id !== id);
        return;
    }
    await request(`${API_URL}/${id}`, { method: 'DELETE' });
}
