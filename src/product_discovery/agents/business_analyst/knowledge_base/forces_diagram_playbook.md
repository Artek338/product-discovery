# Forces Diagram Playbook — Switch Analysis

> Jeśli nie wiesz DLACZEGO użytkownik zmieni (lub nie zmieni) narzędzia,
> twój produkt jest ruletką a nie strategią.

---

## Fundamentalna Zasada

Zakup/zmiana narzędzia następuje gdy:

```
(Push + Pull) > (Anxiety + Habit) + Switching Cost
```

Jeśli ta nierówność nie jest spełniona — **użytkownik nie zmieni**, nawet jeśli:
- Mówi "Kupiłbym to"
- Uważa że problem jest "ważny"
- Twój produkt jest obiektywnie lepszy

Dlatego Forces Diagram jest PREDYKTOREM churn, nie tylko narzędziem do zrozumienia rynku.

---

## Cztery Siły (Bob Moesta — Demand-Side Sales)

### 1. PUSH — Wypycha z obecnego rozwiązania

Co sprawia że obecne rozwiązanie przestaje być akceptowalne?

**Pytania do odkrycia Push:**
- "Co sprawiło że zacząłeś myśleć o szukaniu czegoś nowego?"
- "Co się zmieniło, że TERAZ szukasz, a nie rok temu?"
- "Co ostatnio w tym zepsutego?"
- "Jak ten problem wpływa na Twój biznes/klientów/dochody?"

> ### ⚠️ PARADOKS MATERACA — Push jest SPOŁECZNY, nie tylko funkcjonalny
>
> *Badanie Bob Moesta:* Użytkownik znosił fizyczny ból pleców przez **18 miesięcy**.
> Zmianę materaca wymusiła dopiero **jedna uszczypliwa uwaga znajomego** o "starym łóżku dla nastolatków".
>
> **Implikacja:** Prawdziwy Push NIE jest funkcjonalny — jest emocjonalny/społeczny.
> ```
> ❌ Słaby Push: "Tracę 3 godziny miesięcznie na reconciliation"
> ✅ Silny Push: "Przed klientem wyglądałem niekompetentnie przez ten błąd"
> ✅ Silny Push: "Szef zaczął kwestionować moje procesy"
> ✅ Silny Push: "Straciłem kontrakt bo system nie zdążył z fakturą"
> ```
>
> **Pytania odkrywające społeczny wymiar Push:**
> - "Dokończ: 'Gdy ten problem eskaluje, najbardziej chcę uniknąć...' — w kontekście swojej pozycji w firmie"
> - "Kto konkretnie widzi gdy ten problem się pojawia?"
> - "Co powiedzieli klienci/szef gdy to się stało?"
> - "Czy to wpłynęło na to jak jesteś postrzegany w organizacji?"

**Sygnały silnego Push (Evidence Level 2+):**
- Konkretna, datowalna sytuacja (nie "generalnie frustruje")
- Mierzalne konsekwencje (stracone pieniądze, czas, klienci)
- Eskalacja problemu (było OK, teraz nie do zniesienia)
- Trigger event: coś się zmieniło (wzrost skali, nowy klient, zła przygoda)
- **[Nowy]** Wymiar społeczny: utrata twarzy, komentarz zewnętrzny, presja przełożonego

**Sygnały słabego Push:**
- "Generalnie jest trochę uciążliwe"
- "Dajemy jakoś radę"
- Brak konkretnych strat
- Brak wymiaru społecznego/emocjonalnego (tylko funkcjonalne narzekanie)

**Scoring Push (1-10):**
- 1-3: Problem "niedogodność" — użytkownicy nie zapłacą za zmianę
- 4-6: Problem "ból" — rozważają zmianę, ale nie aktywnie szukają
- 7-9: Problem "kryzys" — aktywnie szukają rozwiązania
- 10: Problem "katastrofa" — zapłacą za wszystko co pomoże

---

### 2. PULL — Przyciąga do nowego rozwiązania

