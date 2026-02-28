# Best Practices

> Sprawdzone wzorce które działają. **LLM: Stosuj te praktyki.**

---

## Ogólne

### 1. Checkpoints z Użytkownikiem

**Kiedy:** Po każdej ważnej fazie workflow
**Dlaczego:** Użytkownik może mieć dodatkowy kontekst, chcieć zmienić kierunek
**Jak:**

```
"Zakończyłem [fazę]. Wynik: [krótkie podsumowanie].
Czy kontynuować do [następna faza]?"
```

### 2. Rozpoczynaj od Knowledge Base

**Kiedy:** Przed każdym zadaniem
**Dlaczego:** Unikasz znanych błędów, używasz sprawdzonych wzorców
**Jak:**

```
1. Czytaj lessons_learned.md
2. Czytaj best_practices.md
3. Dopiero potem wykonuj zadanie
```

### 3. Reflect Po Każdym Zadaniu

**Kiedy:** Po zakończeniu każdego projektu/zadania
**Dlaczego:** System się ulepsza
**Jak:**

```
1. Co poszło dobrze? → Dodaj do best_practices.md
2. Co poszło źle? → Dodaj do lessons_learned.md
3. Co można ulepszyć? → Zaproponuj zmiany w agentach
```

---

## Workflow

### 4. Business Analyst Najpierw

**Kiedy:** Każdy nowy pomysł
**Dlaczego:** Oszczędza czas - lepiej wiedzieć że NO-GO na początku
**Jak:** Zawsze zaczynaj od `business_analyst.md`

### 5. PRD Przed Kodem

**Kiedy:** Po GO od Business Analyst
**Dlaczego:** Unikasz "scope creep", masz jasne cele
**Jak:** `product_manager.md` → PRD → dopiero potem architektura

### 6. Producer-Reviewer Pattern

**Kiedy:** Każdy ważny deliverable
**Dlaczego:** Dwie perspektywy łapią więcej błędów
**Jak:**

```
Agent A tworzy → Agent B reviewuje → Approve/Reject → Next
```

---

## Komunikacja

### 7. Konkretne Pytania

**Kiedy:** Potrzebujesz decyzji od użytkownika
**Dlaczego:** Szybsze odpowiedzi, mniej nieporozumień
**Jak:**

```
❌ "Co myślisz o tym podejściu?"
✅ "Wybieram opcję A (React) ze względu na X. OK?"
```

### 8. Podsumowania Po Każdej Fazie

**Kiedy:** Po zakończeniu fazy workflow
**Dlaczego:** Użytkownik wie co się stało
**Jak:**

```
"✅ Faza: [nazwa]
Wynik: [deliverable]
Następny krok: [co dalej]
Czekam na: [akceptację/input]"
```

---

## Kod

### 9. Małe Zmiany, Częste Commity

**Kiedy:** Development
**Dlaczego:** Łatwiejszy review, łatwiejszy rollback
**Jak:** Jeden commit = jedna logiczna zmiana

### 10. Testy Przed Refaktorem

**Kiedy:** Przed zmianami w istniejącym kodzie
**Dlaczego:** Wiesz czy coś zepsułeś
**Jak:** Uruchom testy przed i po zmianach

---

## Jak Dodawać Nowe Praktyki

1. Użyj formatu: Tytuł → Kiedy → Dlaczego → Jak
2. Dodaj w odpowiedniej sekcji
3. Commit z message: `best-practice: [krótki opis]`

---

*Ostatnia aktualizacja: 2026-01-20*
