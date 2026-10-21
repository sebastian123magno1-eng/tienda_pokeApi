/**
 * Pokémon detail view, shown in a modal on the same page (no new tab, no URL change).
 */
import { openModal, closeModal } from '../shared/utils.js';
import { escapeHtml } from '../shared/utils.js';
import { padId } from './pokemonView.js';

const modal = document.getElementById('pokemonDetailModal');
const body = document.getElementById('pokemonDetailBody');

function statsHtml(stats) {
    return stats
        .map((stat) => {
            const percent = Math.min(100, Math.round((stat.value / 180) * 100));
            return `
                <div class="stat-row">
                    <span style="text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">${stat.name}</span>
                    <strong>${stat.value}</strong>
                    <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${percent}%;"></div></div>
                </div>`;
        })
        .join('');
}

function evolutionsHtml(evolutions) {
    if (evolutions.length <= 1) {
        return '<p style="color: var(--text-secondary);">This Pokémon does not evolve.</p>';
    }
    return evolutions
        .map(
            (evo) => `
            <button type="button" class="evo-item" data-evo-id="${evo.id}" style="cursor: pointer;">
                <img src="${evo.image}" alt="${evo.name}" />
                <div style="text-transform: capitalize; font-weight: 700; font-size: 0.85rem;">#${evo.id} ${evo.name}</div>
            </button>`
        )
        .join('<span style="color: var(--accent-primary); font-weight: 800;">➔</span>');
}

/**
 * Renders and opens the detail modal.
 * @param {object} pokemon Pokémon to show
 * @param {Function} onSelectEvolution called with an evolution id when the user clicks it
 */
export function showPokemonDetail(pokemon, onSelectEvolution) {
    const types = pokemon.types.map((t) => `<span class="type-tag">${t}</span>`).join('');
    const abilities = pokemon.abilities
        .map((a) => `<span class="type-tag" style="text-transform: capitalize;">${a.name}${a.hidden ? ' (hidden)' : ''}</span>`)
        .join('');

    body.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
            <span class="badge-mode">${padId(pokemon.id)} · ${escapeHtml(pokemon.genus)}</span>
            <button type="button" data-action="close" class="btn btn-outline btn-sm">✕ Close</button>
        </div>
        <div class="detail-grid">
            <div class="detail-artwork-box">
                <img data-role="artwork" src="${pokemon.image}" alt="${pokemon.name}" class="detail-artwork" />
                <div style="margin-top: 1rem; display: flex; justify-content: center; gap: 0.5rem;">
                    <button type="button" data-action="normal" class="btn btn-primary btn-sm">Normal</button>
                    ${pokemon.shinyImage ? '<button type="button" data-action="shiny" class="btn btn-outline btn-sm">✨ Shiny</button>' : ''}
                </div>
                <div class="card-extra-box" style="margin-top: 1.25rem; text-align: left;">
                    <p><strong>📏 Height:</strong> ${pokemon.heightM} m</p>
                    <p><strong>⚖️ Weight:</strong> ${pokemon.weightKg} kg</p>
                    <p><strong>🌍 Habitat:</strong> ${pokemon.habitat}</p>
                    <p><strong>⭐ Base exp.:</strong> ${pokemon.baseExperience}</p>
                </div>
            </div>
            <div>
                <div class="type-tags">${types}</div>
                <h2 class="hero-title" style="text-align: left; text-transform: capitalize; font-size: 2rem; margin-bottom: 0.6rem;">${pokemon.name}</h2>
                <p style="margin-bottom: 1.25rem; background: rgba(15,23,42,0.55); padding: 0.9rem; border-radius: 10px; border: 1px solid var(--border-color);">
                    ${escapeHtml(pokemon.description)}
                </p>
                <h3 style="margin-bottom: 0.45rem; font-size: 1rem; color: var(--accent-primary);">Abilities</h3>
                <div class="type-tags" style="margin-bottom: 1.25rem;">${abilities}</div>
                <h3 style="margin-bottom: 0.45rem; font-size: 1rem; color: var(--accent-primary);">Base Stats</h3>
                <div class="stats-list" style="margin-bottom: 1.4rem;">${statsHtml(pokemon.stats)}</div>
                <h3 style="margin-bottom: 0.45rem; font-size: 1rem; color: var(--accent-primary);">Evolution Chain</h3>
                <div class="evo-chain">${evolutionsHtml(pokemon.evolutions)}</div>
            </div>
        </div>`;

    const artwork = body.querySelector('[data-role="artwork"]');
    const normalBtn = body.querySelector('[data-action="normal"]');
    const shinyBtn = body.querySelector('[data-action="shiny"]');

    body.querySelector('[data-action="close"]').addEventListener('click', () => closeModal(modal));

    if (shinyBtn) {
        normalBtn.addEventListener('click', () => {
            artwork.src = pokemon.image;
            normalBtn.className = 'btn btn-primary btn-sm';
            shinyBtn.className = 'btn btn-outline btn-sm';
        });
        shinyBtn.addEventListener('click', () => {
            artwork.src = pokemon.shinyImage;
            shinyBtn.className = 'btn btn-primary btn-sm';
            normalBtn.className = 'btn btn-outline btn-sm';
        });
    }

    body.querySelectorAll('[data-evo-id]').forEach((button) => {
        button.addEventListener('click', () => onSelectEvolution(button.dataset.evoId));
    });

    openModal(modal);
}

/** Shows a loading message inside the modal. */
export function showDetailLoading(text) {
    body.innerHTML = `<div style="text-align: center; padding: 2rem;"><h3>${escapeHtml(text)}</h3></div>`;
    openModal(modal);
}
