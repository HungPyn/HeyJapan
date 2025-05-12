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
         * Câu hỏi xếp từ thành câu đúng (word order).
         * Ví dụ: Từ cho trước: "Tôi | giáo viên | là" → Đáp án đúng: "Tôi là giáo viên"
         */
        WORD_ORDER

}