Co w Twoim produkcie jest wystarczająco atrakcyjne żeby uzasadnić zmianę?

**Pytania do odkrycia Pull:**
- "Gdyby istniało idealne rozwiązanie — jak by wyglądało?"
- "Co sprawiłoby że powiedziałbyś 'to jest dokładnie to czego potrzebuję'?"
- "Co Ci obiecuje to rozwiązanie czego teraz nie masz?"
- "Jak Twoje życie/praca wyglądałyby gdyby ten problem znikł?"

**Ważne:** Pull musi być konkretny, nie ogólny.
```
❌ Słaby Pull: "Byłoby prościej i szybciej"
✅ Silny Pull: "Odzyskam 3 godziny miesięcznie które teraz tracę na reconciliation,
               co przy mojej stawce 200 PLN/h to 600 PLN miesięcznie wartości"
```

**Scoring Pull (1-10):**
- 1-3: "Byłoby fajnie" — Desire level 1 (nie zapłacą)
- 4-6: "To by mi pomogło" — Desire level 2 (mogą zapłacić)
- 7-9: "To rozwiąże mój problem" — Desire level 3 (zapłacą)
- 10: "To zmieni mój biznes" — Desire level 4 (zapłacą dużo)

### Pricing Discovery — jak przetestować Pull finansowy bez pytania o cenę

> Źródło: NotebookLM 2026-02-23 — Teresa Torres + Eric Ries

**Problem:** Pytanie "ile byś zapłacił?" daje odpowiedź opartą na kalkulacji użytkownika, nie na realnej gotowości do zapłaty. Wynik jest zawsze za niski (anchoring w dół) lub fikcyjny.

**Metoda Concierge (Level 4-5 evidence):**
Zamiast pytać o cenę — dostarcz usługę ręcznie i pobierz opłatę. Jeśli ktoś zapłaci za ręcznie wykonywaną usługę, zapłaci za zautomatyzowaną wersję.

```
❌ "Ile byś zapłacił za automatyczne raportowanie?"
✅ "Zrobię Ci to raportowanie ręcznie przez miesiąc za X PLN — chcesz spróbować?"
→ Jeśli zapłaci: Evidence Level 4-5 (finansowe zaangażowanie)
→ Jeśli nie: Pull jest słabszy niż deklarował
```

**Demand Test (Level 3 evidence):**
Pokaż landing page z ceną i przyciskiem "Kup teraz / Dołącz do listy". Nie zbieraj płatności — zmierz click-rate i sign-up rate.
```
< 3% konwersji z LP → Pull słaby (Evidence Level 1-2)
3-10% konwersji    → Pull umiarkowany (Evidence Level 3)
> 10% konwersji    → Pull silny (Evidence Level 3-4)
```

**Kluczowe:** Dla werdyktu monetyzacji (oddzielnego od adopcji) Pull finansowy musi być przetestowany osobno. Alexa Paradox: adopcja ≠ monetyzacja.

---

### 3. ANXIETY — Strach przed nowym rozwiązaniem

Co powstrzymuje przed podjęciem decyzji pomimo Pull > Habit?

**Pytania do odkrycia Anxiety:**
- "Co by mogło pójść nie tak z nowym rozwiązaniem?"
- "Czego się obawiasz przy zmianie?"
- "Co sprawia że nie jesteś gotowy zacząć już teraz?"
- "Jakie ryzyka widzisz w zmianie obecnego podejścia?"

**Typowe źródła Anxiety:**
- Bezpieczeństwo danych ("Moje dane będą bezpieczne?")
- Zgodność z przepisami ("Czy to spełnia wymogi VAT/RODO?")
- Ryzyko migracji ("Co z moją historią? Czy importować dane?")
- Ryzyko nauki ("Ile czasu zajmie przysposobienie się?")
- Ryzyko integracji ("Czy to działa z moim systemem X?")
- Ryzyko dostawcy ("Czy ta firma będzie istnieć za rok?")
- Ryzyko akceptacji ("Czy mój klient/ksiegowy/szef zaakceptuje?")

