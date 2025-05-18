package com.quafresh.web.heyjapan.service; // Hoặc package phù hợp

import com.google.cloud.storage.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile; // Dùng nếu upload từ controller

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.concurrent.TimeUnit;

@Service
public class GcsStorageService {

    @Autowired
    private Storage storage;
    @Value("${gcp.storage.bucket-name}")
    private String bucketName;

    public BlobInfo uploadFile(InputStream inputStream, String objectName, String contentType) throws IOException {
        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo.Builder blobInfoBuilder = BlobInfo.newBuilder(blobId).setContentType(contentType);
        Blob blob = storage.create(blobInfoBuilder.build(), inputStream);
        return blob.asBlobInfo();
    }

    public BlobInfo uploadFileToPublicBucket(MultipartFile multipartFile, String objectName) throws IOException {
        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(multipartFile.getContentType())
                .build();

        try (InputStream inputStream = multipartFile.getInputStream()) {
            Blob blob = storage.create(blobInfo, inputStream);
            return blob.asBlobInfo();
        }
    }

    public BlobInfo uploadFileFromMultipart(MultipartFile multipartFile, String objectName) throws IOException {
        try (InputStream inputStream = multipartFile.getInputStream()) {
            return uploadFile(inputStream, objectName, multipartFile.getContentType());
        }
    }

    public String getPublicFileUrl(String objectName) {
        return String.format("https://storage.googleapis.com/%s/%s", bucketName, objectName);
    }
    public URL generateSignedUrl(String objectName, long duration, TimeUnit timeUnit) throws StorageException {
        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = storage.get(blobId);
        if (blobInfo == null) {
            throw new StorageException(404, "File not found: " + objectName);
        }
        return storage.signUrl(blobInfo, duration, timeUnit, Storage.SignUrlOption.httpMethod(HttpMethod.GET), Storage.SignUrlOption.withV4Signature());
    }

    public boolean deleteFile(String objectName) throws StorageException {
        BlobId blobId = BlobId.of(bucketName, objectName);
        return storage.delete(blobId);
    }
}