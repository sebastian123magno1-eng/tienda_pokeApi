const API_BASE_URL = window.location.port === '8080'
    ? '/api/productos'
    : 'http://localhost:8080/api/productos';

const STORAGE_KEY = 'tienda_productos_vanilla_v1';

const PRODUCTOS_INICIALES = [
    {
        id: 1,
        nombre: 'Teclado Mecánico RGB Pro 75%',
        precio: 89.99,
        categoria: 'Periféricos',
        imagen: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop&q=80',
        descripcion: 'Teclado compacto con switches rojos lineales silenciosos.'
    },
    {
        id: 2,
        nombre: 'Monitor Curvo UltraWide 34"',
        precio: 459.50,
        categoria: 'Monitores',
        imagen: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
        descripcion: 'Monitor gaming WQHD con tasa de refresco de 165Hz, tiempo de respuesta de 1ms, tecnología FreeSync Premium y panel IPS con cobertura del 99% sRGB ideal para diseño gráfico, programación multitarea a pantalla dividida y sesiones intensas de juego sin fatiga visual.'
    },
    {
        id: 3,
        nombre: 'Auriculares Inalámbricos Studio ANC',
        precio: 129.00,
        categoria: 'Audio',
        imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        descripcion: 'Cancelación activa de ruido híbrida con hasta 40 horas de autonomía continua, audio espacial de alta fidelidad y carga rápida mediante puerto USB-C.'
    },
    {
        id: 4,
        nombre: 'Mouse Gamer Ultraligero Pro',
        precio: 54.90,
        categoria: 'Periféricos',
        imagen: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
        descripcion: 'Sensor óptico de 26,000 DPI y chasis de solo 58g.'
    },
    {
        id: 5,
        nombre: 'Silla Ergonómica Ejecutiva Mesh',
        precio: 299.99,
        categoria: 'Mobiliario',
        imagen: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&auto=format&fit=crop&q=80',
        descripcion: 'Diseñada con soporte lumbar dinámico adaptable, reposabrazos 4D, cabecero ajustable en altura y ángulo, malla transpirable de alta resistencia y base de aluminio reforzado para brindar comodidad durante jornadas superiores a 10 horas.'
    },
    {
        id: 6,
        nombre: 'Cámara Web 4K Ultra HD Streaming',
        precio: 115.00,
        categoria: 'Accesorios',
        imagen: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&auto=format&fit=crop&q=80',
        descripcion: 'Lente Sony STARVIS con enfoque automático por inteligencia artificial, doble micrófono omnidireccional con reducción de ruido y corrección de iluminación HDR.'
    }
];

let listaProductos = [];
let productoActualEnVista = null;

const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const resultsCount = document.getElementById('resultsCount');

// Botones debajo del buscador
const openCreateModalBtn = document.getElementById('openCreateModalBtn');
const openEditSelectorBtn = document.getElementById('openEditSelectorBtn');

// Modal de formulario (Crear / Modificar)
const formModal = document.getElementById('formModal');
const formModalTitle = document.getElementById('formModalTitle');
const closeFormModalBtn = document.getElementById('closeFormModalBtn');
const cancelFormModalBtn = document.getElementById('cancelFormModalBtn');
const selectProductToEditBox = document.getElementById('selectProductToEditBox');
const selectProductToEdit = document.getElementById('selectProductToEdit');
const productForm = document.getElementById('productForm');
const prodIdInput = document.getElementById('prodId');
const prodNombreInput = document.getElementById('prodNombre');
const prodPrecioInput = document.getElementById('prodPrecio');
const prodCategoriaInput = document.getElementById('prodCategoria');
const prodImagenInput = document.getElementById('prodImagen');
const prodDescripcionInput = document.getElementById('prodDescripcion');
const submitFormBtn = document.getElementById('submitFormBtn');

// Modal de Ver Producto (al aplastar la tarjeta)
const productModal = document.getElementById('productModal');
const modalImg = document.getElementById('modalImg');
const modalCategory = document.getElementById('modalCategory');
const modalPrice = document.getElementById('modalPrice');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalEditBtn = document.getElementById('modalEditBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

function guardarRespaldoLocal() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(listaProductos));
    } catch {
        // Ignorar si localStorage no está disponible
    }
}