**Implikacja:** Wysoka Anxiety NIE znaczy że produkt jest zły.
Znaczy że Twój onboarding, trust signals i gwarancje są złe.

---

### 4. HABIT — Siła przyzwyczajenia i inercja

Co sprawia że pozostanie przy obecnym rozwiązaniu jest "ścieżką najmniejszego oporu"?

**Pytania do odkrycia Habit:**
- "Co sprawia że zmiana byłaby trudna logistycznie?"
- "Ile czasu zająłoby przestawienie się na coś nowego?"
- "Kto jeszcze w Twojej firmie/ekosystemie korzysta z obecnego narzędzia?"
- "Jakie przyzwyczajenia masz w pracy z obecnym rozwiązaniem?"

**Składniki Habit:**
- Sunk cost ("Zapłaciłem już za rok InFaktu")
- Muscle memory (znam każdy skrót klawiaturowy)
- Ecosystem lock-in (mój księgowy zna InFakt, moi klienci przysłali mi faktury w formacie X)
- Switching cost (transfer danych, czas na naukę, ryzyko błędów w przejściowym okresie)
- Social habit (mój zespół, moi klienci są przyzwyczajeni)

---

## Switch Interview — Pytania do Timing'u

**Kluczowe pytanie Moesty:**
> "Co sprawiło że szukałeś TERAZ, a nie 3 miesiące wcześniej ani 3 miesiące później?"

To pytanie ujawnia TRIGGER EVENT — konkretne zdarzenie które zmieniło równowagę sił.

Typowe triggery:
- **Negatywny event**: Strata klienta, błąd kosztowny, audit/kontrola
- **Zmienna kontekstowa**: Wzrost skali, nowy pracownik, zmiana prawa
- **Zewnętrzny czynnik**: Kolega polecił, przeczytałem artykuł, zobaczyłem demo

---

## Analiza i Scoring

### Format dokumentacji Forces Diagram

```yaml
forces_diagram:
  context: "Freelancer UX, 8 klientów, 12K PLN/mies."

  push:
    score: 7  # 1-10
    evidence:
      - quote: "Tracę 3h miesięcznie na reconciliation Toggl vs InFakt"
        evidence_level: "2_Past_Behavior"
        date: "regularne zdarzenie, podało 5/7 respondentów"
      - quote: "W październiku 2024 nie zafakturowałem 500 PLN przez błąd synchronizacji"
        evidence_level: "4_Financial_Loss"
    trigger: "Wzrost liczby klientów z 3 do 8 w 2024 sprawił że problem eskalował"

  pull:
    score: 5  # NIŻSZY niż Push — to sygnał ostrzegawczy
    evidence:
      - quote: "Gdyby to robiło się samo, zaoszczędziłbym co najmniej 3h miesięcznie"
        evidence_level: "1_Preference"  # Tylko deklaracja intencji!
    weakness: "Brak konkretnej wizji ROI — respondenci nie potrafią zwerbalizować wartości"

  anxiety:
    score: 8  # ← PROBLEM: Anxiety > Pull
    evidence:
      - quote: "Nie wiem czy polskie VAT będzie poprawnie obsługiwane"
        type: "compliance_risk"
      - quote: "Mam rok historii w InFakt — nie chcę zaczynać od nowa"
        type: "migration_risk"
      - quote: "Mój księgowy zna InFakt, nie chcę mu komplikować życia"
        type: "ecosystem_risk"

  habit:
    score: 6
    evidence:
      - quote: "Znam InFakt od 3 lat, mam w nim wszystko skonfigurowane"
        type: "muscle_memory"
      - quote: "Zapłaciłem za rok z góry"
        type: "sunk_cost"

decision_formula:
  push_plus_pull: 12  # 7 + 5
  anxiety_plus_habit: 14  # 8 + 6
  result: "NEGATIVE — Forces against > Forces for"

action_required:
  - "Zmniejsz Anxiety: Trust signals (certyfikat MF, import z InFakt, 30-day trial)"
  - "Wzmocnij Pull: Konkretny kalkulator ROI (3h × stawka godzinowa × 12 miesięcy)"
  - "Zmniejsz Habit: 'Zacznij z jednym klientem, resztę import potem'"
```

