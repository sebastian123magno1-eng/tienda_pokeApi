/**
 * Create / edit product form modal.
 */
import { openModal, closeModal } from '../shared/utils.js';
import { DEFAULT_IMAGE } from './sampleProducts.js';

const formModal = document.getElementById('formModal');
const formTitle = document.getElementById('formTitle');
const form = document.getElementById('productForm');
const submitBtn = document.getElementById('formSubmitBtn');
const editSelectorBox = document.getElementById('editSelectorBox');
const editSelector = document.getElementById('editSelector');

const fields = {
    id: document.getElementById('productId'),
    name: document.getElementById('productName'),
    price: document.getElementById('productPrice'),
    category: document.getElementById('productCategory'),
    image: document.getElementById('productImage'),
    description: document.getElementById('productDescription')
};

function fillForm(product) {
    fields.id.value = product.id;
    fields.name.value = product.name;
    fields.price.value = product.price;
    fields.category.value = product.category || '';
    fields.image.value = product.image || '';
    fields.description.value = product.description || '';
}

/** Opens the modal in "create" mode with an empty form. */
export function openCreateForm() {
    form.reset();
    fields.id.value = '';
    editSelectorBox.style.display = 'none';
    formTitle.textContent = '➕ Create New Product';
    submitBtn.textContent = 'Create Product';
    openModal(formModal);
    fields.name.focus();
}

/**
 * Opens the modal in "edit" mode. A dropdown lets the user switch
 * to any other product to edit.
 */
export function openEditForm(products, selected = null) {
    if (products.length === 0) return;

    editSelector.innerHTML = products
        .map((p) => `<option value="${p.id}">${p.name} ($${Number(p.price || 0).toFixed(2)})</option>`)
        .join('');

    const target = selected || products[0];
    editSelector.value = String(target.id);
    editSelector.onchange = () => {
        const chosen = products.find((p) => String(p.id) === editSelector.value);
        if (chosen) fillForm(chosen);
    };

    editSelectorBox.style.display = 'block';
    fillForm(target);
    formTitle.textContent = '✏️ Edit Product';
    submitBtn.textContent = 'Save Changes';
    openModal(formModal);
    fields.name.focus();
}

/** Closes the form modal and clears its fields. */
export function closeForm() {
    closeModal(formModal);
    form.reset();
    fields.id.value = '';
}

/** Reads the form values. Returns the id (or null when creating) and the product data. */
export function readForm() {
    return {
        id: fields.id.value ? Number(fields.id.value) : null,
        data: {
            name: fields.name.value.trim(),
            price: parseFloat(fields.price.value),
            category: fields.category.value.trim(),
            image: fields.image.value.trim() || DEFAULT_IMAGE,
            description: fields.description.value.trim()
        }
    };
}
