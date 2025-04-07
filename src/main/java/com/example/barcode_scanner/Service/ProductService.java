package com.example.barcode_scanner.Service;

import com.example.barcode_scanner.Model.Product;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProductService {

    private final ExternalFoodDataService externalFoodDataService;

    public ProductService(ExternalFoodDataService externalFoodDataService) {
        this.externalFoodDataService = externalFoodDataService;
    }

    public Optional<Product> findProduct(String barcode) {
        Product product = externalFoodDataService.getProductByBarcode(barcode);
        return Optional.ofNullable(product);
    }
}
