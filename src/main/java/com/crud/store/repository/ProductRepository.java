package com.crud.store.repository;

import com.crud.store.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Data access layer for products.
 * Extending JpaRepository provides findAll, findById, save, deleteById, etc.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
}
