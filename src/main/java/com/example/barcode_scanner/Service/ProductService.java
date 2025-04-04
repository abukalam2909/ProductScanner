package com.example.barcode_scanner.Service;

import com.example.barcode_scanner.Model.Product;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductService {
    private final Map<String, Product> productDatabase = new HashMap<>();
    
    public ProductService() {
        // Initialize sample products
        productDatabase.put("9310199014445",
            new Product("9310199014445", "Organic Apples", "FreshCo", 95, 0.5));
        productDatabase.put("234567890123", 
            new Product("234567890123", "Whole Grain Bread", "BakeryDirect", 120, 4.0));
    }
    
    public Optional<Product> findProduct(String barcode) {
        return Optional.ofNullable(productDatabase.get(barcode));
    }
}