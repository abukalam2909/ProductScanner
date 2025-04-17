package com.example.nutrition_analyser.Model;

public class ProductResponse {
    private String status;
    private String message;
    private Product data;

    // Constructors
    public ProductResponse(String status, String message, Product data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    // Static factory methods
    public static ProductResponse success(Product product) {
        return new ProductResponse("success", null, product);
    }

    public static ProductResponse error(String message, String barcode) {
        return new ProductResponse("error", message, null);
    }

    // Getters
    public String getstatus() {
        return status;
    }
    public String getmessage() {
        return message;
    }
    public Product getdata() {
        return data;
    }
}
