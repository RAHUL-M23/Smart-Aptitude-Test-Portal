package com.smart.aptitude.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long questionId;
    
    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;
    
    @Column(name = "optiona", nullable = false)
    private String optiona;
    
    @Column(name = "optionb", nullable = false)
    private String optionb;
    
    @Column(name = "optionc", nullable = false)
    private String optionc;
    
    @Column(name = "optiond", nullable = false)
    private String optiond;
    
    @Column(name = "correct_answer", nullable = false)
    private String correctAnswer; // e.g. "A", "B", "C", "D"
    
    @Column(name = "test_id", nullable = false)
    private Long testId;

    @Column(name = "category")
    private String category;

    @Column(name = "sub_topic")
    private String subTopic;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;
}
