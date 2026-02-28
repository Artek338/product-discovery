# Evidence Hierarchy — Deep Research

> Źródło: NotebookLM Deep Search, 2026-02-28
> Wzbogaca: `evidence_levels.md`, `EvidenceGradingNode`

---

## Podstawy akademickie

### Intention-Behavior Gap (Ajzen → Sheeran & Webb)

Teoria Planowanego Zachowania (TPB) Icka Ajzena (1985) zakłada, że o zachowaniu
decyduje intencja oparta na postawach, normach i postrzeganej kontroli.

**Metaanaliza 47 badań (Sheeran & Webb):**
> Korelacja między deklarowaną intencją a faktycznym zachowaniem wynosi zaledwie **~50%**.

### Dlaczego deklaracje ≠ zachowania

Różnice w neurobiologicznym przetwarzaniu decyzji:

- **Badania fMRI:** Deklaracje wymagające jedynie czasu (Time Commitment) aktywują
  w mózgu **wyspę (insula)** — powiązaną z emocjami
- Pytania o pieniądze (Financial Commitment) aktywują **ośrodki brutalnej analizy
  kosztów i strat**
- Odpowiedzi ankietowe są w **60% obciążone błędem "social desirability"** — intencje
  wydają się bardziej pozytywne niż zachowania zakupowe w zderzeniu z prawdziwą bramką płatności

**Implikacja dla Discovery:** Pytanie "czy kupiłbyś?" (Level 1) jest **neurologicznie
odmiennym procesem** od faktycznego kliknięcia "Kup teraz" (Level 5). Nie wolno
traktować ich jako równorzędnych sygnałów.

---

## Benchmarki konwersji

| Sygnał | Benchmark "dobry" | Benchmark "słaby" | Uwagi |
|--------|-------------------|-------------------|-------|
| Email signup → paid | > 20% | 2% - 3% | Wysoki benchmark = silny Pull + niska Anxiety |
| Waitlist → activation | 10% - 15% | 2% - 5% | Niska konwersja = słaby Pull lub wysoki Habit |
| Landing page → signup | 9.5% (SaaS B2B) | < 1% | Średnia branżowa SaaS B2B |
| Free trial → paid | > 12% | < 8% | Zależy od długości trial (7d vs 30d) |
| LOI → closed deal | LOI z karami umownymi (Level 5) | LOI bez zobowiązań / słowne (Level 1-2) | B2B: LOI bez kar = opinia, nie commitment |

### Fake Traffic Warning (Jordan Resnick, CHEQ)
>
> "If 20 to 40 percent of the internet is fake, then 20 to 40 percent of those clicks
> you're paying for are never going to buy because they're fake."

**Implikacja:** Landing page conversion benchmarks muszą uwzględniać 20-40% fake traffic.
Realny benchmark "dobry" po korekcie: **~6% netto** (9.5% × 0.65).

---

## Case Studies — Porażki z niskim evidence level

### Quibi — $1.75B strata (Level 1-2)

| Aspekt | Szczegóły |
|--------|-----------|
| **Produkt** | Mobilna platforma streamingowa z krótkimi formami "w biegu" |
| **Evidence** | Level 1-2: opinie z grup fokusowych + autorytet weteranów Hollywood |
| **Zignorowali** | Prawdziwe nawyki behawioralne (Level 2+): użytkownicy woleli darmowy TikTok/YouTube |
| **Konsekwencje** | 92% użytkowników nie przeszło na płatny abonament. Zamknięci po 6 miesiącach |

**Pytanie którego nie zadano:** "Opowiedz mi o ostatnim razie, kiedy oglądałeś coś na telefonie w drodze do pracy — co to było i dlaczego?"

### Juicero — $120M strata (Level 1-2)

| Aspekt | Szczegóły |
|--------|-----------|
| **Produkt** | Wyciskarka do soków podłączona do Wi-Fi za $699 |
| **Evidence** | Level 1-2: entuzjazm założycieli i VCs |
| **Zignorowali** | Cash/Financial Commitment test. Saszetki można było wycisnąć ręcznie — szybciej i za darmo |
| **Konsekwencje** | Całkowita upadłość, $120M przepalone |

**Lekcja:** Testuj propozycję wartości PRZED budową hardware'u.

