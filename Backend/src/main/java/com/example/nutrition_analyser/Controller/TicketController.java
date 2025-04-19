package com.example.nutrition_analyser.Controller;

import com.example.nutrition_analyser.Service.S3Service;
import com.example.nutrition_analyser.Service.SnsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final S3Service s3Service;
    private final SnsService snsService;

    public TicketController(S3Service s3Service, SnsService snsService) {
        this.s3Service = s3Service;
        this.snsService = snsService;
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

            // Notify admin via SNS
            snsService.notifyTicketUpload(barcode, barcodePath + ", " + frontPath);

            return ResponseEntity.ok("Uploaded to: " + barcodePath + ", " + frontPath);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