async function cargarProductos() {
    try {
        const respuesta = await fetch(API_BASE_URL);
        if (!respuesta.ok) throw new Error('Backend no disponible');
        let datos = await respuesta.json();

        if (Array.isArray(datos) && datos.length < 6) {
            for (let i = datos.length; i < 6; i++) {
                const prodSemilla = { ...PRODUCTOS_INICIALES[i] };
                delete prodSemilla.id;
                const respPost = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(prodSemilla)
                });
                if (respPost.ok) {
                    const creado = await respPost.json();
                    datos.push(creado);
                }
            }
        }

        if (Array.isArray(datos) && datos.length > 0) {
            listaProductos = datos.map((item, idx) => {
                const fallback = PRODUCTOS_INICIALES[idx % PRODUCTOS_INICIALES.length];
                return {
                    id: item.id,
                    nombre: item.nombre || fallback.nombre,
                    precio: item.precio ?? fallback.precio,
                    descripcion: item.descripcion || fallback.descripcion,
                    imagen: item.imagen || fallback.imagen,
                    categoria: item.categoria || fallback.categoria
                };
            });
            guardarRespaldoLocal();
        } else {
            listaProductos = PRODUCTOS_INICIALES.map((p) => ({ ...p }));
            guardarRespaldoLocal();
        }
    } catch {
        const guardado = localStorage.getItem(STORAGE_KEY);
        if (guardado) {
            try {
                const parseado = JSON.parse(guardado);
                if (Array.isArray(parseado) && parseado.length > 0) {
                    listaProductos = parseado;
                } else {
                    listaProductos = PRODUCTOS_INICIALES.map((p) => ({ ...p }));
                }
            } catch {
                listaProductos = PRODUCTOS_INICIALES.map((p) => ({ ...p }));
            }
        } else {
            listaProductos = PRODUCTOS_INICIALES.map((p) => ({ ...p }));
            guardarRespaldoLocal();
        }
    }

    renderizarProductos(listaProductos);
}

function renderizarProductos(productos) {
    productsGrid.innerHTML = '';

    resultsCount.textContent = `${productos.length} producto${productos.length === 1 ? '' : 's'}`;

    if (productos.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <h3>No se encontraron productos</h3>
                <p>Intenta con otro término en el buscador.</p>
            </div>
        `;
        return;
    }

    productos.forEach((producto) => {
        const article = document.createElement('article');
        article.className = 'card clickable-card';
        article.title = 'Haz clic para ver el detalle del producto';

        const precioFormateado = Number(producto.precio || 0).toLocaleString('es-CO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        article.innerHTML = `
            <div class="card-image-container">
                <img
                    src="${producto.imagen || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'}"
                    alt="${producto.nombre}"
                    class="card-image"
                    loading="lazy"
                />
                <span class="card-badge">${producto.categoria || 'General'}</span>
            </div>
            <div class="card-body">
                <h2 class="card-title">${producto.nombre}</h2>
                <p class="card-description">${producto.descripcion}</p>
                <div class="card-footer">
                    <span class="card-price">$${precioFormateado}</span>
                    <div class="card-actions">
                        <button type="button" class="btn btn-warning btn-sm" data-edit-id="${producto.id}">
                            ✏️ Modificar
                        </button>
                        <button type="button" class="btn btn-danger btn-sm" data-delete-id="${producto.id}">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Al aplastar cualquier parte de la tarjeta se abre el detalle ahí mismo
        article.addEventListener('click', () => verProducto(producto));

        // Los botones Modificar y Eliminar detienen la propagación para no abrir el modal de vista
        article.querySelector('[data-edit-id]').addEventListener('click', (e) => {
            e.stopPropagation();
            abrirModalModificar(producto);
        });

        article.querySelector('[data-delete-id]').addEventListener('click', (e) => {
            e.stopPropagation();
            eliminarProducto(producto.id);
        });

        productsGrid.appendChild(article);
    });
}