### Decyzja go/no-go na podstawie Forces

| Sytuacja | Decyzja | Action |
|---|---|---|
| Push > 7 AND (Push+Pull) > (Anxiety+Habit) | ✅ GO | Buduj |
| Push > 7 BUT (Anxiety+Habit) > (Push+Pull) | ⚠️ OSTROŻNE GO | Napraw UX/onboarding przed launch |
| Push 4-6 AND Pull > Anxiety | ⚠️ OSTROŻNE GO | Segment wąsko, szukaj "desperate early adopters" |
| Push < 4 LUB Anxiety > Pull+2 | ❌ NO-GO | Nie ma switcha — brak rynku |

---

## Switch Interview — Pełny 5-Fazowy Timeline (Bob Moesta)

Cel: Odtworzyć DOKŁADNY timeline decyzji zakupowej — od pierwszej frustracji do konsumpcji.
Każda faza ujawnia inną siłę z Forces Diagram.

### FAZA 1: STRUGGLING MOMENT — Push
```
"Kiedy po raz pierwszy pomyślałeś, że musisz coś zmienić?"
"Co konkretnie się wydarzyło, że ten dzień był 'przełomowy'?"
"Co się zmieniło, że TERAZ szukasz, a nie rok temu?"
```
→ Ujawnia siłę PUSH i TRIGGER EVENT

### FAZA 2: PASSIVE LOOKING — Anxiety
```
"Jak wyglądało to szukanie? Czy rozmawiałeś z kimś?"
"Jakie alternatywy brałeś pod uwagę?"
"Co Cię powstrzymywało od zmiany na tym etapie?"
```
→ Ujawnia ANXIETY i HABIT na etapie pasywnego szukania

### FAZA 3: ACTIVE LOOKING — Pull
```
"Kiedy zaczęło Ci zależeć na tym na serio?"
"Co zrobiłeś, żeby to znaleźć?"
"Co Cię przyciągnęło do [produktu X]?"
```
→ Ujawnia siłę PULL i co konkretnie przyciągnęło

### FAZA 4: DECISION MOMENT — Forces balans
```
"Co sprawiło, że powiedziałeś 'to jest to'?"
"Było coś, co prawie Cię powstrzymało?" [ANXIETY/HABIT]
"Kto jeszcze był zaangażowany w tę decyzję?" [social dimension]
"Co pomyślała Twoja żona/partner/szef, gdy podjąłeś tę decyzję?"
```
→ Ujawnia ostateczny balans wszystkich 4 sił

### FAZA 5: CONSUMPTION — Pull validation
```
"Jak to wyglądało, gdy po raz pierwszy tego użyłeś?"
"Czy spełniło oczekiwania? Co Cię zaskoczyło — pozytywnie lub negatywnie?"
"Co byś zmienił, gdybyś mógł?"
```
→ Waliduje czy Pull był realny vs. iluzoryczny

**Kluczowa zasada:** Każda faza buduje na poprzedniej. NIE skakaj do fazy 4 bez przejścia przez 1-3.
**Czas:** Minimum 35 minut na pełny Switch Interview timeline.

---

## Red Flags Forces Diagram

🚩 **Push jest tylko "inconvenience" (1-3/10)** — użytkownicy nie zapłacą za zmianę
🚩 **Pull jest tylko "byłoby fajnie" — brak konkretnej wartości** — zły messaging
🚩 **Anxiety > Pull bez jasnej drogi do redukcji** — fundamentalny problem produktu
🚩 **Rozmówca nie zna Triggera** — problem nie jest palący (jeszcze)
🚩 **Wszystkie evidence dla Pull są Level 0-1** — respondenci kłamią przez grzeczność

