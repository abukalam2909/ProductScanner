package com.example.nutrition_analyser.Model;

public class ScanRecord {
    private String barcode;
    private String timestamp;

    public ScanRecord() {}

    public ScanRecord(String barcode, String timestamp) {
        this.barcode = barcode;
        this.timestamp = timestamp;
    }

    // Getters
    public String getBarcode() {
        return barcode;
    }

    public String getTimestamp() {
        return timestamp;
    }

    // Setters
    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
