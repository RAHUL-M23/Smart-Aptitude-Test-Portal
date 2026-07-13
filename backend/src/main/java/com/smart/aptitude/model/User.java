package com.smart.aptitude.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    @Column(nullable = false)
    private String role; // e.g. "ROLE_STUDENT" or "ROLE_ADMIN"

    @Column(name = "roll_number", nullable = true, unique = true)
    private String rollNumber;

    @Column(name = "department", nullable = true)
    private String department;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
