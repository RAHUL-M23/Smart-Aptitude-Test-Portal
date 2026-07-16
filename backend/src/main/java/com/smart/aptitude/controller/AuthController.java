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
        if (user.getIsActive() != null && !user.getIsActive()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "This account has been deleted."));
        }
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
        responseUser.setRollNumber(user.getRollNumber());
        responseUser.setDepartment(user.getDepartment());

        return ResponseEntity.ok(responseUser);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getEmail() == null || user.getPassword() == null || user.getName() == null ||
            user.getRollNumber() == null || user.getRollNumber().isBlank() ||
            user.getDepartment() == null || user.getDepartment().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email, password, roll number and department are required"));
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
        }

        if (userRepository.existsByRollNumber(user.getRollNumber())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Roll Number already in use"));
        }

        // Set encoded password and default role
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_STUDENT"); // Default role for standard registrations
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        
        // Hide password in response
        User responseUser = new User();
        responseUser.setId(savedUser.getId());
        responseUser.setName(savedUser.getName());
        responseUser.setEmail(savedUser.getEmail());
        responseUser.setRole(savedUser.getRole());
        responseUser.setRollNumber(savedUser.getRollNumber());
        responseUser.setDepartment(savedUser.getDepartment());

        return ResponseEntity.status(HttpStatus.CREATED).body(responseUser);
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String name = payload.get("name");

        if (email == null || email.isBlank() || name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and Name are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
            if (user.getIsActive() != null && !user.getIsActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "This account has been deleted."));
            }
        } else {
            // Register a new user with Google account details
            user = new User();
            user.setEmail(email);
            user.setName(name);
            // Secure random password
            String randomPassword = java.util.UUID.randomUUID().toString();
            user.setPassword(passwordEncoder.encode(randomPassword));
            user.setRole("ROLE_STUDENT");
            user.setIsActive(true);
            
            // Generate a unique roll number
            String generatedRoll;
            boolean exists;
            do {
                String randomSuffix = java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
                generatedRoll = "G-" + randomSuffix;
                exists = userRepository.existsByRollNumber(generatedRoll);
            } while (exists);
            
            user.setRollNumber(generatedRoll);
            user.setDepartment("General");
            
            user = userRepository.save(user);
        }

        // Return user details but remove password hash
        User responseUser = new User();
        responseUser.setId(user.getId());
        responseUser.setName(user.getName());
        responseUser.setEmail(user.getEmail());
        responseUser.setRole(user.getRole());
        responseUser.setRollNumber(user.getRollNumber());
        responseUser.setDepartment(user.getDepartment());

        return ResponseEntity.ok(responseUser);
    }

    @PostMapping("/guest")
    public ResponseEntity<?> guestLogin(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String name = payload.get("name");

        if (email == null || email.isBlank() || name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and Name are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
            if (user.getIsActive() != null && !user.getIsActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "This account has been deleted."));
            }
        } else {
            // Register a new user with Guest details
            user = new User();
            user.setEmail(email);
            user.setName(name);
            // Secure random password
            String randomPassword = java.util.UUID.randomUUID().toString();
            user.setPassword(passwordEncoder.encode(randomPassword));
            user.setRole("ROLE_STUDENT");
            user.setIsActive(true);
            
            // Generate a unique roll number
            String generatedRoll;
            boolean exists;
            do {
                String randomSuffix = java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
                generatedRoll = "GUEST-" + randomSuffix;
                exists = userRepository.existsByRollNumber(generatedRoll);
            } while (exists);
            
            user.setRollNumber(generatedRoll);
            user.setDepartment("Guest");
            
            user = userRepository.save(user);
        }

        // Return user details but remove password hash
        User responseUser = new User();
        responseUser.setId(user.getId());
        responseUser.setName(user.getName());
        responseUser.setEmail(user.getEmail());
        responseUser.setRole(user.getRole());
        responseUser.setRollNumber(user.getRollNumber());
        responseUser.setDepartment(user.getDepartment());

        return ResponseEntity.ok(responseUser);
    }

    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String name = payload.get("name");
        String rollNumber = payload.get("rollNumber");
        String department = payload.get("department");

        if (email == null || name == null || rollNumber == null || department == null ||
            name.isBlank() || rollNumber.isBlank() || department.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, roll number and department are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        
        // Enforce uniqueness of Roll Number (if changed)
        if (user.getRollNumber() == null || !user.getRollNumber().equals(rollNumber)) {
            if (userRepository.existsByRollNumber(rollNumber)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Roll Number already in use by another user"));
            }
        }

        user.setName(name);
        user.setRollNumber(rollNumber);
        user.setDepartment(department);

        User updatedUser = userRepository.save(user);

        // Hide password in response
        User responseUser = new User();
        responseUser.setId(updatedUser.getId());
        responseUser.setName(updatedUser.getName());
        responseUser.setEmail(updatedUser.getEmail());
        responseUser.setRole(updatedUser.getRole());
        responseUser.setRollNumber(updatedUser.getRollNumber());
        responseUser.setDepartment(updatedUser.getDepartment());

        return ResponseEntity.ok(responseUser);
    }

    @GetMapping("/admin/users")
    public ResponseEntity<?> getAdminUsers(@RequestHeader(value = "X-User-Role", required = false) String userRole) {
        if (userRole == null || !userRole.equals("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin credentials required."));
        }
        
        java.util.List<User> users = userRepository.findAll();
        java.util.List<java.util.Map<String, Object>> responseList = new java.util.ArrayList<>();
        
        for (User u : users) {
            if (u.getIsActive() != null && !u.getIsActive()) {
                continue;
            }
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("rollNumber", u.getRollNumber());
            map.put("department", u.getDepartment());
            map.put("password", u.getPassword());
            responseList.add(map);
        }
        
        return ResponseEntity.ok(responseList);
    }

    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        if (userRole == null || !userRole.equals("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin credentials required."));
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        if (user.getRole().equals("ROLE_ADMIN")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Admin accounts cannot be deleted."));
        }

        user.setIsActive(false);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User account deleted successfully."));
    }
}

