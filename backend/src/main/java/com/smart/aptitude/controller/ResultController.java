package com.smart.aptitude.controller;

import com.smart.aptitude.model.Result;
import com.smart.aptitude.repository.ResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    @Autowired
    private ResultRepository resultRepository;

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
}
