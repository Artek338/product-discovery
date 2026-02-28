# Technical Specification: [Feature Name]

<!--
  TEMPLATE: Technical Specification
  Agent: Spec Writer
  Usage: Copy this template, fill in all sections

  SPEC focuses on HOW to build (technical implementation)
  Based on approved PRD (WHAT to build)
-->

**Status:** Draft | In Review | Approved
**PRD Reference:** [Link]
**FRD Reference:** [Link, if separate]
**Author:** [Name/Agent]
**Date:** [YYYY-MM-DD]
**Tech Reviewers:** [List]

---

## 1. Overview

### 1.1 Summary

<!--
  1-2 sentences: what are we building technically?
-->

[Technical summary]

### 1.2 Goals

- [Technical goal 1]
- [Technical goal 2]

### 1.3 Non-Goals

- [What we're NOT optimizing for]

---

## 2. Architecture

### 2.1 High-Level Design

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│     API     │────▶│  Database   │
│  (React)    │     │  (Express)  │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  External   │
                    │  Services   │
                    └─────────────┘
```

### 2.2 Components

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| [Component 1] | [What it does] | [Tech stack] |
| [Component 2] | [What it does] | [Tech stack] |

### 2.3 Design Decisions

#### Decision 1: [Title]

**Choice:** [What we chose]

**Alternatives Considered:**
| Option | Pros | Cons |
|--------|------|------|
| [Option A] | [Pros] | [Cons] |
| [Option B] | [Pros] | [Cons] |

**Rationale:** [Why we chose this]

---

## 3. Data Model

### 3.1 Entities

#### Entity: [Name]

```
[Name]
├── id: UUID (PK)
├── [field]: [type] (required/optional)
├── [field]: [type] [default: value]
├── created_at: timestamp
└── updated_at: timestamp

Indexes:
- idx_[name]_[field] ([field])
- idx_[name]_composite ([field1], [field2])

Constraints:
- [constraint description]
```

#### Entity: [Name]

```
[Same format]
```

### 3.2 Relationships

```
┌─────────┐       ┌─────────┐
│  User   │ 1───* │  Order  │
└─────────┘       └─────────┘
                       │
                       *
                       │
                  ┌─────────┐
                  │  Item   │
                  └─────────┘
```

### 3.3 Migrations

```sql
-- Migration: [name]
-- Date: [YYYY-MM-DD]
-- Description: [what this does]

-- Up
CREATE TABLE [table] (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    [column] [type] [constraints],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_[table]_[column] ON [table]([column]);

-- Down
DROP TABLE IF EXISTS [table];
```

### 3.4 Migration Strategy

- **Backward compatible:** Yes | No
- **Rollback plan:** [Description]
- **Data migration:** [If needed, describe steps]

---

## 4. API Specification

### 4.1 Endpoints

#### POST /api/v1/[resource]

**Description:** [What it does]

**Authentication:** Required | Optional | None

**Rate Limit:** [X] requests/minute

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "field1": "string (required, max 100 chars)",
  "field2": 123,
  "field3": {
    "nested": "value"
  }
}
```

**Response 201 Created:**
```json
{
  "id": "uuid",
  "field1": "value",
  "created_at": "2024-01-15T10:00:00Z"
}
```

**Error Responses:**
| Status | Code | Message | When |
|--------|------|---------|------|
| 400 | VALIDATION_ERROR | "field1 is required" | Missing required field |
| 401 | UNAUTHORIZED | "Invalid token" | Bad/missing auth |
| 409 | CONFLICT | "Already exists" | Duplicate resource |
| 500 | INTERNAL_ERROR | "Something went wrong" | Server error |

---

#### GET /api/v1/[resource]/{id}

**Description:** [What it does]

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Resource identifier |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| include | string | No | - | Related resources to include |

**Response 200 OK:**
```json
{
  "id": "uuid",
  "field1": "value"
}
```

**Error Responses:**
| Status | Code | When |
|--------|------|------|
| 404 | NOT_FOUND | Resource doesn't exist |

---

<!--
  Add more endpoints as needed:
  - GET /api/v1/[resource] (list)
  - PUT /api/v1/[resource]/{id} (update)
  - DELETE /api/v1/[resource]/{id} (delete)
-->

### 4.2 Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": "field_name",
      "reason": "Specific reason"
    },
    "request_id": "uuid for tracing"
  }
}
```

### 4.3 Pagination

```json
// Request
GET /api/v1/resources?page=1&per_page=20

// Response
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_count": 100,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 5. Business Logic

### 5.1 Rules

| Rule ID | Rule | Implementation |
|---------|------|----------------|
| BL-001 | [Business rule] | [How to implement] |
| BL-002 | [Business rule] | [How to implement] |

### 5.2 Validation

