# PRD: [Feature/Product Name]

<!--
  TEMPLATE: Product Requirements Document
  Agent: PRD Writer
  Usage: Copy this template, fill in all sections, remove instructions
-->

**Status:** Draft | In Review | Approved
**Author:** [Name/Agent]
**Date:** [YYYY-MM-DD]
**Version:** 1.0
**Reviewers:** [List]

---

## 1. Executive Summary

<!--
  2-3 sentences answering:
  - What are we building?
  - For whom?
  - What problem does it solve?
-->

[Write summary here]

---

## 2. Problem Statement

### 2.1 Problem

<!--
  Describe the user's problem from THEIR perspective.
  Be specific - not "users are unhappy" but "users waste 30 min/day on X"
-->

[Describe the problem]

### 2.2 Current State

<!--
  How do users solve this problem today?
  Why is the current solution insufficient?
-->

[Describe current state]

### 2.3 Evidence

<!--
  What data supports this problem exists?
  - User feedback quotes
  - Analytics data
  - Support ticket volume
  - Competitor analysis
-->

| Evidence Type | Source | Summary |
|---------------|--------|---------|
| [Type] | [Source] | [What it shows] |

---

## 3. Goals & Success Metrics

### 3.1 Goals

<!--
  What are we trying to achieve? Be specific and measurable.
-->

- [ ] **Goal 1:** [Specific, measurable goal]
- [ ] **Goal 2:** [Specific, measurable goal]

### 3.2 Success Metrics

<!--
  How will we know if we succeeded?
-->

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| [Metric 1] | [Baseline] | [Target] | [How to measure] |
| [Metric 2] | [Baseline] | [Target] | [How to measure] |

### 3.3 Non-Goals

<!--
  What are we explicitly NOT trying to achieve with this PRD?
-->

- [Non-goal 1]
- [Non-goal 2]

---

## 4. User Stories

### 4.1 Primary User Story

**As a** [specific persona - not just "user"]
**I want** [capability/action]
**So that** [benefit/value]

**Acceptance Criteria:**

- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]

**Priority:** P0 | P1 | P2 | P3
**Size:** S | M | L

---

### 4.2 User Story: [Title]

**As a** [persona]
**I want** [capability]
**So that** [benefit]

**Acceptance Criteria:**

- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]

**Priority:** P0 | P1 | P2 | P3
**Size:** S | M | L

---

<!--
  Add more user stories as needed.
  Each story should have:
  - Specific persona
  - Clear capability (not implementation)
  - Real benefit
  - 3+ acceptance criteria
  - Priority and size
-->

---

## 5. Scope

### 5.1 In Scope (MVP)

<!--
  What ARE we building in this release?
-->

- ✅ [Feature/capability 1]
- ✅ [Feature/capability 2]
- ✅ [Feature/capability 3]

### 5.2 Out of Scope

<!--
  What are we explicitly NOT building now? Include reason.
-->

- ❌ [Feature X] — [Why not now: e.g., "Phase 2", "Requires dependency Y"]
- ❌ [Feature Y] — [Why not now]

### 5.3 Non-Negotiables

<!--
  Requirements that MUST be met, no exceptions.
-->

- 🔒 [Requirement 1 - e.g., "GDPR compliance"]
- 🔒 [Requirement 2 - e.g., "Mobile responsive"]
- 🔒 [Requirement 3 - e.g., "Load time < 3s"]

---

## 6. BUSINESS MODEL & MONETIZATION

<!--
  How does this product make money?
  Input from: Monetization Strategist
-->

### 6.1 Revenue Model

[How we make money: SaaS subscription, marketplace fees, ads, one-time purchase, etc.]

### 6.2 Pricing Strategy

| Tier | Price | Target User | Key Features |
|------|-------|-------------|--------------|
| [Free/Starter] | [$0 or $X/mo] | [Who] | [What they get] |
| [Pro] | [$Y/mo] | [Who] | [What they get] |
| [Business] | [$Z/mo] | [Who] | [What they get] |

**Rationale:** [Why these prices and tiers]

### 6.3 Unit Economics

- **LTV (Lifetime Value):** [Estimated customer lifetime value]
- **CAC (Customer Acquisition Cost):** [Estimated cost to acquire customer]
- **LTV:CAC Ratio:** [Target: 3:1 or better]
- **Payback Period:** [Months to recover CAC]

**Assumptions:** [Key assumptions behind these numbers]

---

## 7. MARKET ANALYSIS

<!--
  Market opportunity and competitive landscape
  Input from: Market Size Analyst, Competitive Analyst
-->

### 7.1 Market Size

