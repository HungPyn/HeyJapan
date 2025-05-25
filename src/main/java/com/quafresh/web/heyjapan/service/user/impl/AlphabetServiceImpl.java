package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.entity.Alphabets;
import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.repository.AlphabetsRepository;
import com.quafresh.web.heyjapan.repository.TopicRepository;
import com.quafresh.web.heyjapan.service.user.AlphabetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class AlphabetServiceImpl implements AlphabetService {
    private final AlphabetsRepository alphabetsRepository;
    private final TopicRepository topicRepository;
    @Override
    public List<Alphabets> getAllByTopicID(Integer topicID) {
        Topic topic = topicRepository.findById(topicID).get();
        return alphabetsRepository.findAllByTopic(topic);
    }

    @Override
    public void createNew(Alphabets alphabets) {
        alphabetsRepository.save(alphabets);
    }

    @Override
    public void updateAlphabetById(Integer id, Alphabets alphabets) {
        Alphabets alphabets1 = alphabetsRepository.findById(id).get();
        alphabets1.setAlphabetCharacter(alphabets.getAlphabetCharacter());
        alphabets1.setPronunciations(alphabets.getPronunciations());
        alphabets1.setAlphabetType(alphabets.getAlphabetType());
        alphabets1.setUrlAudio(alphabets.getUrlAudio());
        alphabetsRepository.save(alphabets1);
    }

    @Override
    public void deleteAlphabet(Integer id) {
        alphabetsRepository.deleteById(id);
    }
}
