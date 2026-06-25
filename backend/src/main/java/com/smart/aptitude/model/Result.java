package com.smart.aptitude.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;
    
    @Column(name = "score")
    private Integer score;
    
    @Column(name = "percentage")
    private Double percentage;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "time_taken")
    private Integer timeTaken; // in seconds
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @Column(name = "selected_answers", columnDefinition = "TEXT")
    private String selectedAnswers;
}
