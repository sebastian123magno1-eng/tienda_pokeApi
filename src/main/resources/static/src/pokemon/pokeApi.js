/**
 * PokéAPI client.
 *
 * CHAINED CONSUMPTION OF 3 ENDPOINTS (each request uses data returned by the previous one):
 *   1) GET /api/v2/pokemon/{idOrName}
 *        -> returns `species.url`
 *   2) GET {species.url}            (/api/v2/pokemon-species/{id})
 *        -> returns the description and `evolution_chain.url`
 *   3) GET {evolution_chain.url}    (/api/v2/evolution-chain/{chainId})
 *        -> returns the full evolution chain
 */
const BASE_URL = 'https://pokeapi.co/api/v2';
const ARTWORK_URL =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

export const INITIAL_POKEMON_IDS = [1, 4, 7, 25, 39, 94, 133, 143, 150];

async function getJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed: ${url}`);
    return response.json();
}

function idFromUrl(url) {
    return url.split('/').filter(Boolean).pop();
}

/** Picks the English entry if available, otherwise Spanish. */
function pickLocalized(entries, key) {
    const entry =
        entries?.find((e) => e.language.name === 'en') ||
        entries?.find((e) => e.language.name === 'es');
    return entry ? entry[key].replace(/[\f\n\r]+/g, ' ') : '';
}

/** Flattens the recursive evolution tree into a simple list. */
function flattenEvolutionChain(node, result = []) {
    if (!node) return result;
    const id = idFromUrl(node.species.url);
    result.push({ id, name: node.species.name, image: `${ARTWORK_URL}/${id}.png` });
    node.evolves_to.forEach((next) => flattenEvolutionChain(next, result));
    return result;
}

/**
 * Fetches a Pokémon using the 3 chained endpoints and returns a plain object
 * ready to be rendered.
 */
export async function fetchPokemon(idOrName) {
    const query = String(idOrName).trim().toLowerCase();

    // STEP 1 - Endpoint 1: base Pokémon data.
    const pokemon = await getJson(`${BASE_URL}/pokemon/${query}`);

    // STEP 2 - Endpoint 2: uses the species URL returned by endpoint 1.
    const species = await getJson(pokemon.species.url);

    // STEP 3 - Endpoint 3: uses the evolution chain URL returned by endpoint 2.
    const evolutionChain = await getJson(species.evolution_chain.url);

    return {
        id: pokemon.id,
        name: pokemon.name,
        image:
            pokemon.sprites?.other?.['official-artwork']?.front_default ||
            pokemon.sprites?.front_default,
        shinyImage:
            pokemon.sprites?.other?.['official-artwork']?.front_shiny ||
            pokemon.sprites?.front_shiny,
        types: pokemon.types.map((t) => t.type.name),
        heightM: (pokemon.height / 10).toFixed(1),
        weightKg: (pokemon.weight / 10).toFixed(1),
        baseExperience: pokemon.base_experience || 0,
        abilities: pokemon.abilities.map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
        stats: pokemon.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
        description: pickLocalized(species.flavor_text_entries, 'flavor_text') || 'No description available.',
        genus: pickLocalized(species.genera, 'genus') || 'Pokémon',
        habitat: species.habitat?.name || 'Unknown',
        evolutions: flattenEvolutionChain(evolutionChain.chain)
    };
}

/** Loads the initial catalog shown when the page opens. */
export function fetchInitialCatalog() {
    return Promise.all(INITIAL_POKEMON_IDS.map((id) => fetchPokemon(id)));
}