| Field | Validation Rules | Error Message |
|-------|-----------------|---------------|
| email | Valid format, unique | "Invalid email" / "Email taken" |
| password | Min 8, 1 upper, 1 number | "Password too weak" |

### 5.3 State Machine

```
┌─────────┐  submit   ┌─────────┐  approve  ┌─────────┐
│  DRAFT  │──────────▶│ PENDING │──────────▶│ ACTIVE  │
└─────────┘           └─────────┘           └─────────┘
                           │
                           │ reject
                           ▼
                      ┌─────────┐
                      │REJECTED │
                      └─────────┘
```

---

## 6. Security

### 6.1 Authentication

- **Method:** JWT | Session | API Key
- **Token expiration:** [X hours]
- **Refresh strategy:** [Description]

### 6.2 Authorization

| Endpoint | Method | Required Role | Additional Checks |
|----------|--------|--------------|-------------------|
| /resource | POST | authenticated | - |
| /resource/{id} | DELETE | admin | owner check |

### 6.3 Data Protection

| Data Type | Protection | Notes |
|-----------|------------|-------|
| Passwords | bcrypt (cost 12) | Never stored plain |
| PII | Encrypted at rest | AES-256 |
| Tokens | Signed | RS256 |

### 6.4 Threat Mitigation

| Threat | Mitigation |
|--------|------------|
| SQL Injection | Parameterized queries, ORM |
| XSS | Input sanitization, CSP |
| CSRF | CSRF tokens on mutations |
| Rate limiting | [X] req/min per IP |

---

## 7. Performance

### 7.1 Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Response time | P95 < 200ms | APM |
| Throughput | 1000 req/s | Load test |
| Database queries | Max 3 per request | Query logging |

### 7.2 Optimizations

- **Caching:** [What, where, TTL]
- **Indexing:** [Covered in Data Model]
- **Connection pooling:** [Size, config]
- **Lazy loading:** [What's lazy loaded]

### 7.3 Scalability

| Scenario | Strategy |
|----------|----------|
| High read traffic | Read replicas |
| High write traffic | Sharding by [key] |
| Large datasets | Pagination, archiving |

---

## 8. Error Handling

### 8.1 Error Codes

```typescript
enum ErrorCode {
  // Client errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}
```

### 8.2 Retry Strategy

| Error Type | Retryable | Max Retries | Backoff |
|------------|-----------|-------------|---------|
| 5xx | Yes | 3 | Exponential (1s base) |
| Network timeout | Yes | 3 | Exponential (1s base) |
| 4xx | No | - | - |

---

## 9. Testing

### 9.1 Unit Tests

- [ ] Business logic functions
- [ ] Validation rules
- [ ] Utility functions

### 9.2 Integration Tests

- [ ] API endpoints (happy path)
- [ ] API endpoints (error cases)
- [ ] Database operations
- [ ] External service integration

### 9.3 E2E Tests

- [ ] [Critical flow 1]
- [ ] [Critical flow 2]

### 9.4 Test Data

```json
// Example fixtures
{
  "user": {
    "id": "test-user-1",
    "email": "test@example.com"
  }
}
```

---

## 10. Deployment

### 10.1 Feature Flags

| Flag | Default | Purpose |
|------|---------|---------|
| feature_[name] | off | [What it controls] |

### 10.2 Rollout Plan

1. Deploy to staging → verify
2. Enable for 5% of users → monitor
3. Increase to 25% → monitor
4. Increase to 50% → monitor
5. Enable for 100%

### 10.3 Monitoring

**Metrics:**
- [metric_name]: [what it measures]
- [metric_name]: [what it measures]

**Alerts:**
| Alert | Condition | Severity |
|-------|-----------|----------|
| [Name] | [When to trigger] | Critical | Warning |

### 10.4 Rollback Plan

1. Disable feature flag
2. [Additional steps]
3. Database rollback: [If needed]

---

## 11. Dependencies

### 11.1 External Services

| Service | Purpose | Timeout | Fallback |
|---------|---------|---------|----------|
| [Service] | [Why] | [Xs] | [What if down] |

### 11.2 Internal Dependencies

| Service | Version | Status |
|---------|---------|--------|
| [Service] | [v1.2.3] | Ready | Blocked |

### 11.3 Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| [lib] | [X.Y.Z] | [Why] |

---

## 12. Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Spec Review | 2 days | Technical review |
| Implementation | [X] days | Core development |
| Testing | [X] days | QA + fixes |
| Rollout | [X] days | Staged release |

---

## 13. Open Questions

- [ ] [Question 1] — Owner: [Who]
- [ ] [Question 2] — Owner: [Who]

---

## Changelog

| Date | Author | Version | Change |
|------|--------|---------|--------|
| [Date] | [Who] | 1.0 | Initial draft |
