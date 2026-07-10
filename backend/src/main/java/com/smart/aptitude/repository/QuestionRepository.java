package com.smart.aptitude.repository;

import com.smart.aptitude.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByTestId(Long testId);
    List<Question> findByCategory(String category);
    List<Question> findByCategoryAndSubTopic(String category, String subTopic);
}