function verProducto(producto) {
    productoActualEnVista = producto;
    const precioFormateado = Number(producto.precio || 0).toLocaleString('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    modalImg.src = producto.imagen || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
    modalImg.alt = producto.nombre;
    modalCategory.textContent = producto.categoria || 'General';
    modalPrice.textContent = `$${precioFormateado}`;
    modalTitle.textContent = producto.nombre;
    modalDesc.textContent = producto.descripcion;

    productModal.classList.add('active');
}

function rellenarCamposFormulario(producto) {
    prodIdInput.value = producto.id;
    prodNombreInput.value = producto.nombre;
    prodPrecioInput.value = producto.precio;
    prodCategoriaInput.value = producto.categoria || 'General';
    prodImagenInput.value = producto.imagen || '';
    prodDescripcionInput.value = producto.descripcion || '';
}

function abrirModalCrear() {
    productForm.reset();
    prodIdInput.value = '';
    selectProductToEditBox.style.display = 'none';
    formModalTitle.textContent = '➕ Crear Nuevo Producto';
    submitFormBtn.textContent = 'Crear Producto';
    formModal.classList.add('active');
    prodNombreInput.focus();
}

function abrirModalModificar(producto = null) {
    if (listaProductos.length === 0) return;

    // Llenar el selector desplegable con todos los productos disponibles
    selectProductToEdit.innerHTML = listaProductos
        .map((p) => `<option value="${p.id}">${p.nombre} ($${Number(p.precio || 0).toFixed(2)})</option>`)
        .join('');

    const objetivo = producto || listaProductos[0];
    selectProductToEdit.value = String(objetivo.id);
    selectProductToEditBox.style.display = 'block';

    rellenarCamposFormulario(objetivo);
    formModalTitle.textContent = '✏️ Modificar Producto';
    submitFormBtn.textContent = 'Guardar Cambios';
    formModal.classList.add('active');
    prodNombreInput.focus();
}

function cerrarModalFormulario() {
    formModal.classList.remove('active');
    productForm.reset();
    prodIdInput.value = '';
}

async function guardarOModificarProducto(evento) {
    evento.preventDefault();

    const idExistente = prodIdInput.value ? Number(prodIdInput.value) : null;

    const datosProducto = {
        nombre: prodNombreInput.value.trim(),
        precio: parseFloat(prodPrecioInput.value),
        categoria: prodCategoriaInput.value.trim(),
        imagen: prodImagenInput.value.trim() ||
            'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80',
        descripcion: prodDescripcionInput.value.trim()
    };

    if (idExistente) {
        try {
            const resp = await fetch(`${API_BASE_URL}/${idExistente}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosProducto)
            });
            if (resp.ok) {
                const actualizado = await resp.json();
                listaProductos = listaProductos.map((p) => (p.id === idExistente ? actualizado : p));
            } else {
                throw new Error('Actualizar en modo local');
            }
        } catch {
            listaProductos = listaProductos.map((p) =>
                p.id === idExistente ? { ...p, ...datosProducto, id: idExistente } : p
            );
        }
    } else {
        try {
            const resp = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosProducto)
            });
            if (resp.ok) {
                const guardado = await resp.json();
                listaProductos.unshift(guardado);
            } else {
                throw new Error('Crear en modo local');
            }
        } catch {
            datosProducto.id = Date.now();
            listaProductos.unshift(datosProducto);
        }
    }

    guardarRespaldoLocal();
    cerrarModalFormulario();
    filtrarProductosInstantaneo();
}

async function eliminarProducto(id) {
    try {
        await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    } catch {
        // Modo local
    }
    listaProductos = listaProductos.filter((p) => p.id !== id);
    guardarRespaldoLocal();
    filtrarProductosInstantaneo();
}

function filtrarProductosInstantaneo() {
    const termino = searchInput.value.trim().toLowerCase();
    clearSearchBtn.style.display = termino.length > 0 ? 'inline-block' : 'none';

    if (!termino) {
        renderizarProductos(listaProductos);
        return;
    }

    const filtrados = listaProductos.filter((prod) => {
        const nombre = (prod.nombre || '').toLowerCase();
        const descripcion = (prod.descripcion || '').toLowerCase();
        const categoria = (prod.categoria || '').toLowerCase();
        return (
            nombre.includes(termino) ||
            descripcion.includes(termino) ||
            categoria.includes(termino)
        );
    });

    renderizarProductos(filtrados);
}

// Eventos de búsqueda instantánea
searchInput.addEventListener('input', filtrarProductosInstantaneo);

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    filtrarProductosInstantaneo();
    searchInput.focus();
});

// Eventos de los botones Crear y Modificar debajo de buscar
openCreateModalBtn.addEventListener('click', abrirModalCrear);
openEditSelectorBtn.addEventListener('click', () => abrirModalModificar());

selectProductToEdit.addEventListener('change', () => {
    const idSel = Number(selectProductToEdit.value);
    const encontrado = listaProductos.find((p) => p.id === idSel);
    if (encontrado) {
        rellenarCamposFormulario(encontrado);
    }
});

closeFormModalBtn.addEventListener('click', cerrarModalFormulario);
cancelFormModalBtn.addEventListener('click', cerrarModalFormulario);
formModal.addEventListener('click', (e) => {
    if (e.target === formModal) cerrarModalFormulario();
});

productForm.addEventListener('submit', guardarOModificarProducto);

// Eventos del modal de vista de producto
closeModalBtn.addEventListener('click', () => productModal.classList.remove('active'));
productModal.addEventListener('click', (e) => {
    if (e.target === productModal) productModal.classList.remove('active');
});

modalEditBtn.addEventListener('click', () => {
    productModal.classList.remove('active');
    if (productoActualEnVista) {
        abrirModalModificar(productoActualEnVista);
    }
});

document.addEventListener('DOMContentLoaded', cargarProductos);
