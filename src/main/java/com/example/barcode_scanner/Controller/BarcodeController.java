package com.example.barcode_scanner.Controller;

import com.example.barcode_scanner.Model.Product;
import com.example.barcode_scanner.Model.ProductResponse;
import com.example.barcode_scanner.Service.BarcodeService;
import com.example.barcode_scanner.Service.HistoryService;
import com.example.barcode_scanner.Service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BarcodeController {

    private final BarcodeService barcodeService;
    private final ProductService productService;

    public BarcodeController(BarcodeService barcodeService, ProductService productService) {
        this.barcodeService = barcodeService;
        this.productService = productService;
    }

    @GetMapping("/products/{barcode}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable String barcode) {
        return productService.findProduct(barcode)
                .map(product -> ResponseEntity.ok(ProductResponse.success(product)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ProductResponse.error("Product not found", barcode)));
    }

    @PostMapping("/decode")
    public ResponseEntity<ProductResponse> decodeBarcode(@RequestBody Map<String, String> request) {
        try {
            String base64Image = request.get("image");
            String barcode = barcodeService.decodeBarcode(base64Image);
            return productService.findProduct(barcode)
                    .map(product -> ResponseEntity.ok(ProductResponse.success(product)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ProductResponse.error("Product not found", barcode)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

//seperate controller for /history
@RestController
@RequestMapping("/api/history")
class ProductHistoryController {

    private final HistoryService historyService;
    private final List<Product> scannedProducts = new ArrayList<>();

    ProductHistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @PostMapping
    public ResponseEntity<List<Product>> addProduct(@RequestBody Product product) {
        scannedProducts.add(product);
        if (scannedProducts.size() > 4) {
            scannedProducts.remove(0); // Keep only the last 4 items
        }
        return ResponseEntity.ok(scannedProducts);
    }

    @GetMapping
    public ResponseEntity<List<Product>> getHistory() {
        return ResponseEntity.ok(scannedProducts);
    }

    @GetMapping("/compare")
    public ResponseEntity<Map<String, Product>> compareHistory(){
        Map<String, Product> TopProducts = historyService.compare(scannedProducts);
        return ResponseEntity.ok(TopProducts);
    }

    @DeleteMapping("/clear")
    public void clearHistory() {
        scannedProducts.clear();
    }
}
