package com.college.productdev.csrmodule.audit;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = {"http://localhost:4200"}, allowCredentials = "true")
public class AuditController {
    private final AuditService service;

    public AuditController(AuditService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        var e = new AuditEvent();
        e.setUserEmail((String) body.getOrDefault("userEmail", null));
        e.setAction((String) body.getOrDefault("action", ""));
        e.setEntityType((String) body.getOrDefault("entityType", null));
        Object id = body.get("entityId");
        if (id instanceof Number n) e.setEntityId(n.longValue());
        e.setDetails((String) body.getOrDefault("details", null));
        var saved = service.save(e);
        return ResponseEntity.ok(saved.getId());
    }

    @GetMapping
    public List<AuditEvent> list(@RequestParam("email") String email) {
        return service.latestFor(email);
    }
}
