# Assumption Testing Patterns — Deep Research

> Źródło: NotebookLM Deep Search, 2026-02-28
> Wzbogaca: `AssumptionMapNode`, Interview Coach, Gate Check

---

## Klasyfikacja założeń (Teresa Torres)

### 1. Desirability (Pożądalność)

**Pytanie:** Czy klienci rzeczywiście pragną tego rozwiązania i są gotowi zmienić nawyki?

**Przykład:** "Nasi czytelnicy chcą udostępniać artykuły znajomym na Facebooku
i są gotowi podać ich adres e-mail."

**Techniki <$500:**

- **Fake door test** — nieaktywny przycisk nowej funkcji → mierzenie CTR ($0-$100)
- **Landing page (Smoke test)** — strona zbierająca zapisy + $50-$300 na reklamy
- **One-question survey** — ankieta w aplikacji badająca konkretne, przeszłe zachowania

### 2. Viability (Opłacalność)

**Pytanie:** Czy model biznesowy jest zrównoważony? Czy przychody > koszty dostarczenia?

**Przykład:** "Czytelnicy podzielą się artykułami przez SMS z wystarczającą liczbą osób
bez subskrypcji, które następnie ją wykupią, aby zrekompensować koszty SMS."

**Techniki <$500:**

- **Concierge MVP** — ręczne dostarczenie usługi pierwszym 5-10 klientom
- **Pricing test (Gabor-Granger)** — przyciski "Kup teraz" z różnymi cenami na LP
- **Pre-order (Dry Wallet)** — zbieranie wpłat za nieistniejący produkt

### 3. Feasibility (Wykonalność techniczna)

**Pytanie:** Czy zespół posiada kompetencje, technologie i zasoby by to zbudować?

**Przykład:** "Nasze maile z pełną treścią poprawnie się sformatują i przejdą filtry antyspamowe."

**Techniki <$500:**

- **Technical Spike** — 2-5 dni eksperyment inżynieryjny (np. integracja z API)
- **Wizard of Oz** — ręczna obsługa backendu + iluzja automatyzacji na frontendzie
- **API / Data Audit** — przegląd dostępności, limitów, error rates (np. halucynacje LLM)

### 4. Usability (Użyteczność)

**Pytanie:** Czy klienci potrafią znaleźć, zrozumieć i ukończyć zadanie?

**Przykład:** "Czytelnicy zauważą przycisk udostępniania artykułu w nowym interfejsie."

**Techniki <$500:**

- **Figma Prototype Testing** — obserwacja użytkowników bez linijki kodu ($100-$500)
- **First Click Testing** — narzędziowe sprawdzenie gdzie użytkownik klika najpierw
- **Hallway Testing** — 5-minutowe testy na przypadkowych osobach (zrozumiałość <10s)

### 5. Ethical (Etyczność)

**Pytanie:** Czy to **powinno** zostać zbudowane? Czy nie spowoduje szkód?

**Przykład:** "Klienci czują się komfortowo podając dane osobowe osób trzecich
przy wysyłaniu polecenia."

**Techniki <$500:**

- **Pre-Mortem etyczny** — warsztat: katastrofa PR-owa za 5 lat → jakie decyzje do niej doprowadziły
- **Data Audit** — ewaluacja prywatności, profilu odbiorcy, przepływów danych
- **Jobs-NOT-to-be-done** — zachowania, których produkt celowo NIE będzie wspierał

---

## Techniki testowania — porównanie

| Technika | Typ założenia | Koszt | Czas | Sample min | Success benchmark |
|----------|---------------|-------|------|------------|-------------------|
| Fake door test | Desirability | $0 - $100 | 1-14 dni | 1000 views / 100 kliknięć | > 15% CTR |
| Concierge MVP | Viability / Usability | Czas zespołu | 2-4 tyg | 5-10 użytkowników | > 60% repeat usage |
| Wizard of Oz | Feasibility / Viability | Czas zespołu | 2-4 tyg | 10-30 użytkowników | > 90% task completion |
| Smoke test (Ads) | Desirability | $50 - $200 | 7-14 dni | 200-500 visitors | > 10% konwersja |
| Landing page | Desirability | $0 - $300 | 7-14 dni | 200-500 visitors | > 5-10% CVR email |
| Pre-order | Viability | Niskie | 4-6 tyg | 50+ rezerwacji | 1-3% konwersja płatna |
| Technical Spike | Feasibility | Czas inżyniera | 2-5 dni | N/A | Udokumentowana ścieżka |
| Clickable Prototype | Usability | $100 - $500 | 2-7 dni | 5 użytkowników | > 85% wykrytych błędów |

---

## Anty-wzorce testowania

### 1. Confirmation Bias (Efekt Potwierdzenia)

**Symptom:** Zespół zauważa tylko wyniki wspierające ich ulubiony pomysł. Przy 1.2% konwersji
skupiają się na "15 osób które się zapisały" ignorując 98.5% rezygnacji.

**Ryzyko:** Miesiące pracy na funkcji, której nikt nie chce. "Cargo-Cult Discovery" —
badanie jako formalność do zatwierdzenia pomysłu szefa.

**Fix:** Ustal jasne **metryki sukcesu/porażki PRZED** testem.
Np.: "oczekujemy 10% konwersji, mniej = porażka". Twarda granica.

