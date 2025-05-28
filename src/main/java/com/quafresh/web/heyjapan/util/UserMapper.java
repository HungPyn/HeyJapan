package com.quafresh.web.heyjapan.util;

import com.quafresh.web.heyjapan.dto.user.alphabet.ResponseAlphabetDTO;
import com.quafresh.web.heyjapan.dto.user.level.ResponseLevelDTO;
import com.quafresh.web.heyjapan.dto.user.question.*;
import com.quafresh.web.heyjapan.dto.user.theory.ResponseGrammarDTO;
import com.quafresh.web.heyjapan.dto.user.theory.ResponseVocabularyDTO;
import com.quafresh.web.heyjapan.dto.user.topic.ResponseTopicDTO;
import com.quafresh.web.heyjapan.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface  UserMapper {

    // Chuyển từ Level -> ResponseDTO
    @Mappings({
            @Mapping(source = "id", target ="id"),
            @Mapping(source = "name", target = "name")
    })
    ResponseLevelDTO toResponseLevelDTO(Level level);

    // Chuyển từ Topic -> ResponseTopicDTO
    @Mapping(source = "level.id",target = "levelId")
    ResponseTopicDTO toResponseTopicDTO(Topic topic);

    // Chuyển từ Grammar -> ResponseGrammarDTO
    ResponseGrammarDTO toResponseGrammarDTO(Grammar grammar);

    //Chuyển từ Vocabulary -> ResponseVocabularyDTO
    ResponseVocabularyDTO toVocabularyDTO(Vocabulary vocabulary);

    // Chuyển từ entity sang dto phần question
    ResponseExamQuestionDTO toResponseExamQuesDTO(ExamQuestion examQuestion);
    ResponseLessonQuesDTO toResponseLessonQuesDTO(LessonQuestion lessonQuestion);

    @Mapping(source = "lessonQuestion.id", target = "lessonQuestion")
    @Mapping(source = "examQuestion.id", target = "examQuestion")
    QuestionChoiceDTO toQuestionChoiceDTO(QuestionChoice questionChoice);

    //Chuyển từ Alphabet sang DTO alphabet
    ResponseAlphabetDTO toResponseAlphabetDTO(Alphabets alphabets);

}
