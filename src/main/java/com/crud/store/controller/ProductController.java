package com.crud.store.controller;

import com.crud.store.model.Product;
import com.crud.store.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for products. Base URL: http://localhost:8080/api/products
 */
@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService service;

    /** GET /api/products - list all products. */
    @GetMapping
    public List<Product> list() {
        return service.findAll();
    }

    /** POST /api/products - create a product from the JSON body. */
    @PostMapping
    public Product create(@RequestBody Product product) {
        return service.create(product);
    }

    /** PUT /api/products/{id} - update an existing product. */
    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product product) {
        return service.update(id, product);
    }

    /** DELETE /api/products/{id} - delete a product. */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
