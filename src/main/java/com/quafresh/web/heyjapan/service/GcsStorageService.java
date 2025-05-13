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
    private Storage storage; // Bean được Spring Cloud GCP tự động cấu hình

    @Value("${gcp.storage.bucket-name}") // Lấy tên bucket từ application properties
    private String bucketName;

    /**
     * Upload file lên GCS
     *
     * @param inputStream Dữ liệu file dạng InputStream
     * @param objectName  Tên file mong muốn trên GCS (bao gồm cả đường dẫn nếu cần, vd: images/my-image.jpg)
     * @param contentType Loại nội dung (MIME type, vd: image/jpeg, audio/mpeg)
     * @return Trả về BlobInfo của file đã upload
     * @throws IOException Nếu có lỗi I/O
     */
    public BlobInfo uploadFile(InputStream inputStream, String objectName, String contentType) throws IOException {
        // Tạo thông tin về đối tượng (file) sẽ được lưu trên GCS
        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo.Builder blobInfoBuilder = BlobInfo.newBuilder(blobId).setContentType(contentType);

        // Thực hiện upload
        // storage.create(blobInfoBuilder.build(), inputStream); // Upload từ InputStream
        // Hoặc nếu bạn có byte array: storage.create(blobInfoBuilder.build(), fileBytes);

        // Upload và trả về thông tin chi tiết hơn
        Blob blob = storage.create(blobInfoBuilder.build(), inputStream);
        // Có thể thêm ACL để set quyền public read nếu cần ngay lúc tạo
        // storage.createAcl(blobId, Acl.of(Acl.User.ofAllUsers(), Acl.Role.READER));
        return blob.asBlobInfo(); // Trả về thông tin cơ bản
    }

    public BlobInfo uploadFileToPublicBucket(MultipartFile multipartFile, String objectName) throws IOException {
        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(multipartFile.getContentType())
                .build();

        try (InputStream inputStream = multipartFile.getInputStream()) {
            // Bỏ tùy chọn .predefinedAcl(Storage.PredefinedAcl.PUBLIC_READ)
            // File sẽ tự động public nếu bucket được cấu hình IAM cho allUsers là Storage Object Viewer
            Blob blob = storage.create(blobInfo, inputStream);
            return blob.asBlobInfo();
        }
    }
    /**
     * Upload file từ MultipartFile (thường dùng trong Controller)
     */
    public BlobInfo uploadFileFromMultipart(MultipartFile multipartFile, String objectName) throws IOException {
        try (InputStream inputStream = multipartFile.getInputStream()) {
            return uploadFile(inputStream, objectName, multipartFile.getContentType());
        }
    }


    /**
     * Lấy URL công khai của file (Bucket và file phải được set public read)
     *
     * @param objectName Tên file trên GCS
     * @return URL công khai (vd: https://storage.googleapis.com/bucket-name/object-name)
     */
    public String getPublicFileUrl(String objectName) {
        return String.format("https://storage.googleapis.com/%s/%s", bucketName, objectName);
    }

    /**
     * Tạo URL có chữ ký (Signed URL) để truy cập tạm thời vào file private
     *
     * @param objectName Tên file trên GCS
     * @param duration   Thời gian hiệu lực của URL
     * @param timeUnit   Đơn vị thời gian (vd: TimeUnit.MINUTES)
     * @return URL có chữ ký
     */
    public URL generateSignedUrl(String objectName, long duration, TimeUnit timeUnit) throws StorageException {
        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = storage.get(blobId); // Cần BlobInfo để tạo signed URL
        if (blobInfo == null) {
            throw new StorageException(404, "File not found: " + objectName);
        }

        // Tạo Signed URL với quyền đọc (HTTP GET)
        return storage.signUrl(blobInfo, duration, timeUnit, Storage.SignUrlOption.httpMethod(HttpMethod.GET), Storage.SignUrlOption.withV4Signature());
    }

    /**
     * Xóa file khỏi GCS
     * @param objectName Tên file trên GCS
     * @return true nếu xóa thành công, false nếu file không tồn tại
     */
    public boolean deleteFile(String objectName) throws StorageException {
        BlobId blobId = BlobId.of(bucketName, objectName);
        return storage.delete(blobId);
    }
}