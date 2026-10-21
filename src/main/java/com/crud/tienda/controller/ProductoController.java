package com.crud.tienda.controller;

import com.crud.tienda.model.Producto;
import com.crud.tienda.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController // Indica que esta clase recibe peticiones web y responde datos en formato JSON
@RequestMapping("/api/productos") // Define la dirección URL base: http://localhost:8080/api/productos
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired // Conecta este controlador con el Servicio (carpeta service)
    private ProductoService servicio;

    @GetMapping
    public List<Producto> listar() {
        return servicio.obtenerTodos(); // Devuelve la lista de productos en JSON
    }

    @PostMapping
    public Producto crear(@RequestBody Producto producto) {
        // @RequestBody toma el JSON que envías desde Postman o Fetch y lo transforma en un objeto Java
        return servicio.guardar(producto);
    }

    @PutMapping("/{id}")
    public Producto editar(@PathVariable Long id, @RequestBody Producto producto) {
        // @PathVariable captura el número que pongas al final de la URL (ej. el /1)
        // @RequestBody captura el JSON con los datos nuevos para reemplazarlos
        return servicio.actualizar(id, producto);
    }

    // ENDPOINT 4: ELIMINAR (Método DELETE -> http://localhost:8080/api/productos/1)
    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Long id) {
        // Toma el ID de la URL y le ordena al servicio borrarlo de la base de datos
        servicio.eliminar(id);
    }
}