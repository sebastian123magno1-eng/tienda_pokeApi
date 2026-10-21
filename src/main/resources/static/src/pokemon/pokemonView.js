/**
 * Rendering of the Pokémon cards (3-column grid) and search status messages.
 */
import { escapeHtml } from '../shared/utils.js';

const grid = document.getElementById('pokemonGrid');
const resultsCount = document.getElementById('pokemonResultsCount');
const statusBadge = document.getElementById('delayStatusBadge');
const progressContainer = document.getElementById('delayProgressContainer');
const progressBar = document.getElementById('delayProgressBar');

export const DEFAULT_STATUS = '⏱️ Search with a 4s delay';

export function padId(id) {
    return `#${String(id).padStart(3, '0')}`;
}

export function showGridMessage(title, text = '') {
    grid.innerHTML = `
        <div class="empty-state">
            <h3>${escapeHtml(title)}</h3>
            ${text ? `<p>${escapeHtml(text)}</p>` : ''}
        </div>`;
}

/** Draws the Pokémon cards. Clicking a card calls `onOpen(pokemon)`. */
export function renderPokemonCards(list, onOpen) {
    grid.innerHTML = '';
    resultsCount.textContent = `${list.length} Pokémon`;

    if (list.length === 0) {
        showGridMessage('No Pokémon found', 'Try a name like "pikachu", "gengar" or a Pokédex number.');
        return;
    }

    list.forEach((pokemon) => {
        const typeTags = pokemon.types.map((t) => `<span class="type-tag">${t}</span>`).join('');
        const evolutionText = pokemon.evolutions.map((e) => e.name).join(' ➔ ');

        const card = document.createElement('article');
        card.className = 'card clickable-card';
        card.title = `See details of ${pokemon.name}`;
        card.innerHTML = `
            <div class="card-image-container">
                <img src="${pokemon.image}" alt="${pokemon.name}" class="card-image pokemon-sprite" loading="lazy" />
                <span class="card-badge">${padId(pokemon.id)} · ${escapeHtml(pokemon.genus)}</span>
            </div>
            <div class="card-body">
                <div class="type-tags">${typeTags}</div>
                <h2 class="card-title">${pokemon.name}</h2>
                <p class="card-description">${escapeHtml(pokemon.description)}</p>
                <div class="card-extra-box" style="text-transform: capitalize;">
                    🔄 <strong>Evolution:</strong> ${evolutionText}
                </div>
                <div class="card-footer">
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">
                        📏 ${pokemon.heightM} m &nbsp;·&nbsp; ⚖️ ${pokemon.weightKg} kg
                    </span>
                    <span class="btn btn-primary btn-sm">See details</span>
                </div>
            </div>`;

        card.addEventListener('click', () => onOpen(pokemon));
        grid.appendChild(card);
    });
}

/** Updates the countdown text and progress bar while the debounce is waiting. */
export function showDelayProgress(remainingMs, progress) {
    progressContainer.classList.add('active');
    progressBar.style.width = `${progress * 100}%`;
    statusBadge.textContent = `⏳ Searching in ${(remainingMs / 1000).toFixed(1)}s...`;
}

/** Hides the progress bar and sets the status text. */
export function setStatus(text = DEFAULT_STATUS) {
    progressContainer.classList.remove('active');
    progressBar.style.width = '0%';
    statusBadge.textContent = text;
}
