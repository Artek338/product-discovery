# FRD: [Feature/Product Name]

<!--
  TEMPLATE: Functional Requirements Document
  Agent: Spec Writer
  Usage: Copy this template, fill in all sections

  FRD focuses on WHAT the system does (functional behavior)
  vs SPEC which focuses on HOW it's built (technical implementation)
-->

**Status:** Draft | In Review | Approved
**PRD Reference:** [Link to PRD]
**Author:** [Name/Agent]
**Date:** [YYYY-MM-DD]
**Version:** 1.0

---

## 1. Overview

### 1.1 Purpose

<!--
  What does this document describe?
-->

This document defines the functional requirements for [feature name].

### 1.2 Scope

- ✅ **Covers:** [What this FRD includes]
- ❌ **Does not cover:** [What's excluded]

### 1.3 Definitions

| Term | Definition |
|------|------------|
| [Term 1] | [Definition] |
| [Term 2] | [Definition] |

---

## 2. Functional Requirements

### 2.1 [Requirement Category 1]

#### FR-001: [Requirement Title]

**Description:** [Clear description of the requirement]

**Priority:** Must Have | Should Have | Could Have

**Trigger:** [What initiates this function]

**Input:**
- [Input 1]: [Description, type, constraints]
- [Input 2]: [Description, type, constraints]

**Processing:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Output:**
- [Output 1]: [Description]

**Business Rules:**
- BR-001: [Business rule]
- BR-002: [Business rule]

**Acceptance Criteria:**
- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]

---

#### FR-002: [Requirement Title]

**Description:** [Description]

**Priority:** Must Have | Should Have | Could Have

**Trigger:** [Trigger]

**Input:**
- [Input]

**Processing:**
1. [Step]

**Output:**
- [Output]

**Business Rules:**
- [Rule]

**Acceptance Criteria:**
- [ ] [Criterion]

---

<!--
  Add more functional requirements as needed.
  Group by category (e.g., User Management, Payments, Notifications)
-->

### 2.2 [Requirement Category 2]

#### FR-003: [Title]

[...]

---

## 3. User Interface Requirements

### 3.1 Screen: [Screen Name]

**Purpose:** [What user accomplishes on this screen]

**Elements:**
| Element | Type | Description | Validation |
|---------|------|-------------|------------|
| [Element 1] | Text input | [Description] | Required, max 100 chars |
| [Element 2] | Button | [Description] | Enabled when form valid |
| [Element 3] | Dropdown | [Description] | Options: A, B, C |

**Layout:** [Description or link to mockup]

**Interactions:**
- On [action] → [result]
- On [action] → [result]

---

### 3.2 Screen: [Screen Name]

[...]

---

## 4. Data Requirements

### 4.1 Data Entities

#### Entity: [Name]

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| id | UUID | Yes | Unique identifier | Auto-generated |
| [field] | [type] | Yes/No | [Description] | [Constraints] |

#### Entity: [Name]

[...]

### 4.2 Data Relationships

```
[Entity A] 1──────* [Entity B]
            has many

[Entity B] *──────1 [Entity C]
           belongs to
```

### 4.3 Data Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| email | Valid email format | "Please enter a valid email" |
| password | Min 8 chars, 1 uppercase, 1 number | "Password must be..." |

---

## 5. Business Rules

### 5.1 [Category]

| ID | Rule | Applies To |
|----|------|------------|
| BR-001 | [Clear statement of rule] | [Where it applies] |
| BR-002 | [Rule] | [Where] |

### 5.2 Calculations

#### [Calculation Name]

**Formula:** `[formula]`

**Variables:**
- [var1]: [definition]
- [var2]: [definition]

**Example:**
```
Input: [example values]
Calculation: [steps]
Output: [result]
```

---

## 6. Workflow Requirements

### 6.1 [Workflow Name]

**Trigger:** [What starts this workflow]

**Steps:**
```
[START]
    │
    ▼
┌─────────────┐
│  Step 1     │
│  [Action]   │
└─────────────┘
    │
    ▼
◇ [Decision] ◇
    │       │
   Yes      No
    │       │
    ▼       ▼
[Step 2]  [Step 3]
    │       │
    └───┬───┘
        │
        ▼
    [END]
```

**State Transitions:**
| From State | Action | To State | Conditions |
|------------|--------|----------|------------|
| [State A] | [Action] | [State B] | [If conditions] |

---

## 7. Integration Requirements

### 7.1 [External System Name]

**Purpose:** [Why we integrate]

**Direction:** Inbound | Outbound | Bidirectional

**Data Exchanged:**
| Data | Direction | Format | Frequency |
|------|-----------|--------|-----------|
| [Data 1] | In/Out | JSON | Real-time |

**Error Handling:**
- If [error condition] → [how to handle]

---

## 8. Security Requirements

### 8.1 Authentication

- [ ] [Auth requirement 1]
- [ ] [Auth requirement 2]

### 8.2 Authorization

| Function | Required Role | Additional Checks |
|----------|--------------|-------------------|
| [Function 1] | [Role] | [Extra checks] |

### 8.3 Data Security

- [ ] [Data protection requirement]
- [ ] [Encryption requirement]

---

## 9. Performance Requirements

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Page load time | < 3 seconds | P95 |
| API response | < 500ms | P95 |
| Concurrent users | 1000 | Load test |

---

## 10. Error Handling

### 10.1 Error Messages

| Error Code | Condition | User Message | System Action |
|------------|-----------|--------------|---------------|
| ERR-001 | [When] | "[Message]" | [Action] |
| ERR-002 | [When] | "[Message]" | [Action] |

### 10.2 Exception Handling

| Exception | Handling |
|-----------|----------|
| [Exception type] | [How to handle] |

---

## 11. Reporting Requirements

### 11.1 [Report Name]

**Purpose:** [What this report shows]

**Users:** [Who uses this report]

**Data Included:**
- [Data point 1]
- [Data point 2]

**Filters:**
- [Filter 1]
- [Filter 2]

**Format:** PDF | CSV | Dashboard

---

## 12. Traceability Matrix

| PRD Requirement | FRD Requirement(s) | Test Case(s) |
|-----------------|-------------------|--------------|
| [PRD section/story] | FR-001, FR-002 | TC-001 |
| [PRD section/story] | FR-003 | TC-002, TC-003 |

---

## Appendix

### A. Mockups

[Links or embedded images]

### B. Sample Data

[Example data for testing]

---

## Changelog

| Date | Author | Version | Change |
|------|--------|---------|--------|
| [Date] | [Who] | 1.0 | Initial draft |
