package com.quafresh.web.heyjapan.entity.enums;

public enum QuestionType {
        /**
         * Câu hỏi trắc nghiệm từ vựng có kèm hình ảnh.
         * Ví dụ: "Chọn hình đúng với từ 'りんご'" với 4 hình ảnh lựa chọn.
         */
        MULTIPLE_CHOICE_VOCAB_IMAGE,

        /**
         * Câu hỏi trắc nghiệm từ vựng chỉ có văn bản.
         * Ví dụ: "Chọn nghĩa đúng của từ '先生'" với các đáp án dạng chữ.
         */
        MULTIPLE_CHOICE_TEXT_ONLY,

        /**
         * Câu hỏi nghe âm thanh rồi chọn đáp án đúng.
         * Ví dụ: Nghe từ phát âm → chọn đáp án tương ứng bằng chữ hoặc hình.
         */
        AUDIO_CHOICE,

        /**
         * Câu hỏi điền vào chỗ trống trong câu.
         * Ví dụ: "Tôi ___ học sinh." → Đáp án: "là"
         */
        FILL_IN_THE_BLANK,

        /**
         * Câu hỏi nối từ (matching) giữa hai cột (ví dụ tiếng Nhật và nghĩa tiếng Việt).
         * Ví dụ: nối "水" với "nước", "火" với "lửa".
         */
        MATCHING,

        /**
         * Câu hỏi xếp từ thành câu đúng (word order).
         * Ví dụ: Từ cho trước: "Tôi | giáo viên | là" → Đáp án đúng: "Tôi là giáo viên"
         */
        WORD_ORDER

}
