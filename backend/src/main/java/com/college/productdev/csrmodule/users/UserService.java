package com.college.productdev.csrmodule.users;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public User upsert(UserUpsertRequest req) {
        var user = repo.findByEmail(req.email()).orElseGet(User::new);
        if (user.getId() == null) {
            user.setEmail(req.email());
        }
        if (req.name() != null && !req.name().isBlank()) {
            user.setName(req.name());
        }
        if (req.username() != null && !req.username().isBlank()) {
            user.setUsername(req.username());
        }
        if (req.profession() != null && !req.profession().isBlank()) {
            user.setProfession(req.profession());
        }
        user.setVerifiedAt(req.verifiedAt() != null ? req.verifiedAt() : LocalDateTime.now());
        return repo.save(user);
    }
}