- **TAM (Total Addressable Market):** [Total universe]
- **SAM (Serviceable Available Market):** [Realistically reachable]
- **SOM (Serviceable Obtainable Market - Year 1):** [Realistic Year 1 target]

**Methodology:** [How we calculated these numbers]

### 7.2 Competitive Landscape

| Competitor | Strengths | Weaknesses | Our Differentiation |
|------------|-----------|------------|---------------------|
| [Competitor A] | [What they do well] | [Where they fall short] | [How we're different/better] |
| [Competitor B] | [What they do well] | [Where they fall short] | [How we're different/better] |

### 7.3 Market Opportunity

**Why now?** [What makes this the right time for this product]

**Growth potential:** [Market growth rate, trends driving adoption]

---

## 8. GO-TO-MARKET STRATEGY

<!--
  How do we acquire customers and launch?
  Input from: GTM Strategist
-->

### 8.1 Target Beachhead Market

[Which specific segment we're going after FIRST]

**Why this segment:** [Rationale for beachhead choice]

### 8.2 Launch Plan

**Phase 1: Beta (0-100 users)**

- Timeline: [Dates]
- Channels: [How we get first users]
- Goal: [What we're validating]

**Phase 2: Public Launch (100-1000 users)**

- Timeline: [Dates]
- Channels: [Primary acquisition channels]
- Goal: [What success looks like]

**Phase 3: Scale (1000+ users)**

- Timeline: [Dates]
- Channels: [Scaled channels]
- Goal: [Growth targets]

### 8.3 Distribution Channels

| Channel | Tactic | Expected CAC | Priority |
|---------|--------|--------------|----------|
| [Channel 1] | [Specific tactic] | $X | High/Med/Low |
| [Channel 2] | [Specific tactic] | $Y | High/Med/Low |

### 8.4 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Users acquired | [X in Y months] | [Analytics] |
| CAC | [$X] | [Marketing spend / new users] |
| Conversion rate | [X%] | [Free to paid] |

---

## 9. User Flow

### 9.1 Happy Path

<!--
  Step-by-step flow for the main use case.
-->

```
1. User [action]
2. System [response]
3. User [action]
4. System [response]
5. [Outcome]
```

### 9.2 Alternative Flows

<!--
  Other valid paths through the feature.
-->

**Flow: [Name]**

```
1. [Step]
2. [Step]
```

### 9.3 Error States

<!--
  What can go wrong and how do we handle it?
-->

| Error | Trigger | User Message | Recovery |
|-------|---------|--------------|----------|
| [Error 1] | [When this happens] | "[Message shown]" | [How user recovers] |
| [Error 2] | [When this happens] | "[Message shown]" | [How user recovers] |

---

## 10. Design Requirements

### 10.1 UI/UX Requirements

<!--
  High-level UI requirements. Link to mockups if available.
-->

- [Requirement 1]
- [Requirement 2]

**Mockups:** [Link to Figma/designs if available]

### 10.2 Accessibility

- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast (WCAG AA)
- [ ] [Other requirements]

---

## 11. Technical Considerations

<!--
  NON-BINDING notes for engineering. They decide implementation.
-->

- Possible approach: [Suggestion]
- Consider: [Technical consideration]
- Constraint: [Known limitation]
- Integration needed: [External service]

---

## 12. Dependencies

### 12.1 Internal Dependencies

| Dependency | Owner | Status | Impact if Delayed |
|------------|-------|--------|-------------------|
| [Dep 1] | [Team] | Ready | Blocked | [Impact] |

### 12.2 External Dependencies

| Dependency | Type | Status | Fallback |
|------------|------|--------|----------|
| [Dep 1] | API | Service | Available | Blocked | [Alternative] |

---

## 13. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | High | Med | Low | High | Med | Low | [How to reduce] |
| [Risk 2] | | | |

---

## 14. Timeline & Milestones

| Milestone | Description | Target Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approved | This document | [Date] | ⏳ |
| Design Complete | Mockups ready | [Date] | ⏳ |
| Spec Complete | Technical spec | [Date] | ⏳ |
| MVP Ready | First release | [Date] | ⏳ |

---

## 15. Open Questions

<!--
  Questions that need answers before or during development.
-->

- [ ] [Question 1] — Owner: [Who should answer]
- [ ] [Question 2] — Owner: [Who should answer]

---

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| [Term 1] | [Definition] |

### B. References

- [Link to research]
- [Link to competitor analysis]
- [Link to user feedback]

---

## Changelog

| Date | Author | Version | Change |
|------|--------|---------|--------|
| [Date] | [Who] | 1.0 | Initial draft |
