/**
 * Rendering of the product cards (3-column grid) and the detail modal.
 */
import { escapeHtml, formatPrice, openModal } from '../shared/utils.js';
import { DEFAULT_IMAGE } from './sampleProducts.js';

const grid = document.getElementById('productsGrid');
const resultsCount = document.getElementById('resultsCount');

const detailModal = document.getElementById('detailModal');
const detailImg = document.getElementById('detailImg');
const detailCategory = document.getElementById('detailCategory');
const detailPrice = document.getElementById('detailPrice');
const detailTitle = document.getElementById('detailTitle');
const detailDesc = document.getElementById('detailDesc');

/**
 * Draws the product cards.
 * @param {Array} products products to show
 * @param {{onOpen: Function, onEdit: Function, onDelete: Function}} handlers card actions
 */
export function renderProductCards(products, handlers) {
    grid.innerHTML = '';
    resultsCount.textContent = `${products.length} product${products.length === 1 ? '' : 's'}`;

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No products found</h3>
                <p>Try a different search term.</p>
            </div>`;
        return;
    }

    products.forEach((product) => {
        const card = document.createElement('article');
        card.className = 'card clickable-card';
        card.title = 'Click to see product details';
        card.innerHTML = `
            <div class="card-image-container">
                <img src="${escapeHtml(product.image || DEFAULT_IMAGE)}" alt="${escapeHtml(product.name)}" class="card-image" loading="lazy" />
                <span class="card-badge">${escapeHtml(product.category || 'General')}</span>
            </div>
            <div class="card-body">
                <h2 class="card-title">${escapeHtml(product.name)}</h2>
                <p class="card-description">${escapeHtml(product.description)}</p>
                <div class="card-footer">
                    <span class="card-price">$${formatPrice(product.price)}</span>
                    <div class="card-actions">
                        <button type="button" class="btn btn-warning btn-sm" data-action="edit">✏️ Edit</button>
                        <button type="button" class="btn btn-danger btn-sm" data-action="delete">🗑️ Delete</button>
                    </div>
                </div>
            </div>`;

        // Clicking anywhere on the card opens the detail on the same page.
        card.addEventListener('click', () => handlers.onOpen(product));

        // Action buttons stop propagation so they do not open the detail modal.
        card.querySelector('[data-action="edit"]').addEventListener('click', (event) => {
            event.stopPropagation();
            handlers.onEdit(product);
        });
        card.querySelector('[data-action="delete"]').addEventListener('click', (event) => {
            event.stopPropagation();
            handlers.onDelete(product);
        });

        grid.appendChild(card);
    });
}

/** Fills and opens the product detail modal. */
export function showProductDetail(product) {
    detailImg.src = product.image || DEFAULT_IMAGE;
    detailImg.alt = product.name;
    detailCategory.textContent = product.category || 'General';
    detailPrice.textContent = `$${formatPrice(product.price)}`;
    detailTitle.textContent = product.name;
    detailDesc.textContent = product.description;
    openModal(detailModal);
}
