/**
 * Products page entry point.
 * Loads the products from the back-end, wires the instant search
 * and the create / edit / delete actions.
 */
import { getProducts, createProduct, updateProduct, deleteProduct } from './productApi.js';
import { renderProductCards, showProductDetail } from './productView.js';
import { openCreateForm, openEditForm, closeForm, readForm } from './productForm.js';
import { closeModal, closeOnBackdropClick } from '../shared/utils.js';

const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const detailModal = document.getElementById('detailModal');
const formModal = document.getElementById('formModal');

let products = [];
let productInDetail = null;

const cardHandlers = {
    onOpen(product) {
        productInDetail = product;
        showProductDetail(product);
    },
    onEdit(product) {
        openEditForm(products, product);
    },
    async onDelete(product) {
        await deleteProduct(product.id);
        products = products.filter((p) => p.id !== product.id);
        applySearch();
    }
};

/** Instant search: filters on every keystroke, no delay. */
function applySearch() {
    const term = searchInput.value.trim().toLowerCase();
    clearSearchBtn.hidden = term.length === 0;

    const filtered = !term
        ? products
        : products.filter((p) =>
              [p.name, p.description, p.category].some((value) =>
                  (value || '').toLowerCase().includes(term)
              )
          );

    renderProductCards(filtered, cardHandlers);
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const { id, data } = readForm();

    if (id) {
        const updated = await updateProduct(id, data);
        products = products.map((p) => (p.id === id ? updated : p));
    } else {
        const created = await createProduct(data);
        products = [created, ...products];
    }

    closeForm();
    applySearch();
}

function registerEvents() {
    searchInput.addEventListener('input', applySearch);
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        applySearch();
        searchInput.focus();
    });

    document.getElementById('openCreateBtn').addEventListener('click', openCreateForm);
    document.getElementById('openEditBtn').addEventListener('click', () => openEditForm(products));

    document.getElementById('productForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('formCloseBtn').addEventListener('click', closeForm);
    document.getElementById('formCancelBtn').addEventListener('click', closeForm);
    closeOnBackdropClick(formModal, closeForm);

    document.getElementById('detailCloseBtn').addEventListener('click', () => closeModal(detailModal));
    document.getElementById('detailEditBtn').addEventListener('click', () => {
        closeModal(detailModal);
        if (productInDetail) openEditForm(products, productInDetail);
    });
    closeOnBackdropClick(detailModal);
}

async function init() {
    registerEvents();
    products = await getProducts();
    applySearch();
}

init();
