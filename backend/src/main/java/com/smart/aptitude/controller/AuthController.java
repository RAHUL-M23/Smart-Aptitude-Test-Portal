package com.smart.aptitude.controller;

import com.smart.aptitude.model.User;
import com.smart.aptitude.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            // Extra safety: Check if password stored is raw (in case of legacy/unhashed DB data).
            // Let's do a direct equals comparison to support unhashed passwords during initial testing
            if (password.equals(user.getPassword())) {
                // If it matches raw, update the password to BCrypt hashed version for future security
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
            }
        }

        // Return user details but remove password hash from payload
        User responseUser = new User();
        responseUser.setId(user.getId());
        responseUser.setName(user.getName());
        responseUser.setEmail(user.getEmail());
        responseUser.setRole(user.getRole());

        return ResponseEntity.ok(responseUser);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getEmail() == null || user.getPassword() == null || user.getName() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email and password are required"));
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
        }

        // Set encoded password and default role
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_STUDENT"); // Default role for standard registrations

        User savedUser = userRepository.save(user);
        
        // Hide password in response
        User responseUser = new User();
        responseUser.setId(savedUser.getId());
        responseUser.setName(savedUser.getName());
        responseUser.setEmail(savedUser.getEmail());
        responseUser.setRole(savedUser.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(responseUser);
    }
}
