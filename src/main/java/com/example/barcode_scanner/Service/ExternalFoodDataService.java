package com.example.barcode_scanner.Service;

import com.example.barcode_scanner.Model.Product;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ExternalFoodDataService {

    private final RestTemplate restTemplate = new RestTemplate();

    public Product getProductByBarcode(String barcode) {
        try {
            String url = "https://world.openfoodfacts.org/api/v0/product/" + barcode + ".json";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                JSONObject jsonResponse = new JSONObject(response.getBody());
                // Check if the product exists in the API response
                if (jsonResponse.optInt("status", 0) == 1) {
                    JSONObject productJson = jsonResponse.getJSONObject("product");

                    // Extract product details
                    String productName = productJson.optString("product_name", "Unknown Product");
                    String brand = productJson.optString("brands", "Unknown Brand");

                    // Nutritional details
                    JSONObject nutriments = productJson.optJSONObject("nutriments");
                    int calories = nutriments != null ? nutriments.optInt("energy-kcal", 0) : 0;
                    double protein = nutriments != null ? nutriments.optDouble("proteins", 0.0) : 0.0;
                    double sugar = nutriments != null ? nutriments.optDouble("sugars", 0.0) : 0.0;

                    return new Product(barcode, productName, brand, calories, protein, sugar);
                } else {
                    System.out.println("Product not found in Open Food Facts for barcode: " + barcode);
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching product details: " + e.getMessage());
        }
        return null;
    }
}
