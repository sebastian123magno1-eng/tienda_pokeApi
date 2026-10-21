package com.crud.store.service;

import com.crud.store.model.Product;
import com.crud.store.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Business logic for products (CRUD operations and initial data seeding).
 */
@Service
public class ProductService {

    private static final int INITIAL_PRODUCT_COUNT = 6;

    @Autowired
    private ProductRepository repository;

    /**
     * Seeds the database with 6 sample products when it has fewer than 6 rows.
     */
    @PostConstruct
    public void seedInitialProducts() {
        try {
            List<Product> seed = List.of(
                new Product(
                    "RGB Mechanical Keyboard Pro",
                    89.99,
                    "Compact 75% keyboard with silent linear red switches.",
                    "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop&q=80",
                    "Peripherals"
                ),
                new Product(
                    "UltraWide Curved Monitor 34\"",
                    459.50,
                    "WQHD gaming monitor with a 165Hz refresh rate, 1ms response time, FreeSync Premium and an IPS panel covering 99% sRGB, ideal for graphic design, split-screen multitasking and long gaming sessions without eye strain.",
                    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
                    "Monitors"
                ),
                new Product(
                    "Studio ANC Wireless Headphones",
                    129.00,
                    "Hybrid active noise cancellation with up to 40 hours of battery life, high-fidelity spatial audio and fast USB-C charging.",
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
                    "Audio"
                ),
                new Product(
                    "Ultralight Gaming Mouse",
                    54.90,
                    "26,000 DPI optical sensor and a 58g chassis.",
                    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
                    "Peripherals"
                ),
                new Product(
                    "Executive Mesh Ergonomic Chair",
                    299.99,
                    "Designed with adaptive dynamic lumbar support, 4D armrests, a height and angle adjustable headrest, high-strength breathable mesh and a reinforced aluminum base for comfort during workdays longer than 10 hours.",
                    "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&auto=format&fit=crop&q=80",
                    "Furniture"
                ),
                new Product(
                    "4K Ultra HD Streaming Webcam",
                    115.00,
                    "Sony STARVIS lens with AI-powered autofocus, dual omnidirectional microphones with noise reduction and HDR light correction.",
                    "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&auto=format&fit=crop&q=80",
                    "Accessories"
                )
            );

            long current = repository.count();
            for (int i = (int) current; i < INITIAL_PRODUCT_COUNT; i++) {
                repository.save(seed.get(i));
            }
        } catch (Exception ignored) {
            // The database may not be available yet at startup.
        }
    }

    /** Returns every product (SELECT * FROM products). */
    public List<Product> findAll() {
        return repository.findAll();
    }

    /** Creates a new product (INSERT). */
    public Product create(Product product) {
        return repository.save(product);
    }

    /** Updates an existing product by id (UPDATE). */
    public Product update(Long id, Product newData) {
        Product existing = repository.findById(id).orElseThrow();
        existing.setName(newData.getName());
        existing.setPrice(newData.getPrice());
        if (newData.getDescription() != null) existing.setDescription(newData.getDescription());
        if (newData.getImage() != null) existing.setImage(newData.getImage());
        if (newData.getCategory() != null) existing.setCategory(newData.getCategory());
        return repository.save(existing);
    }

    /** Deletes a product by id (DELETE). */
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
