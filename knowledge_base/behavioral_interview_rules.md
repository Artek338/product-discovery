# Behavioral Interviewing — Rules for AI Agents

> **Context:** This file contains actionable rules for conducting effective customer interviews.
> **Usage:** ALL agents involved in Discovery (Business Analyst, Product Manager) MUST follow these rules.
> **Enforcement:** Violating these rules (e.g., asking for opinions) leads to immediate `GATE FAIL`.
>
> **Related files:**
>
> - `knowledge-base/evidence_levels.md` — How to grade the evidence you collect
> - `templates/documents/INTERVIEW_LOG.template.md` — Where to log interview results
> - `tools/behavioral_interview.py` — CLI tool to validate questions before asking

---

## 1. Question Formulation Rules (❌ BAD → ✅ GOOD)

The Golden Rule: **Never ask about your idea. Ask about their life.**

| # | ❌ BAD (Opinion / Future / Pitch) | ✅ GOOD (Behavior / Past / Fact) | Why? |
|---|-----------------------------------|----------------------------------|------|
| 1 | "Do you think it's a good idea?" | "How do you currently solve this problem?" | Opinions are worthless. Only the market knows. |
| 2 | "Would you buy a product which did X?" | "How much money have you spent on solving this in the last year?" | Future promises are lies. Past spending is fact. |
| 3 | "How much would you pay for X?" | "How much does this problem cost you right now?" | Pricing is about value anchor, not hypothetical willingness. |
| 4 | "What would your dream product do?" | "Talk me through your workflow. Where do you get stuck?" | Users don't know solutions. They know their friction points. |
| 5 | "Is feature X important to you?" | "What are the implications if this problem isn't solved?" | Distinguishes "nice-to-have" from "hair-on-fire". |
| 6 | "Do you think you would use this often?" | "When was the last time this problem happened?" | Anchors fluff ("usually") to concrete reality. |
| 7 | "Would you like an app for recipes?" | "What is the last cookbook you bought?" | Past behavior predicts future behavior. |
| 8 | "Do you agree that X is annoying?" | "Why do you bother doing it that way?" | "Why do you bother" reveals motivation and goal. |
| 9 | "We are building X, what do you think?" | "What else have you tried to solve this?" | Reveals competitors and "good enough" workarounds. |
| 10 | "Is security important to you?" | "Have you ever rejected a tool because of security?" | Everyone says "yes" to security. Only behavior proves it. |
| 11 | "Would you pay $50 for this?" | "Where does the budget for these tools come from?" | Identifies the decision maker and purchasing process. |
| 12 | "Do you want to sync with Excel?" | "What happens after you export data? Who do you send it to?" | Understands the *workflow*, not just the feature request. |
| 13 | "Can I show you our prototype?" | "Can you show me how you do this task right now?" | Watching them do it > Showing them your solution. |
| 14 | "Are you worried about data privacy?" | "How are you dealing with data privacy regulations today?" | Reveals if it's an active pain or just a theoretical worry. |
| 15 | "Do you like the design?" | "How did you find that button? Was it where you expected?" | Usability observation > Aesthetic opinion. |
| 16 | "Would you recommend this to a friend?" | "Who else should I talk to about this problem?" | Asking for intros tests social capital commitment. |
| 17 | "Do you usually check email in the morning?" | "Talk me through exact steps you took this morning." | "Usually" is a lie. "This morning" is a fact. |
| 18 | "If we added X, would you buy?" | "How are you coping without feature X right now?" | If they aren't coping (suffering), they won't buy. |
| 19 | "Is this your biggest problem?" | "What are your top 3 priorities right now?" | See if your problem even makes their list. |
| 20 | "Did you like the demo?" | "What are the next steps?" | Force a decision/commitment, not a compliment. |

---

## 2. Red Flags (Conversation is Worthless) 🚩

If you detect these, **STOP**. You are collecting noise, not signal.

1. **Compliments:** "It sounds like a great idea!", "I love it!", "This is so cool." (The user is protecting your feelings).
2. **Fluff/Generics:** "I usually...", "I always...", "I never..." (The user is describing their ideal self, not real self).
3. **Future Tense:** "I would...", "I will...", "Next time I might..." (Hypothetical promises are free).
4. **Feature Requests without Context:** "You should add X" (Without understanding *why*, this is feature creep).
5. **Pitching:** You talked for more than 50% of the time.
6. **No Pain:** The user admits the problem exists but hasn't tried to solve it (It's a "complaint", not a "problem").
7. **Wrong Person:** The person doesn't have the budget/authority to buy (unless they are a user-champion).
8. **"Let me know when it launches":** This is a polite rejection.
9. **Zooming too early:** You focused on a specific feature before validating the problem exists.
10. **Confirmation Bias:** You only asked leading questions ("Don't you hate X?") that forced a "Yes".

---

## 3. Good vs. Bad Conversation Checklist

### ✅ GOOD Conversation

- [ ] **Talked about their life:** Focused on specific events, workflows, and constraints.
- [ ] **Specifics > Generics:** Discussed "last Tuesday" or "this morning", not "usually".
- [ ] **Listening > Talking:** You spoke < 30% of the time.
- [ ] **Facts > Opinions:** Collected facts about past actions/spending behavior.
- [ ] **Commitment:** Ended with a clear next step (money, time, reputation risk).

### ❌ BAD Conversation

- [ ] **Talked about your idea:** You pitched your solution before understanding the problem.
- [ ] **Seeked Approval:** You asked "Is it good?" or fished for compliments.
- [ ] **Hypotheticals:** Accepted "I would" or "I might" as validation.
- [ ] **Compliments:** Left feeling good because they said "nice idea" (with no commitment).
- [ ] **No Next Step:** Ended with "We'll be in touch" or vague pleasantries.

---

## 4. Concrete Examples (Software/App Discovery)

Use these questions verbatim to trigger "Behavioral Interview" mode in `gate_check.py` or agent dialogues.

**Opening / Context:**

1. "What are the top 3 challenges you are facing with [topic] this week?"
2. "Talk me through the last time you had to deal with [problem]."

**Problem Validation:**
3. "How are you currently solving this? What tools or workarounds are you using?"
4. "Can you show me (or describe) exactly how that workaround looks? Where does it break?"
5. "How much time did you spend fixing this yesterday/last week?"

**Value/Pricing:**
6. "Have you bought any tools to help with this? Which ones?"
7. "Why did you stop using [Previous Tool]?"
8. "Where does the money come from for these types of purchases? Who signs off?"

**Feature request digging:**
9. "You mentioned you want [Feature X]. If you had that, what would it allow you to do that you can't do now?"
10. "How are you coping without [Feature X] today?"

**Closing:**
11. "Who else cares about this problem as much as you do?"
