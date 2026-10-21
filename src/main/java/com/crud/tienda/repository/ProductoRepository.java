package com.crud.tienda.repository;

import com.crud.tienda.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // <Producto, Long> significa: "Trabaja con la tabla Producto, cuya llave primaria (@Id) es de tipo Long".
    // "extends JpaRepository" nos hereda todos los métodos CRUD listos.
}