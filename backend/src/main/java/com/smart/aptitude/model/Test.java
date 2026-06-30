package com.smart.aptitude.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "tests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Test {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_id")
    private Long testId;
    
    @Column(name = "test_name", nullable = false)
    private String testName;
    
    @Column(name = "category")
    private String category;
    
    @Column(name = "duration", nullable = false)
    private Integer duration; // in minutes
    
    @Column(name = "total_marks")
    private Integer totalMarks;

    @Column(name = "expiry_timestamp")
    private LocalDateTime expiryTimestamp;
}

