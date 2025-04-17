package com.example.nutrition_analyser.Model;

public class Product {
    private String barcode;
    private String name;
    private String brand;
    private int calories;
    private double protein;
    private double sugar;
    // Constructors
    public Product() {}

    public Product(String barcode, String name, String brand, int calories, double protein, double sugar ) {
        this.barcode = barcode;
        this.name = name;
        this.brand = brand;
        this.calories = calories;
        this.protein = protein;
        this.sugar = sugar;
    }

    // Getters and Setters
    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public int getCalories() {
        return calories;
    }

    public void setCalories(int calories) {
        this.calories = calories;
    }

    public double getProtein() {
        return protein;
    }

    public void setProtein(double protein) {
        this.protein = protein;
    }

    public double getSugar() {
        return sugar;
    }

    public void setSugar(double sugar) {
        this.sugar = sugar;
    }
}
