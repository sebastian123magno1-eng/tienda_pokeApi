package com.crud.tienda.service;

// Importamos el modelo y el repositorio de las otras carpetas
import com.crud.tienda.model.Producto;
import com.crud.tienda.repository.ProductoRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service // Marca esta clase como el "cerebro" que procesa las operaciones antes de ir a la BD
public class ProductoService {

    @Autowired // "Inyección de dependencias": trae el Repositorio listo para usarse sin hacer "new"
    private ProductoRepository repositorio;

    @PostConstruct
    public void inicializarDatos() {
        try {
            List<Producto> productosIniciales = List.of(
                new Producto(
                    "Teclado Mecánico RGB Pro",
                    89.99,
                    "Teclado compacto 75% con switches rojos silenciosos.",
                    "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop&q=80",
                    "Periféricos"
                ),
                new Producto(
                    "Monitor Curvo UltraWide 34\"",
                    459.50,
                    "Monitor gaming WQHD con tasa de refresco de 165Hz, tiempo de respuesta de 1ms, tecnología FreeSync Premium y panel IPS con cobertura del 99% sRGB ideal para diseño, programación multitarea y sesiones intensas de juego sin fatiga visual.",
                    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
                    "Monitores"
                ),
                new Producto(
                    "Auriculares Inalámbricos ANC",
                    129.00,
                    "Cancelación activa de ruido híbrida con hasta 40 horas de batería continua y carga rápida por USB-C.",
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
                    "Audio"
                ),
                new Producto(
                    "Mouse Gamer Ultraligero",
                    54.90,
                    "Sensor óptico de 26,000 DPI y solo 58g de peso.",
                    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
                    "Periféricos"
                ),
                new Producto(
                    "Silla Ergonómica Ejecutiva Mesh",
                    299.99,
                    "Diseñada con soporte lumbar dinámico adaptable, reposabrazos 4D, cabecero ajustable en altura y ángulo, malla transpirable de alta resistencia y base de aluminio reforzado para jornadas de más de 10 horas.",
                    "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&auto=format&fit=crop&q=80",
                    "Mobiliario"
                ),
                new Producto(
                    "Cámara Web 4K Streaming",
                    115.00,
                    "Lente Sony STARVIS con enfoque automático por IA, doble micrófono con reducción de ruido y corrección de luz automática.",
                    "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&auto=format&fit=crop&q=80",
                    "Accesorios"
                )
            );

            List<Producto> actuales = repositorio.findAll();
            // Completar descripción/imagen si había productos previos incompletos
            for (int i = 0; i < actuales.size(); i++) {
                Producto prod = actuales.get(i);
                Producto plantilla = productosIniciales.get(i % productosIniciales.size());
                boolean modificado = false;
                if (prod.getDescripcion() == null || prod.getDescripcion().isBlank()) {
                    prod.setDescripcion(plantilla.getDescripcion());
                    modificado = true;
                }
                if (prod.getImagen() == null || prod.getImagen().isBlank()) {
                    prod.setImagen(plantilla.getImagen());
                    modificado = true;
                }
                if (prod.getCategoria() == null || prod.getCategoria().isBlank()) {
                    prod.setCategoria(plantilla.getCategoria());
                    modificado = true;
                }
                if (modificado) {
                    repositorio.save(prod);
                }
            }

            // Si hay menos de 6 productos al inicio, crear los que faltan hasta tener los 6
            if (actuales.size() < 6) {
                for (int i = actuales.size(); i < 6; i++) {
                    repositorio.save(productosIniciales.get(i));
                }
            }
        } catch (Exception ignored) {
            // Si la base de datos aún no está disponible al iniciar
        }
    }

    // 1. Función para LEER todos los productos
    public List<Producto> obtenerTodos() {
        return repositorio.findAll(); // findAll() hace un: SELECT * FROM productos
    }

    // 2. Función para GUARDAR un producto nuevo
    public Producto guardar(Producto producto) {
        return repositorio.save(producto); // save() hace un: INSERT INTO productos...
    }

    // 3. Función para ACTUALIZAR un producto existente buscando por su ID
    public Producto actualizar(Long id, Producto datosNuevos) {
        // Busca el producto en la BD por su ID; si no existe, lanza un error (.orElseThrow)
        Producto existente = repositorio.findById(id).orElseThrow();
        // Cambia el nombre viejo por el nombre nuevo
        existente.setNombre(datosNuevos.getNombre());
        // Cambia el precio viejo por el precio nuevo
        existente.setPrecio(datosNuevos.getPrecio());
        if (datosNuevos.getDescripcion() != null) {
            existente.setDescripcion(datosNuevos.getDescripcion());
        }
        if (datosNuevos.getImagen() != null) {
            existente.setImagen(datosNuevos.getImagen());
        }
        if (datosNuevos.getCategoria() != null) {
            existente.setCategoria(datosNuevos.getCategoria());
        }
        // Guarda los cambios en la BD (como ya tiene ID, save() hace un UPDATE en lugar de INSERT)
        return repositorio.save(existente);
    }

    // 4. Función para ELIMINAR un producto por su ID
    public void eliminar(Long id) {
        repositorio.deleteById(id); // deleteById() hace un: DELETE FROM productos WHERE id = ?
    }
}