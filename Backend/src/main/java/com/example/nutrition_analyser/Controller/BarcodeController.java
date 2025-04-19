package com.example.nutrition_analyser.Controller;

import com.example.nutrition_analyser.Model.Product;
import com.example.nutrition_analyser.Model.ScanRecord;
import com.example.nutrition_analyser.Model.ProductResponse;
import com.example.nutrition_analyser.Service.BarcodeService;
import com.example.nutrition_analyser.Service.HistoryService;
import com.example.nutrition_analyser.Service.ProductService;
import com.example.nutrition_analyser.Service.ScanStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.time.Instant;

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

}

//seperate controller for /history
@RestController
@RequestMapping("/api/history")
class ProductHistoryController {

    private final HistoryService historyService;
    private final ScanStorageService scanStorageService;

    private final List<Product> scannedProducts = new ArrayList<>();

    ProductHistoryController(HistoryService historyService, ScanStorageService scanStorageService) {
        this.historyService = historyService;
        this.scanStorageService = scanStorageService;
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
        for (Product product : scannedProducts) {
            ScanRecord record = new ScanRecord(product.getBarcode(), Instant.now().toString());
            scanStorageService.saveScanRecord(record);
        }
        scannedProducts.clear();
    }
}
