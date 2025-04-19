package com.example.nutrition_analyser.Service;

import com.example.nutrition_analyser.Model.ScanRecord;

import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

import java.util.HashMap;
import java.util.Map;

@Service
public class ScanStorageService {

    private final DynamoDbClient dynamoDbClient;
    private final String tableName = "barcode-scan-data";

    public ScanStorageService(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }

    public void saveScanRecord(ScanRecord record) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("barcode", AttributeValue.builder().s(record.getBarcode()).build());
        item.put("timestamp", AttributeValue.builder().s(record.getTimestamp()).build());

        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(item)
                .build();

        dynamoDbClient.putItem(request);
    }
}
