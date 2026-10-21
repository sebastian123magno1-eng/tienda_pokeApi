/**
 * Shared helper utilities used by both pages.
 */

/** Formats a number as a price with two decimals (e.g. 1,234.50). */
export function formatPrice(value) {
    return Number(value || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/** Escapes text before inserting it into HTML to avoid broken markup / XSS. */
export function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Opens a modal overlay. */
export function openModal(modal) {
    modal.classList.add('active');
}

/** Closes a modal overlay. */
export function closeModal(modal) {
    modal.classList.remove('active');
}

/** Closes the modal when the user clicks on the dark backdrop. */
export function closeOnBackdropClick(modal, onClose = () => closeModal(modal)) {
    modal.addEventListener('click', (event) => {
        if (event.target === modal) onClose();
    });
}