### 2. Survivorship Bias (Błąd Przeżywalności)

**Symptom:** Ankietowanie wyłącznie lojalnych, aktywnych klientów.
Pomijanie churnerów i odrzuconych.

**Ryzyko:** Sugeruje, że produkt działa wyśmienicie. Ukrywa prawdziwe powody rezygnacji.
Fokus na "power users" zamiast naprawienia trudnego onboardingu.

**Fix:** Aktywnie rozmawiaj z "przegranymi": churnerzy, nieprzekonwertowani,
ci którzy wybrali konkurencję.

### 3. Selection Bias (Pułapka Power Usera)

**Symptom:** Testy na super-użytkownikach, znajomych lub ekspertach z forów.
100% "sukces" w testach użyteczności.

**Ryzyko:** Zwykły użytkownik porzuci proces w pierwszej minucie.

**Fix:** Randomizacja lub dobór warstwowy przy rekrutacji. Testuj ze zróżnicowanymi
grupami odwzorowującymi całą populację docelową.

### 4. Politeness Bias ("Nice Friend" Trap)

**Symptom:** "Czy byś za to zapłacił?" → "Super pomysł!" (100% walidacja).

**Ryzyko:** Ludzie fatalnie przewidują przyszłe zachowania i nie chcą sprawiać przykrości.
0 płacących klientów po starcie.

**Fix:** Testuj twarde fakty (skin in the game). MOM Test: "Jak dotąd radziłeś sobie
z tym problemem?" Pre-order zamiast opinii.

### 5. Multiple Testing Problem

**Symptom:** Jeden test z 4 propozycjami wartości, wieloma CTA i cennikami naraz.

**Ryzyko:** Nie wiadomo co spowodowało wynik. 20 metryk × α=0.05 → >60% szans na fałszywego "zwycięzcę".

**Fix:** Testuj warianty sekwencyjnie. Korekta Bonferroniego przy testach wielowariantowych.

---

## Case Studies

### Dropbox — Explainer Video MVP

- **Technika:** Smoke test (video na landing page)
- **Wynik:** Zapisy na beta: 5,000 → **75,000 w jedną noc**
- **Zamiast:** $399/CAC na AdWords
- **Lekcja:** Skomplikowaną technologię (sync między OS) można zwalidować
  wizualną prezentacją wartości — przed napisaniem linijki backendu

### Zappos — Wizard of Oz MVP

- **Technika:** Wizard of Oz (ręczna realizacja zamówień)
- **Wynik:** Nick Swinmurn fotografował buty w fizycznych sklepach, wrzucał na stronę,
  po kliknięciu "Kup" sam szedł do galerii manualnie realizować zamówienie
- **Lekcja:** Aby dowieść tezy "ludzie kupią buty online bez przymierzania" →
  100% zafalszuj automatyzację, zdejmij z siebie ryzyko magazynowe

### Buffer — Sequential Landing Page MVP

- **Technika:** Sekwencyjny smoke test + pricing validation
- **Wynik:** Faza 1: przycisk "Plans and Pricing", Faza 2: prawdziwe cenniki.
  Budowa dopiero, gdy duża część ruchu klikała opcje płatne + wpisywała email
- **Lekcja:** Weryfikuj jednocześnie pożądalność I willingness-to-pay
  przez pokazanie cennika PRZED budową platformy

### Tesla — Pre-order (Dry Wallet)

- **Technika:** Pre-order z wpłatą zadatku
- **Wynik:** Model 3: **325,000 płatnych rezerwacji w pierwszym tygodniu**.
  Roadster: $5,000 zadatku za auto, które nie weszło do produkcji
- **Lekcja:** Pieniądze to najsilniejsza waluta behawioralna.
  Bramka zaangażowania = ostateczna walidacja chęci zakupu

---

## Statystyczne minimum

### Sample size guidelines

| Typ testu | Minimum | Uzasadnienie |
|-----------|---------|-------------|
| Qualitative (wywiady) | **15-20 sesji** per segment | Saturacja danych — więcej nie przynosi nowych wniosków |
| Usability testing | **5-8 uczestników** | NNGroup: 5 osób wykrywa 85% głównych błędów |
| Quantitative (LP/smoke) | **200-500 visitors** | Solidny przedział ufności (5% CVR × 500 = 25 ±5) |
| A/B testing | **1000+ odsłon / 100+ kliknięć** per wariant | Statystyczne odcięcie szumu |

### Duration guidelines

| Minimum | Maximum | Uzasadnienie |
|---------|---------|-------------|
| **7-14 dni** | **6-8 tygodni** | Min: wygładzenie "weekend effect". Max: dane zanieczyszczone sezonowością |

### Istotność statystyczna w discovery

| Faza | Poziom ufności | Power | MDE |
|------|---------------|-------|-----|
| **Tradycyjne A/B** | 95% (α = 0.05, p < 0.05) | 80% | 5% |
| **Wczesne discovery** | **90%** (α = 0.10) | 80% | **10%** |

**MDE (Minimum Detectable Effect):** Jeśli CVR rośnie z 10.1% do 10.2%,
istotność *praktyczna* nie uzasadnia angażowania Engineering. MDE w early discovery ≥ 10%.
