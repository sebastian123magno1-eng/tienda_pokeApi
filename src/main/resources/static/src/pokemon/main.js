/**
 * Pokédex page entry point.
 * Loads the initial catalog, wires the debounced search (4 seconds)
 * and opens the detail modal on the same page.
 */
import { fetchPokemon, fetchInitialCatalog } from './pokeApi.js';
import { renderPokemonCards, showGridMessage, showDelayProgress, setStatus } from './pokemonView.js';
import { showPokemonDetail, showDetailLoading } from './pokemonDetail.js';
import { debounce } from '../shared/debounce.js';
import { closeOnBackdropClick } from '../shared/utils.js';

const SEARCH_DELAY_MS = 4000;

const searchInput = document.getElementById('pokemonSearchInput');
const clearBtn = document.getElementById('clearPokemonSearchBtn');
const detailModal = document.getElementById('pokemonDetailModal');

let catalog = [];

/** Opens the detail of a Pokémon; clicking an evolution loads that one. */
function openDetail(pokemon) {
    showPokemonDetail(pokemon, async (evolutionId) => {
        const cached = catalog.find((p) => String(p.id) === String(evolutionId));
        if (cached) {
            openDetail(cached);
            return;
        }
        showDetailLoading('Loading...');
        openDetail(await fetchPokemon(evolutionId));
    });
}

function showList(list) {
    renderPokemonCards(list, openDetail);
}

/** Runs the actual search (called only after the 4-second debounce). */
async function runSearch(rawTerm) {
    const term = rawTerm.trim().toLowerCase();

    if (!term) {
        setStatus();
        showList(catalog);
        return;
    }

    const localMatches = catalog.filter(
        (p) => p.name.includes(term) || String(p.id) === term || p.types.some((t) => t.includes(term))
    );

    if (localMatches.length > 0) {
        setStatus(`✅ Results for "${rawTerm}"`);
        showList(localMatches);
        return;
    }

    setStatus(`🔎 Searching "${rawTerm}"...`);
    showGridMessage(`Searching "${rawTerm}"...`);

    try {
        const found = await fetchPokemon(term);
        setStatus(`✅ Found: "${found.name}"`);
        showList([found]);
    } catch {
        setStatus(`⚠️ No results for "${rawTerm}"`);
        showList([]);
    }
}

const debouncedSearch = debounce(runSearch, SEARCH_DELAY_MS, showDelayProgress);

function registerEvents() {
    searchInput.addEventListener('input', () => {
        clearBtn.hidden = searchInput.value.length === 0;
        debouncedSearch(searchInput.value);
    });

    clearBtn.addEventListener('click', () => {
        debouncedSearch.cancel();
        searchInput.value = '';
        clearBtn.hidden = true;
        setStatus();
        showList(catalog);
    });

    closeOnBackdropClick(detailModal);
}

async function init() {
    registerEvents();
    showGridMessage('Loading Pokémon...');
    try {
        catalog = await fetchInitialCatalog();
        showList(catalog);
    } catch (error) {
        showGridMessage('Could not load data', error.message);
    }
}

init();
