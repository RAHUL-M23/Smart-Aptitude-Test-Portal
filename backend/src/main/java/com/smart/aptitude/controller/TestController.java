package com.smart.aptitude.controller;

import com.smart.aptitude.model.Question;
import com.smart.aptitude.model.Result;
import com.smart.aptitude.model.Test;
import com.smart.aptitude.model.User;
import com.smart.aptitude.repository.QuestionRepository;
import com.smart.aptitude.repository.ResultRepository;
import com.smart.aptitude.repository.TestRepository;
import com.smart.aptitude.repository.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tests")
public class TestController {

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResultRepository resultRepository;

    @GetMapping
    public List<Test> getAllTests() {
        return testRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTestDetails(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        Optional<Test> testOpt = testRepository.findById(id);
        if (testOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Test not found"));
        }

        List<Question> questions = questionRepository.findByTestId(id);
        
        // Suffle the questions pool randomly (shuffling constraint)
        Collections.shuffle(questions);

        // Limit the assessment to a subset of 10 questions out of the 500+ questions pool
        int limit = testOpt.get().getTotalMarks() != null ? testOpt.get().getTotalMarks() : 10;
        List<Question> selectedQuestions = questions.stream()
                .limit(limit)
                .collect(Collectors.toList());

        // Strip correct answer from questions to prevent cheating
        List<Question> sanitizedQuestions = selectedQuestions.stream().map(q -> {
            Question sq = new Question();
            sq.setQuestionId(q.getQuestionId());
            sq.setQuestionText(q.getQuestionText());
            sq.setOptiona(q.getOptiona());
            sq.setOptionb(q.getOptionb());
            sq.setOptionc(q.getOptionc());
            sq.setOptiond(q.getOptiond());
            sq.setTestId(q.getTestId());
            sq.setCorrectAnswer(null); // Keep correctAnswer hidden for students
            return sq;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("test", testOpt.get());
        response.put("questions", sanitizedQuestions);

        return ResponseEntity.ok(response);
    }

    // Admin questions viewer endpoint with security constraint (role validation)
    @GetMapping("/admin/{id}/questions")
    public ResponseEntity<?> getAdminTestQuestions(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        // Constraint check: Role verification
        if (userRole == null || !userRole.equals("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin credentials required."));
        }

        Optional<Test> testOpt = testRepository.findById(id);
        if (testOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Test not found"));
        }

        List<Question> questions = questionRepository.findByTestId(id);
        
        // Return full details including correct answers for Admin view
        Map<String, Object> response = new HashMap<>();
        response.put("test", testOpt.get());
        response.put("questions", questions);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitTest(@PathVariable Long id, @RequestBody SubmissionRequest submission) {
        Optional<Test> testOpt = testRepository.findById(id);
        if (testOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Test not found"));
        }
        Test test = testOpt.get();

        Optional<User> userOpt = userRepository.findById(submission.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();

        Map<Long, String> userAnswers = submission.getAnswers();
        if (userAnswers == null || userAnswers.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Submitted answers cannot be empty"));
        }

        int correctAnswers = 0;
        int totalQuestions = userAnswers.size();

        // Calculate score by checking DB answers
        for (Map.Entry<Long, String> entry : userAnswers.entrySet()) {
            Optional<Question> qOpt = questionRepository.findById(entry.getKey());
            if (qOpt.isPresent()) {
                Question q = qOpt.get();
                if (entry.getValue() != null && entry.getValue().trim().equalsIgnoreCase(q.getCorrectAnswer().trim())) {
                    correctAnswers++;
                }
            }
        }

        double percentage = totalQuestions > 0 ? ((double) correctAnswers / totalQuestions) * 100.0 : 0.0;

        // Save result
        Result result = new Result();
        result.setUser(user);
        result.setTest(test);
        result.setScore(correctAnswers);
        result.setPercentage(percentage);
        result.setSubmittedAt(LocalDateTime.now());
        result.setTimeTaken(submission.getTimeTaken());

        Result savedResult = resultRepository.save(result);

        Map<String, Object> response = new HashMap<>();
        response.put("resultId", savedResult.getResultId());
        response.put("score", correctAnswers);
        response.put("totalQuestions", totalQuestions);
        response.put("percentage", percentage);
        response.put("submittedAt", savedResult.getSubmittedAt());
        response.put("timeTaken", savedResult.getTimeTaken());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/questions")
    public ResponseEntity<?> addQuestion(
            @RequestBody Question question,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        if (userRole == null || !userRole.equals("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin credentials required."));
        }

        if (question.getQuestionText() == null || question.getQuestionText().isBlank() ||
            question.getOptiona() == null || question.getOptiona().isBlank() ||
            question.getOptionb() == null || question.getOptionb().isBlank() ||
            question.getOptionc() == null || question.getOptionc().isBlank() ||
            question.getOptiond() == null || question.getOptiond().isBlank() ||
            question.getCorrectAnswer() == null || question.getCorrectAnswer().isBlank() ||
            question.getTestId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required."));
        }

        Question saved = questionRepository.save(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/admin/questions/{id}")
    public ResponseEntity<?> updateQuestion(
            @PathVariable Long id,
            @RequestBody Question questionDetails,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        if (userRole == null || !userRole.equals("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin credentials required."));
        }

        if (questionDetails.getQuestionText() == null || questionDetails.getQuestionText().isBlank() ||
            questionDetails.getOptiona() == null || questionDetails.getOptiona().isBlank() ||
            questionDetails.getOptionb() == null || questionDetails.getOptionb().isBlank() ||
            questionDetails.getOptionc() == null || questionDetails.getOptionc().isBlank() ||
            questionDetails.getOptiond() == null || questionDetails.getOptiond().isBlank() ||
            questionDetails.getCorrectAnswer() == null || questionDetails.getCorrectAnswer().isBlank() ||
            questionDetails.getTestId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required."));
        }

        Optional<Question> questionOpt = questionRepository.findById(id);
        if (questionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Question not found"));
        }

        Question question = questionOpt.get();
        question.setQuestionText(questionDetails.getQuestionText());
        question.setOptiona(questionDetails.getOptiona());
        question.setOptionb(questionDetails.getOptionb());
        question.setOptionc(questionDetails.getOptionc());
        question.setOptiond(questionDetails.getOptiond());
        question.setCorrectAnswer(questionDetails.getCorrectAnswer());
        question.setTestId(questionDetails.getTestId());

        Question updated = questionRepository.save(question);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/questions/{id}")
    public ResponseEntity<?> deleteQuestion(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        if (userRole == null || !userRole.equals("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin credentials required."));
        }

        Optional<Question> questionOpt = questionRepository.findById(id);
        if (questionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Question not found"));
        }

        questionRepository.delete(questionOpt.get());
        return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
    }

    @Data
    public static class SubmissionRequest {
        private Long userId;
        private Map<Long, String> answers;
        private Integer timeTaken;
    }
}