---

---

## Realne Case Studies Forces Diagram

> Case studies z produktów które odniosły sukces / porażkę — wzorce dla analogii.

### Case Study 1: Neobanki (Revolut, Monzo) — SWITCH_LIKELY

| Siła | Wartość | Źródło |
|---|---|---|
| **PUSH** | 8/10 | Ukryte opłaty za przewalutowanie (funkcjonalne) + "wyglądam jak naiwny" (społeczne) |
| **PULL** | 8/10 | Natychmiastowe powiadomienia + zero ukrytych opłat + "wszystko w jednej apce" |
| **ANXIETY** | 5/10 | Brak fizycznych oddziałów, "czy moje środki są bezpieczne?" |
| **HABIT** | 5/10 | Przyzwyczajenie do tradycyjnego banku, historia transakcji |
| **Wynik** | Push+Pull=16 > Anxiety+Habit=10 | ✅ SWITCH_LIKELY |

**TRIGGER EVENT:** Podróż za granicę / pilny przelew → zderzenie z gigantyczną prowizją.

**Wzorzec:** Push był PODWÓJNY — funkcjonalny (opłaty) + emocjonalny (poczucie bycia naiwnym). Sama redukcja opłat (Pull funkcjonalny) nie wystarczyłaby — kluczowa była eliminacja wstydu.

---

### Case Study 2: Perplexity AI (vs. Google) — SWITCH_POSSIBLE

| Siła | Wartość | Źródło |
|---|---|---|
| **PUSH** | 6/10 | Przeciążenie poznawcze: 10 niebieskich linków + reklamy + SEO spam |
| **PULL** | 7/10 | Bezpośrednia odpowiedź z cytowaniami na jednym ekranie |
| **ANXIETY** | 6/10 | "AI halucynuje" — obawa o rzetelność, szczególnie dla deweloperów |
| **HABIT** | 7/10 | Lata odruchu "wpisuję w Google" — mięśniowa pamięć |
| **Wynik** | Push+Pull=13 vs. Anxiety+Habit=13 | ⚠️ SWITCH_POSSIBLE (balans) |

**TRIGGER EVENT:** Złożone zadanie badawcze lub problem programistyczny, gdzie Google zwraca tylko generyczne artykuły.

**Wzorzec:** Habit (Google jako odruch) był wyższy niż się wydaje — sam Push nie wystarczył. Konwersja następuje tylko przy SILNYM Trigger Event (konkretny problem, nie codzienne wyszukiwanie).

---

### Case Study 3: Amazon Alexa — ADOPTION ≠ PMF (FATAL)

| Siła | Wartość | Uwaga |
|---|---|---|
| **PUSH** | 9/10 | Silny — użytkownicy chcieli asystenta głosowego w domu |
| **PULL** (adopcja) | 9/10 | Miliony urządzeń sprzedanych — pozorny sukces |
| **ANXIETY** (monetyzacja) | 10/10 | **NIEPRZETESTOWANE** — "zawsze nasłuchujące urządzenie" + reklamy = prywatność |
| **HABIT** | — | Nieistotny w tym wymiarze |
| **Wynik** | Adopcja: ✅ GO | Monetyzacja: ❌ FATAL MISS |

**Lekcja:** Adopcja produktu (Push+Pull dla instalacji) ≠ PMF dla modelu monetyzacyjnego (Pull dla zakupów głosowych). Trzeba testować JTBD monetyzacji osobno od JTBD adopcji.

**Pytanie którego nie zadano:** "Czy użyłbyś asystenta głosowego do ZAKUPÓW / do REKLAM?" — Anxiety była inna niż Anxiety przy instalacji.

---

*Źródła: Bob Moesta "Demand-Side Sales 101", "Jobs to be Done" + industry leaders #89,
Switch Interviews methodology, JTBD Switch Interview Script (Deploy Empathy),
NotebookLM case studies synthesis 2026-02-23*
