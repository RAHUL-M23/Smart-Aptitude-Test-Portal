package com.smart.aptitude.controller;

import com.smart.aptitude.model.Result;
import com.smart.aptitude.model.Question;
import com.smart.aptitude.repository.ResultRepository;
import com.smart.aptitude.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.core.type.TypeReference;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @GetMapping("/student/{userId}")
    public ResponseEntity<List<Result>> getStudentResults(@PathVariable Long userId) {
        List<Result> results = resultRepository.findByUser_IdOrderBySubmittedAtDesc(userId);
        
        // Clean user password fields in serialization context
        results.forEach(r -> {
            if (r.getUser() != null) {
                r.getUser().setPassword(null);
            }
        });
        
        return ResponseEntity.ok(results);
    }

    @GetMapping
    public ResponseEntity<List<Result>> getAllResults() {
        List<Result> results = resultRepository.findAllByOrderBySubmittedAtDesc();
        
        // Clean user password fields in serialization context
        results.forEach(r -> {
            if (r.getUser() != null) {
                r.getUser().setPassword(null);
            }
        });
        
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{resultId}/details")
    public ResponseEntity<?> getResultDetails(@PathVariable Long resultId) {
        Optional<Result> resultOpt = resultRepository.findById(resultId);
        if (resultOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Result record not found"));
        }
        Result result = resultOpt.get();
        
        // Clean password fields in serialization context
        if (result.getUser() != null) {
            result.getUser().setPassword(null);
        }

        // Load detailed questions and map them to the student's selected answers
        String selectedAnswersJson = result.getSelectedAnswers();
        Map<String, String> answersMap = new HashMap<>();
        if (selectedAnswersJson != null && !selectedAnswersJson.isBlank()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                answersMap = mapper.readValue(selectedAnswersJson, new TypeReference<Map<String, String>>() {});
            } catch (Exception e) {
                System.err.println("Error parsing selected answers JSON: " + e.getMessage());
            }
        }

        List<Map<String, Object>> questionBreakdown = new ArrayList<>();
        for (Map.Entry<String, String> entry : answersMap.entrySet()) {
            try {
                Long questionId = Long.parseLong(entry.getKey());
                String selectedAnswer = entry.getValue();

                Optional<Question> questionOpt = questionRepository.findById(questionId);
                if (questionOpt.isPresent()) {
                    Question q = questionOpt.get();
                    Map<String, Object> qMap = new HashMap<>();
                    qMap.put("questionId", q.getQuestionId());
                    qMap.put("questionText", q.getQuestionText());
                    qMap.put("optiona", q.getOptiona());
                    qMap.put("optionb", q.getOptionb());
                    qMap.put("optionc", q.getOptionc());
                    qMap.put("optiond", q.getOptiond());
                    qMap.put("correctAnswer", q.getCorrectAnswer());
                    qMap.put("selectedAnswer", selectedAnswer);
                    questionBreakdown.add(qMap);
                } else {
                    System.err.println("Question not found in DB for ID: " + questionId);
                }
            } catch (NumberFormatException e) {
                System.err.println("Invalid question ID format: " + entry.getKey());
            }
        }

        // Sort question breakdown list by question ID to ensure chronological layout order
        questionBreakdown.sort(Comparator.comparing(m -> (Long) m.get("questionId")));

        Map<String, Object> response = new HashMap<>();
        response.put("result", result);
        response.put("breakdown", questionBreakdown);

        return ResponseEntity.ok(response);
    }
}
