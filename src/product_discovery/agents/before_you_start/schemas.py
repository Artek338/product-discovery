"""
Before You Start — Schemas Pydantic.

NextQuestion: odpowiedź agenta przy każdym kroku (jedno pytanie na raz).
BYSSummary:   finalny kontekst zebrany po zakończeniu sesji.

Import:
    from product_discovery.agents.before_you_start.schemas import NextQuestion, BYSSummary
"""

from typing import List

from pydantic import BaseModel, Field, model_validator


class NextQuestion(BaseModel):
    """Jedno pytanie wygenerowane dynamicznie przez agenta na podstawie historii Q&A."""

    question: str = Field(
        ...,
        min_length=10,
        max_length=500,
        description=(
            "Otwarte pytanie pogłębiające — wynika z poprzednich odpowiedzi. "
            "NIE tak/nie. Pyta o fakty, przeszłość, konkretne sytuacje."
        ),
    )
    is_complete: bool = Field(
        ...,
        description=(
            "True gdy agent zebrał wystarczający kontekst i sesja powinna się zakończyć. "
            "False gdy należy zadać kolejne pytanie."
        ),
    )
    completion_reason: str = Field(
        default="",
        description="Krótkie uzasadnienie zakończenia sesji (wymagane gdy is_complete=True).",
    )

    @model_validator(mode="after")
    def completion_reason_required_when_complete(self) -> "NextQuestion":
        if self.is_complete and not self.completion_reason.strip():
            raise ValueError("completion_reason required when is_complete=True")
        return self


class BYSSummary(BaseModel):
    """
    Podsumowanie sesji 'Zanim zaczniesz'.

    Wstrzykiwane jako dodatkowy kontekst do Business Analyst agenta w Discovery.
    NIGDY nie trafia do zewnętrznych serwisów (Miro, Google Docs, Slack).
    """

    core_problem: str = Field(
        ...,
        min_length=20,
        max_length=600,
        description=(
            "Główny problem/cel/temat zebrany z sesji — konkretny opis sytuacji. "
            "2-4 zdania. Unikaj ogólników."
        ),
    )
    key_assumptions: List[str] = Field(
        ...,
        min_length=2,
        max_length=8,
        description=(
            "Kluczowe założenia wymienione przez użytkownika (2-8 pozycji). "
            "Każde założenie jako osobny string, min 10 znaków."
        ),
    )
    open_questions: List[str] = Field(
        ...,
        min_length=1,
        max_length=6,
        description=(
            "Nierozstrzygnięte pytania/ryzyka do zbadania w Discovery (1-6 pozycji). "
            "Rzeczy które nie zostały wyjaśnione podczas sesji."
        ),
    )
    context_for_discovery: str = Field(
        ...,
        min_length=100,
        max_length=3000,
        description=(
            "Bogaty, ustrukturyzowany kontekst dla Business Analyst agenta. "
            "Powinien zawierać: segment docelowy, obecny proces użytkownika, "
            "zmierzone bóle, ograniczenia czasowe/budżetowe, kluczowych decydentów, "
            "czego NIE wiemy a powinniśmy zbadać."
        ),
    )
