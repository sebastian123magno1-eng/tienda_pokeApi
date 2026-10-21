const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const SEARCH_DELAY_MS = 4000;

const POKEMON_INICIALES = [1, 4, 7, 25, 39, 94, 133, 143, 150];

let catalogoPokemon = [];
let timeoutBusqueda = null;
let intervaloCuentaRegresiva = null;

const pokemonGrid = document.getElementById('pokemonGrid');
const pokemonSearchInput = document.getElementById('pokemonSearchInput');
const clearPokeSearchBtn = document.getElementById('clearPokeSearchBtn');
const pokeResultsCount = document.getElementById('pokeResultsCount');
const delayStatusBadge = document.getElementById('delayStatusBadge');
const delayProgressContainer = document.getElementById('delayProgressContainer');
const delayProgressBar = document.getElementById('delayProgressBar');

// Modal de detalle en la misma página
const pokemonDetailModal = document.getElementById('pokemonDetailModal');
const pokemonDetailBody = document.getElementById('pokemonDetailBody');

function extraerIdDesdeUrl(url) {
    const partes = url.split('/').filter(Boolean);
    return partes[partes.length - 1];
}

function recorrerCadenaEvolutiva(nodo, resultado = []) {
    if (!nodo) return resultado;
    const idEspecie = extraerIdDesdeUrl(nodo.species.url);
    resultado.push({
        id: idEspecie,
        nombre: nodo.species.name,
        imagen: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idEspecie}.png`
    });
    if (Array.isArray(nodo.evolves_to) && nodo.evolves_to.length > 0) {
        nodo.evolves_to.forEach((siguiente) => recorrerCadenaEvolutiva(siguiente, resultado));
    }
    return resultado;
}

/**
 * Consume los 3 ENDPOINTS EN CADENA (uno consume la URL que devuelve el anterior):
 *  - Paso 1 (Endpoint 1): GET /api/v2/pokemon/{id} -> devuelve dataPokemon.species.url
 *  - Paso 2 (Endpoint 2): GET dataPokemon.species.url (/pokemon-species/{id}) -> devuelve dataSpecies.evolution_chain.url
 *  - Paso 3 (Endpoint 3): GET dataSpecies.evolution_chain.url (/evolution-chain/{chainId}) -> devuelve la cadena evolutiva
 */
async function obtenerPokemonConTresEndpoints(idONombre) {
    const identificador = String(idONombre).trim().toLowerCase();

    // PASO 1 (ENDPOINT 1): Datos principales del Pokémon (/pokemon/{id})
    const respPokemon = await fetch(`${POKEAPI_BASE}/pokemon/${identificador}`);
    if (!respPokemon.ok) {
        throw new Error(`No se encontró el Pokémon "${idONombre}"`);
    }
    const dataPokemon = await respPokemon.json();

    // Del Endpoint 1 extraemos la URL necesaria para consumir el Endpoint 2
    const urlEndpoint2Species = dataPokemon.species?.url;

    // PASO 2 (ENDPOINT 2 EN CADENA): Consumimos la URL entregada por el Endpoint 1 (/pokemon-species/{id})
    let dataSpecies = null;
    if (urlEndpoint2Species) {
        const respSpecies = await fetch(urlEndpoint2Species);
        if (respSpecies.ok) {
            dataSpecies = await respSpecies.json();
        }
    }

    // Del Endpoint 2 extraemos la URL necesaria para consumir el Endpoint 3
    const urlEndpoint3EvolutionChain = dataSpecies?.evolution_chain?.url;

    // PASO 3 (ENDPOINT 3 EN CADENA): Consumimos la URL entregada por el Endpoint 2 (/evolution-chain/{chainId})
    let evoluciones = [];
    if (urlEndpoint3EvolutionChain) {
        const respEvolution = await fetch(urlEndpoint3EvolutionChain);
        if (respEvolution.ok) {
            const dataEvolution = await respEvolution.json();
            evoluciones = recorrerCadenaEvolutiva(dataEvolution.chain);
        }
    }

    // Adicional: detalle de habilidad principal
    const habilidadPrincipalUrl = dataPokemon.abilities?.[0]?.ability?.url;
    let dataAbility = null;
    if (habilidadPrincipalUrl) {
        const respAbility = await fetch(habilidadPrincipalUrl);
        if (respAbility.ok) {
            dataAbility = await respAbility.json();
        }
    }

    let descripcionPokemon = 'Sin descripción disponible.';
    if (dataSpecies && Array.isArray(dataSpecies.flavor_text_entries)) {
        const entradaEs = dataSpecies.flavor_text_entries.find((e) => e.language.name === 'es');
        const entradaEn = dataSpecies.flavor_text_entries.find((e) => e.language.name === 'en');
        const textoCrudo = (entradaEs || entradaEn)?.flavor_text || '';
        descripcionPokemon = textoCrudo.replace(/[\f\n\r]+/g, ' ');
    }

    let categoriaEspecie = 'Pokémon';
    if (dataSpecies && Array.isArray(dataSpecies.genera)) {
        const generoEs = dataSpecies.genera.find((g) => g.language.name === 'es');
        const generoEn = dataSpecies.genera.find((g) => g.language.name === 'en');
        categoriaEspecie = (generoEs || generoEn)?.genus || 'Pokémon';
    }

    let nombreHabilidad = dataPokemon.abilities?.[0]?.ability?.name || 'Desconocida';
    let descripcionHabilidad = '';
    if (dataAbility) {
        const nombreEs = dataAbility.names?.find((n) => n.language.name === 'es');
        if (nombreEs) nombreHabilidad = nombreEs.name;

        const flavorHabEs = dataAbility.flavor_text_entries?.find((f) => f.language.name === 'es');
        const flavorHabEn = dataAbility.flavor_text_entries?.find((f) => f.language.name === 'en');
        if (flavorHabEs || flavorHabEn) {
            descripcionHabilidad = (flavorHabEs || flavorHabEn).flavor_text.replace(/[\f\n\r]+/g, ' ');
        }
    }

    const imagen =
        dataPokemon.sprites?.other?.['official-artwork']?.front_default ||
        dataPokemon.sprites?.other?.dream_world?.front_default ||
        dataPokemon.sprites?.front_default;

    const imagenShiny =
        dataPokemon.sprites?.other?.['official-artwork']?.front_shiny ||
        dataPokemon.sprites?.front_shiny;

    const tipos = dataPokemon.types.map((t) => t.type.name);

    return {
        id: dataPokemon.id,
        nombre: dataPokemon.name,
        imagen,
        imagenShiny,
        tipos,
        categoriaEspecie,
        descripcion: descripcionPokemon,
        habilidadNombre: nombreHabilidad,
        habilidadDescripcion: descripcionHabilidad,
        alturaMetros: (dataPokemon.height / 10).toFixed(1),
        pesoKg: (dataPokemon.weight / 10).toFixed(1),
        experienciaBase: dataPokemon.base_experience || 0,
        habitat: dataSpecies?.habitat?.name || 'Desconocido',
        evolutionChainUrl: urlEndpoint3EvolutionChain || null,
        evoluciones,
        abilitiesRaw: dataPokemon.abilities || [],
        stats: dataPokemon.stats.map((s) => ({
            nombre: s.stat.name,
            valor: s.base_stat
        }))
    };
}

async function cargarCatalogoInicial() {
    pokemonGrid.innerHTML = `
        <div class="empty-state">
            <h3>Cargando Pokémon...</h3>
        </div>
    `;

    try {
        const promesas = POKEMON_INICIALES.map((id) => obtenerPokemonConTresEndpoints(id));
        catalogoPokemon = await Promise.all(promesas);
        renderizarTarjetasPokemon(catalogoPokemon);
    } catch (error) {
        pokemonGrid.innerHTML = `
            <div class="empty-state">
                <h3>Error al cargar los datos</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function renderizarTarjetasPokemon(lista) {
    pokemonGrid.innerHTML = '';
    pokeResultsCount.textContent = `${lista.length} Pokémon`;

    if (lista.length === 0) {
        pokemonGrid.innerHTML = `
            <div class="empty-state">
                <h3>No se encontró ningún Pokémon</h3>
                <p>Prueba con un nombre como "pikachu", "gengar", "charizard" o un número de Pokédex.</p>
            </div>
        `;
        return;
    }

    lista.forEach((poke) => {
        const card = document.createElement('article');
        card.className = 'card clickable-card';
        card.title = `Ver información de ${poke.nombre}`;

        const etiquetasTipos = poke.tipos
            .map((tipo) => `<span class="type-tag">${tipo}</span>`)
            .join('');

        card.innerHTML = `
            <div class="card-image-container">
                <img
                    src="${poke.imagen}"
                    alt="${poke.nombre}"
                    class="card-image pokemon-sprite"
                    loading="lazy"
                />
                <span class="card-badge">#${String(poke.id).padStart(3, '0')} · ${poke.categoriaEspecie}</span>
            </div>
            <div class="card-body">
                <div class="type-tags">${etiquetasTipos}</div>
                <h2 class="card-title">${poke.nombre}</h2>
                <p class="card-description">${poke.descripcion}</p>
                <div class="card-extra-box">
                    ✨ <strong>Habilidad:</strong> ${poke.habilidadNombre}${poke.habilidadDescripcion ? ` — ${poke.habilidadDescripcion}` : ''}
                </div>
                <div class="card-footer">
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">
                        📏 ${poke.alturaMetros} m &nbsp;·&nbsp; ⚖️ ${poke.pesoKg} kg
                    </span>
                    <span class="btn btn-primary btn-sm">
                        Ver detalle
                    </span>
                </div>
            </div>
        `;

        // Al aplastar la tarjeta, muestra el detalle ahí mismo en la misma página
        card.addEventListener('click', () => mostrarDetalleEnMismaPagina(poke));

        pokemonGrid.appendChild(card);
    });
}

async function mostrarDetalleEnMismaPagina(pokeBase) {
    pokemonDetailModal.classList.add('active');
    pokemonDetailBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <h3>Cargando información de ${pokeBase.nombre}...</h3>
        </div>
    `;

    try {
        const promesasHabilidades = (pokeBase.abilitiesRaw || []).map(async (item) => {
            const respHab = await fetch(item.ability.url);
            if (!respHab.ok) return { nombre: item.ability.name, efecto: '' };
            const dataHab = await respHab.json();

            const nombreEs = dataHab.names?.find((n) => n.language.name === 'es')?.name || item.ability.name;
            const flavorEs =
                dataHab.flavor_text_entries?.find((f) => f.language.name === 'es')?.flavor_text ||
                dataHab.flavor_text_entries?.find((f) => f.language.name === 'en')?.flavor_text ||
                '';

            return {
                nombre: nombreEs,
                esOculta: item.is_hidden,
                efecto: flavorEs.replace(/[\f\n\r]+/g, ' ')
            };
        });

        let evoluciones = pokeBase.evoluciones || [];
        if (evoluciones.length === 0 && pokeBase.evolutionChainUrl) {
            const respEvo = await fetch(pokeBase.evolutionChainUrl);
            if (respEvo.ok) {
                const dataEvo = await respEvo.json();
                evoluciones = recorrerCadenaEvolutiva(dataEvo.chain);
            }
        }

        const habilidadesDetalladas = await Promise.all(promesasHabilidades);

        const tiposHtml = pokeBase.tipos.map((t) => `<span class="type-tag">${t}</span>`).join('');

        const habilidadesHtml = habilidadesDetalladas
            .map(
                (h) => `
                <div class="card-extra-box" style="margin-bottom: 0.5rem;">
                    <strong>${h.nombre}</strong> ${h.esOculta ? '<span class="type-tag">Oculta</span>' : ''}
                    ${h.efecto ? `<p style="margin-top: 0.2rem; color: var(--text-secondary);">${h.efecto}</p>` : ''}
                </div>
            `
            )
            .join('');

        const statsHtml = pokeBase.stats
            .map((st) => {
                const pct = Math.min(100, Math.round((st.valor / 180) * 100));
                return `
                    <div class="stat-row">
                        <span style="text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">${st.nombre}</span>
                        <strong>${st.valor}</strong>
                        <div class="stat-bar-bg">
                            <div class="stat-bar-fill" style="width: ${pct}%;"></div>
                        </div>
                    </div>
                `;
            })
            .join('');

        const evolucionesHtml =
            evoluciones.length > 0
                ? evoluciones
                      .map(
                          (ev) => `
                        <button type="button" class="evo-item" data-evo-id="${ev.id}" style="cursor: pointer;">
                            <img src="${ev.imagen}" alt="${ev.nombre}" />
                            <div style="text-transform: capitalize; font-weight: 700; font-size: 0.85rem;">
                                #${ev.id} ${ev.nombre}
                            </div>
                        </button>
                    `
                      )
                      .join('<span style="color: var(--accent-primary); font-weight: 800;">➔</span>')
                : '<p style="color: var(--text-secondary);">No registra evoluciones.</p>';

        pokemonDetailBody.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
                <span class="badge-mode">#${String(pokeBase.id).padStart(3, '0')} · ${pokeBase.categoriaEspecie}</span>
                <button type="button" id="closePokeDetailBtn" class="btn btn-outline btn-sm">✕ Cerrar</button>
            </div>

            <div class="detail-grid">
                <div class="detail-artwork-box">
                    <img id="modalPokeArtwork" src="${pokeBase.imagen}" alt="${pokeBase.nombre}" class="detail-artwork" />
                    <div style="margin-top: 1rem; display: flex; justify-content: center; gap: 0.5rem;">
                        <button type="button" id="btnNormalSprite" class="btn btn-primary btn-sm">Normal</button>
                        ${
                            pokeBase.imagenShiny
                                ? `<button type="button" id="btnShinySprite" class="btn btn-outline btn-sm">✨ Shiny</button>`
                                : ''
                        }
                    </div>
                    <div class="card-extra-box" style="margin-top: 1.25rem; text-align: left;">
                        <p><strong>📏 Altura:</strong> ${pokeBase.alturaMetros} m</p>
                        <p><strong>⚖️ Peso:</strong> ${pokeBase.pesoKg} kg</p>
                        <p><strong>🌍 Hábitat:</strong> ${pokeBase.habitat}</p>
                        <p><strong>⭐ Exp. Base:</strong> ${pokeBase.experienciaBase}</p>
                    </div>
                </div>

                <div>
                    <div class="type-tags">${tiposHtml}</div>
                    <h2 class="hero-title" style="text-align: left; text-transform: capitalize; font-size: 2rem; margin-bottom: 0.6rem;">
                        ${pokeBase.nombre}
                    </h2>
                    <p style="color: var(--text-primary); margin-bottom: 1.25rem; background: rgba(15,23,42,0.55); padding: 0.9rem; border-radius: 10px; border: 1px solid var(--border-color);">
                        ${pokeBase.descripcion}
                    </p>

                    <h3 style="margin-bottom: 0.45rem; font-size: 1rem; color: var(--accent-primary);">Habilidades</h3>
                    <div style="margin-bottom: 1.25rem;">
                        ${habilidadesHtml}
                    </div>

                    <h3 style="margin-bottom: 0.45rem; font-size: 1rem; color: var(--accent-primary);">Estadísticas Base</h3>
                    <div class="stats-list" style="margin-bottom: 1.4rem;">
                        ${statsHtml}
                    </div>

                    <h3 style="margin-bottom: 0.45rem; font-size: 1rem; color: var(--accent-primary);">Cadena Evolutiva</h3>
                    <div class="evo-chain">
                        ${evolucionesHtml}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('closePokeDetailBtn').addEventListener('click', () => {
            pokemonDetailModal.classList.remove('active');
        });

        const imgEl = document.getElementById('modalPokeArtwork');
        const btnNormal = document.getElementById('btnNormalSprite');
        const btnShiny = document.getElementById('btnShinySprite');
        if (btnNormal && btnShiny) {
            btnNormal.addEventListener('click', () => {
                imgEl.src = pokeBase.imagen;
                btnNormal.className = 'btn btn-primary btn-sm';
                btnShiny.className = 'btn btn-outline btn-sm';
            });
            btnShiny.addEventListener('click', () => {
                imgEl.src = pokeBase.imagenShiny;
                btnShiny.className = 'btn btn-primary btn-sm';
                btnNormal.className = 'btn btn-outline btn-sm';
            });
        }

        // Permitir cambiar de evolución dentro del mismo modal sin cambiar de página
        pokemonDetailBody.querySelectorAll('[data-evo-id]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const idEvo = btn.getAttribute('data-evo-id');
                const existente = catalogoPokemon.find((p) => String(p.id) === String(idEvo));
                if (existente) {
                    mostrarDetalleEnMismaPagina(existente);
                } else {
                    const cargado = await obtenerPokemonConTresEndpoints(idEvo);
                    mostrarDetalleEnMismaPagina(cargado);
                }
            });
        });
    } catch (err) {
        pokemonDetailBody.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3>No se pudo cargar el detalle</h3>
                <p>${err.message}</p>
                <button type="button" class="btn btn-primary" onclick="document.getElementById('pokemonDetailModal').classList.remove('active')">Cerrar</button>
            </div>
        `;
    }
}

async function ejecutarBusquedaPokemon(termino) {
    const query = termino.trim().toLowerCase();

    if (!query) {
        renderizarTarjetasPokemon(catalogoPokemon);
        delayStatusBadge.textContent = '⏱️ Búsqueda con espera de 4s';
        return;
    }

    const coincidenciasLocales = catalogoPokemon.filter(
        (p) =>
            p.nombre.toLowerCase().includes(query) ||
            String(p.id) === query ||
            p.tipos.some((t) => t.toLowerCase().includes(query))
    );

    if (coincidenciasLocales.length > 0) {
        renderizarTarjetasPokemon(coincidenciasLocales);
        delayStatusBadge.textContent = `✅ Resultados para "${termino}"`;
        return;
    }

    pokemonGrid.innerHTML = `
        <div class="empty-state">
            <h3>Buscando "${termino}"...</h3>
        </div>
    `;

    try {
        const nuevoPoke = await obtenerPokemonConTresEndpoints(query);
        renderizarTarjetasPokemon([nuevoPoke]);
        delayStatusBadge.textContent = `✅ Encontrado: "${nuevoPoke.nombre}"`;
    } catch {
        renderizarTarjetasPokemon([]);
        delayStatusBadge.textContent = `⚠️ Sin resultados para "${termino}"`;
    }
}

function manejarInputConDelayDe4Segundos() {
    const termino = pokemonSearchInput.value;
    clearPokeSearchBtn.style.display = termino.length > 0 ? 'inline-block' : 'none';

    if (timeoutBusqueda) clearTimeout(timeoutBusqueda);
    if (intervaloCuentaRegresiva) clearInterval(intervaloCuentaRegresiva);

    const inicio = Date.now();
    delayProgressContainer.classList.add('active');
    delayProgressBar.style.width = '0%';

    intervaloCuentaRegresiva = setInterval(() => {
        const transcurrido = Date.now() - inicio;
        const restante = Math.max(0, (SEARCH_DELAY_MS - transcurrido) / 1000);
        const porcentaje = Math.min(100, (transcurrido / SEARCH_DELAY_MS) * 100);

        delayProgressBar.style.width = `${porcentaje}%`;
        delayStatusBadge.textContent = `⏳ Buscando en ${restante.toFixed(1)}s...`;
    }, 100);

    timeoutBusqueda = setTimeout(() => {
        clearInterval(intervaloCuentaRegresiva);
        delayProgressContainer.classList.remove('active');
        delayProgressBar.style.width = '0%';
        ejecutarBusquedaPokemon(termino);
    }, SEARCH_DELAY_MS);
}

pokemonSearchInput.addEventListener('input', manejarInputConDelayDe4Segundos);

clearPokeSearchBtn.addEventListener('click', () => {
    if (timeoutBusqueda) clearTimeout(timeoutBusqueda);
    if (intervaloCuentaRegresiva) clearInterval(intervaloCuentaRegresiva);
    delayProgressContainer.classList.remove('active');
    pokemonSearchInput.value = '';
    clearPokeSearchBtn.style.display = 'none';
    delayStatusBadge.textContent = '⏱️ Búsqueda con espera de 4s';
    renderizarTarjetasPokemon(catalogoPokemon);
});

pokemonDetailModal.addEventListener('click', (e) => {
    if (e.target === pokemonDetailModal) {
        pokemonDetailModal.classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', cargarCatalogoInicial);
