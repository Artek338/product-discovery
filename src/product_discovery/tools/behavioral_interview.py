"""
Behavioral Interview Validator — validates interview questions against Mom Test rules.

Rules:
- Don't suggest answers
- Ask about PAST behavior, not hypothetical future
- Open questions (not yes/no)
- Good starter: "Tell me about the last time you..."
"""

from dataclasses import dataclass, field
from typing import List
import re


@dataclass
class ValidationResult:
    """Result of question validation."""
    is_valid: bool
    score: int  # 0-10
    feedback: List[str] = field(default_factory=list)


class BehavioralInterviewer:
    """Validates interview questions against behavioral interviewing best practices."""

    # Patterns that indicate suggestive questions (Mom Test violations)
    SUGGESTIVE_PATTERNS = [
        r"czy (to|ten|ta|te) (dobr|świetn|fantas)",
        r"czy (kupiłbyś|zapłaciłbyś|użyłbyś)",
        r"would you (buy|pay|use|like)",
        r"do you (think|feel|believe) (this|it|that) (is|would be)",
        r"isn't (it|this|that)",
        r"don't you (think|agree)",
        r"czy nie (uważasz|sądzisz|myślisz)",
    ]

    # Patterns that indicate hypothetical questions
    HYPOTHETICAL_PATTERNS = [
        r"gdyby(ś|ście)?",
        r"wyobraź sobie",
        r"what if",
        r"imagine",
        r"suppose",
        r"jak byś",
        r"co byś",
    ]

    # Good patterns — past behavior focus
    GOOD_PATTERNS = [
        r"opowiedz mi o (ostatnim|konkretnym)",
        r"tell me about (the last|a specific) time",
        r"kiedy ostatnio",
        r"when was the last time",
        r"co (zrobiłeś|zrobiłaś|się stało)",
        r"what (happened|did you do)",
        r"jak (wyglądał|przebiegał)",
        r"how did (it|that) (go|work|happen)",
    ]

    def validate_question(self, question: str) -> ValidationResult:
        """Validate a single interview question."""
        feedback = []
        score = 7  # Start with decent score

        q_lower = question.lower().strip()

        # Check for question mark
        if "?" not in question:
            feedback.append("Brak znaku zapytania — czy to jest pytanie?")
            score -= 2

        # Check for suggestive patterns
        for pattern in self.SUGGESTIVE_PATTERNS:
            if re.search(pattern, q_lower):
                feedback.append(
                    f"❌ Sugestywne pytanie (Mom Test violation): sugeruje odpowiedź"
                )
                score -= 3
                break

        # Check for hypothetical patterns
        for pattern in self.HYPOTHETICAL_PATTERNS:
            if re.search(pattern, q_lower):
                feedback.append(
                    "⚠️ Hipotetyczne pytanie — pyta o przyszłość, nie o przeszłe zachowanie"
                )
                score -= 2
                break

        # Bonus for good patterns
        for pattern in self.GOOD_PATTERNS:
            if re.search(pattern, q_lower):
                feedback.append("✅ Dobre pytanie behawioralne — skupia się na przeszłości")
                score += 1
                break

        # Check for yes/no questions
        if q_lower.startswith(("czy ", "do you ", "is ", "are ", "was ", "were ", "did ")):
            feedback.append("⚠️ Pytanie zamknięte (tak/nie) — zmniejsza głębokość odpowiedzi")
            score -= 1

        # Check length
        if len(question) < 15:
            feedback.append("Pytanie zbyt krótkie — dodaj kontekst")
            score -= 1
        elif len(question) > 300:
            feedback.append("Pytanie zbyt długie — uprość")
            score -= 1

        score = max(0, min(10, score))

        if not feedback:
            feedback.append("Pytanie wygląda OK — sprawdź kontekst użycia")

        return ValidationResult(
            is_valid=score >= 5,
            score=score,
            feedback=feedback,
        )