### Webvan — $1.2B strata (Level 0-1)

| Aspekt | Szczegóły |
|--------|-----------|
| **Produkt** | Zaawansowane technologicznie dostawy artykułów spożywczych |
| **Evidence** | Level 0-1: teoretyczny popyt bazujący na trendzie internetowym |
| **Zignorowali** | Testowanie popytu przed skalowaniem (Wizard of Oz MVP zamiast centrów dystrybucyjnych) |
| **Konsekwencje** | Bankructwo 2001, $1.2B strata |

### CNN+ — $300M strata (Level 1)

| Aspekt | Szczegóły |
|--------|-----------|
| **Produkt** | Usługa VOD z programami informacyjnymi |
| **Evidence** | Level 1: wiara we własną markę |
| **Zignorowali** | Past Behavior (Level 2+): 57% konsumentów planowało obcinać subskrypcje, Netflix tracił widzów |
| **Konsekwencje** | Zamknięci po **30 dniach** (!), 150K subskrybentów przy $300M inwestycji |

### Clinkle — $30M strata (Level 1)

| Aspekt | Szczegóły |
|--------|-----------|
| **Produkt** | Aplikacja do płatności mobilnych używająca fal dźwiękowych |
| **Evidence** | Level 1: hype medialny, potężna wczesna runda VC |
| **Zignorowali** | Single-Feature MVP test. Skupili się na "perfekcji" technologicznej |
| **Konsekwencje** | $30M roztrwonione, lata straconego czasu |

### Podsumowanie case studies

| Firma | Strata | Evidence Level | Czego brakowało |
|-------|--------|---------------|-----------------|
| Meta VR | $50B+ | Level 1 | Past Behavior (VR w codziennych zadaniach) |
| Amazon Alexa | $B+ | Level 2 (adopcja) / Level 0 (monetyzacja) | Oddzielny test monetyzacji |
| Quibi | $1.75B | Level 1-2 | Rzeczywiste nawyki konsumpcji treści |
| Juicero | $120M | Level 1-2 | Cash commitment test |
| Webvan | $1.2B | Level 0-1 | Demand validation przed skalowaniem |
| CNN+ | $300M | Level 1 | Subscription fatigue data |
| Clinkle | $30M | Level 1 | Single-feature MVP |

**Łączna strata z powodu niskiego evidence:** > **$53B**

---

## Evidence Levels ↔ Funding Stages

| Stage | Min. Evidence | Co inwestor chce zobaczyć | Typowa kwota |
|-------|---------------|---------------------------|-------------|
| **Pre-seed** | Level 1-3 | Potwierdzenie istnienia "bolesnego" problemu (wywiady, lista oczekujących, wczesny prototyp). Silny Founder-Market Fit. | $50K - $500K |
| **Seed** | Level 4-5 | MVP działający na rynku + wczesna trakcja. Prawdziwe zachowania użytkowników, pierwsze płatności lub wiążące LOI. | $500K - $3M |
| **Series A** | Level 5+ | Cash Level + przewidywalne przychody = twardy PMF. Skalowalna ekonomika jednostkowa (LTV/CAC > 3), powtarzalność sprzedaży, niski churn. | $3M - $15M |
| **Series B+** | Level 5+ | Dominacja rynkowa, obrona przed konkurencją, ekspansja. Stały wzrost MRR/ARR przy wysokiej marży brutto. | $10M - $50M |

---

## Kluczowe cytaty

> "The number one reason startups fail is they have a solution without a problem."
> — **Yasuhiro Yamakawa**, profesor przedsiębiorczości, Babson College

> "If 20 to 40 percent of the internet is fake, then 20 to 40 percent of those clicks
> you're paying for are never going to buy because they're fake."
> — **Jordan Resnick**, Senior Director of Marketing Operations, CHEQ

> "Make sure you are building the right it before you build it right."
> — **Alberto Savoia**, były dyrektor Google, twórca metodyki pretotypingu

> "Data beats opinion and say it with numbers."
> — **Alberto Savoia** — zasada innowacyjna z Google: ucieczka od opinii w kierunku
> wymiernych, weryfikowalnych liczbowo hipotez biznesowych ("XYZ Hypothesis")
