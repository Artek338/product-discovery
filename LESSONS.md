# 🧠 Lessons Learned (Product Discovery OS)

Dokument zawierający lekcje wyciągnięte z błędów w poprzednich symulacjach i iteracjach narzędziowych. Główna zasada: **Nie powtarzaj błędów historii.**

## 1. Zjawisko "Discovery for Discovery" (Rozmowa Rekrutacyjna AdTech)

**Sytuacja:** Narzędzie (i ja jako inżynier) natychmiast rozpoczęło wykonywanie pełnej 8-węzłowej analityki Problem Discovery (sprawdzanie opłacalności, wywiady z użytkownikami, Forces Diagram, OSINT) dla pomysłu `Platforma AdTech / MarTech`. Założyłem w ciemno nazwę firmy (z innej części pamięci kontekstowej) oraz cel (walidacja problemu), podczas gdy biznes sformułował już potrzebę (decyzja biznesowa o budowie zapadła).

**Błąd:** Skok w nadgorliwą egzekucję (Solutioning / Problem Validation) bez wcześniejszego zadania pytań doprecyzowujących kontekst biznesowy użytkownika, zakres kompetencji, fazy projektu i ograniczeń początkowych. Brak wstępnej klasyfikacji projektu - "Discovery dla Discovery".

**Skutek:**

- Przepalenie zasobów na Problem Discovery dla pomysłu, który był już wewnętrznie zatwierdzony przez zarząd.
- Kontekstowa wpadka (wymienienie nazwy firmy klienta bez potwierdzenia).
- Ominięcie prawdziwej potrzeby biznesowej: Feature/Solution Discovery zamiast Idea Validation.

---

### 🛠️ Poprawka (Plan Naprawczy)

Aby zapobiec temu w przyszłości:

1. **Wdrożenie "Fazy 0" (Inception/Pre-flight):** Zanim uruchomimy jakikolwiek kod, musimy zadać 3 kalibrujące pytania:
   - **Rodzaj Discovery:** *Problem Discovery* (badanie rentowności) czy *Solution/Feature Discovery* (mapowanie wymagań dla zdecydowanego MVP)?
   - **Grupa docelowa:** Kto będzie użytkownikiem pierwotnym i docelowym końcowym? (np. najpierw in-house, potem SaaS).
   - **Ograniczenia / Kontekst Historyczny:** Co pominąć? Osobne potwierdzenie nazw własnych z użytkownikiem.
2. **Aktualizacja Agentów do trybu interaktywnego:** Skrypt `product-discovery` otrzyma tryb `--interactive`, w którym `UserInputNeededNode` pojawi się NA POCZĄTKU ścieżki i wysteruje zachowaniami analitycznymi. Pozwoli na przekazanie konkretnych obostrzeń (np. "Biznes zaklepał" -> wymusza automatyczne GO na Forces Diagram i Evidence Grading).
3. **Bezwzględne oddzielenie strumieni danych w pamięci (Mental Firewall):** Agent nie może dopowiadać tła projektowego z innych sesji roboczych.
