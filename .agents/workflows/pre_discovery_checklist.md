---
description: Mandatory Discovery for Discovery (Pre-flight Context Alignment)
---
# Discovery for Discovery Workflow

## Kiedy używać?

ZAWSZE, gdy otrzymasz zadanie polegające na opracowaniu nowego produktu, funkcji, czy wykonaniu procesu "Discovery". Zanim zaproponujesz skrypt, zaczniesz kodować lub puścisz wieloagentową rurkę, musisz poznać ramy biznesowe.

## Wykonaj te kroki, zanim napiszesz linijkę kodu i zanim cokolwiek zaproponujesz

1. **Zatrzymaj się i Zbadaj Kontekst Biznesowy (Odrzuć Pamięć Kontekstową Z Innych Wątków):**
   * Nie wolno Ci używać nazw własnych (np. nazwy firmy), które pamiętasz z innych iteracji, dopóki użytkownik sam ich nie użyje lub nie poprosisz o weryfikację.
   * Nie wolno Ci zakładać celu biznesowego za użytkownika.

2. **Zadaj Użytkownikowi "Pytania Złote" (Discovery for Discovery):**
   Użyj narzędzia `notify_user` z `BlockedOnUser=true`, aby zadać użytkownikowi dokładnie te pytania w celu uniknięcia nieporozumień:
   * **Status biznesowy:** Czy walidujemy opłacalność biznesową pomysłu od zera (rozwiewamy mity rynkowe, sprawdzamy lęki), czy budżet/decyzja zapadły i sprawdzamy *konkretnie CO zbudować* i *jaki ma być zakres MVP*? (Idea Validation vs Solution/Feature Discovery).
   * **Kim jest odbiorca (Stakeholders):** Kto jest klientem końcowym MVP? Kto będzie użytkownikiem? (np. najpierw narzędzie wewnętrzne, na zewnątrz za rok).
   * **Aktualny proces i Wąskie gardła:** Jak dzisiaj ten problem rozwiązujecie bez kodu? Czego najbardziej brakuje w obecnym workflow?

3. **Dokonaj Wyboru Trybu Pracy:**
   * Jeśli to Business Problem Validation: Uruchom `product-discovery` z użyciem `Forces Diagram` (udowadnianie przez wywiady behawioralne).
   * Jeśli to Feature/Solution Validation: Zignoruj `product-discovery` generujące GO/NO-GO i zamiast tego skumuluj się na mapowaniu procesów, User Story Mapping (MoSCoW), rozbijaniu silosów i szkicowaniu Dashboardów (Figma).

4. Oczekuj na odpowiedź użytkownika, zanim wygenerujesz jakikolwiek raport. Nie zgaduj!
