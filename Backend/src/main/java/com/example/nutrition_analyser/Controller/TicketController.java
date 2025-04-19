package com.example.nutrition_analyser.Controller;

import com.example.nutrition_analyser.Service.S3Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final S3Service s3Service;

    public TicketController(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadTicket(
            @RequestParam("barcode") String barcode,
            @RequestParam("barcodeImage") MultipartFile barcodeImage,
            @RequestParam("frontImage") MultipartFile frontImage
    ) {
        try {
            String barcodePath = s3Service.uploadImage(barcodeImage, "barcode", barcode);
            String frontPath = s3Service.uploadImage(frontImage, "front", barcode);
            return ResponseEntity.ok("Uploaded to: " + barcodePath + ", " + frontPath);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
