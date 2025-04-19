package com.example.nutrition_analyser.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

@Service
public class SnsService {

    private final SnsClient snsClient;

    @Value("${aws.sns.topic.arn}")
    private String snsTopicArn;

    public SnsService() {
        this.snsClient = SnsClient.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    public void notifyTicketUpload(String barcode, String fileName) {
        String message = "New Product Ticket Uploaded\n" +
                "Barcode: " + barcode + "\n" +
                "Image File: " + fileName;

        snsClient.publish(PublishRequest.builder()
                .topicArn(snsTopicArn)
                .message(message)
                .subject("New Product Ticket Submission")
                .build());
    }
}
