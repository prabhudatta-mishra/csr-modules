package com.college.productdev.csrmodule.users;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:4200"}, allowCredentials = "true")
public class UserController {
    private final UserService service;
    private final UserRepository repo;

    public UserController(UserService service, UserRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    @PostMapping("/upsert")
    public ResponseEntity<?> upsert(@Valid @RequestBody UserUpsertRequest body) {
        var saved = service.upsert(body);
        return ResponseEntity.ok(saved.getId());
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() { return ResponseEntity.ok("ok"); }

    @DeleteMapping("/by-email")
    public ResponseEntity<?> deleteByEmail(@RequestParam("email") String email) {
        if (email == null || email.isBlank()) return ResponseEntity.badRequest().body("email required");
        if (!repo.existsByEmail(email)) return ResponseEntity.notFound().build();
        repo.deleteByEmail(email);
        return ResponseEntity.noContent().build();
    }
}
