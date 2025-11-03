package com.college.productdev.csrmodule.notifications;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:4200"}, allowCredentials = "true")
public class NotificationController {
    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Notification> list(@RequestParam(value = "email", required = false) String email) {
        return service.latestFor(email);
    }

    @PostMapping
    public Notification create(@RequestBody Map<String, String> body) {
        var n = new Notification();
        n.setUserEmail(body.getOrDefault("userEmail", null));
        n.setMessage(body.getOrDefault("message", ""));
        return service.save(n);
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAll(@RequestBody Map<String, String> body) {
        service.markAllRead(body.getOrDefault("email", null));
        return ResponseEntity.ok().build();
    }
}
