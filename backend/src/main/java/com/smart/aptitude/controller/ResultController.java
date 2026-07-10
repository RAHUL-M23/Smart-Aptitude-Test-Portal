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
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;

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

    @GetMapping("/admin/export")
    public ResponseEntity<?> exportResultsToExcel(
            @RequestParam(required = false) Long testId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        if (userRole == null || !userRole.equals("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin credentials required."));
        }

        List<Result> results;
        if (testId != null) {
            results = resultRepository.findByTest_TestIdOrderBySubmittedAtDesc(testId);
        } else {
            results = resultRepository.findAllByOrderBySubmittedAtDesc();
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Student Results");

            // Header Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

            // Columns
            String[] columns = {"Student Name", "Student ID / Email", "Test Name", "Test Type", "Total Marks / Score", "Date of Attempt"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowNum = 1;
            for (Result r : results) {
                Row row = sheet.createRow(rowNum++);
                
                String name = r.getUser() != null ? r.getUser().getName() : "N/A";
                String idEmail = r.getUser() != null 
                    ? ((r.getUser().getRollNumber() != null && !r.getUser().getRollNumber().isBlank())
                        ? r.getUser().getRollNumber() + " / " + r.getUser().getEmail()
                        : r.getUser().getEmail())
                    : "N/A";
                String testName = r.getTest() != null ? r.getTest().getTestName() : "N/A";
                String testType = r.getTest() != null ? r.getTest().getCategory() : "N/A";
                String totalMarksScore = (r.getScore() != null ? r.getScore() : 0) + " / " + 
                    ((r.getTest() != null && r.getTest().getTotalMarks() != null) ? r.getTest().getTotalMarks() : 10);
                String attemptDate = r.getSubmittedAt() != null ? r.getSubmittedAt().toString() : "N/A";

                row.createCell(0).setCellValue(name);
                row.createCell(1).setCellValue(idEmail);
                row.createCell(2).setCellValue(testName);
                row.createCell(3).setCellValue(testType);
                row.createCell(4).setCellValue(totalMarksScore);
                row.createCell(5).setCellValue(attemptDate);
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            byte[] excelBytes = out.toByteArray();

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=student_reports.xlsx");
            headers.setContentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate Excel report: " + e.getMessage()));
        }
    }
}

