package com.example.barcode_scanner.Service;

import com.example.barcode_scanner.Model.Product;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HistoryService {
    public Map<String, Product> compare(List<Product> scannedProducts){
        Product maxProtein = null;
        Product minSugar = null;
        Map<String, Product> TopProducts = new HashMap<>();
        /* //more concise and declarative
        Product maxProtein = scannedProducts.stream()
                .filter(p -> p.getProtein() != null)
                .max((a, b) -> Double.compare(a.getProtein(), b.getProtein()))
                .orElse(null);
         */
        for(Product product : scannedProducts) {
            if (maxProtein == null || product.getProtein() > maxProtein.getProtein()) {
                maxProtein = product;
            }
            if (minSugar == null || product.getSugar() < minSugar.getSugar()) {
                minSugar = product;
            }
        }
        TopProducts.put("Max Protein", maxProtein);
        TopProducts.put("Min Sugar", minSugar);
        return TopProducts;
    }
}
