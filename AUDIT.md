# Product Discovery v2.3.0 — Audit Techniczny

> Data: 2026-03-06 | Audytor: Claude Sonnet 4.6
> Przejrzano: 25 plików frontend, 12 plików backend, 5 AGENT.md, discovery_graph.py (740 linii), 8 spec E2E

---

## STATUS POPRAWEK

| ID | Kategoria | Priorytet | Status |
|----|-----------|-----------|--------|
| C1 | SQL Injection w db.py:67 | KRYTYCZNY | ✅ Naprawione |
| C2 | Brak timeout na discovery_task | KRYTYCZNY | ✅ Naprawione |
| C3 | Logout nie działa | KRYTYCZNY | ✅ Naprawione |
| C4 | Memory leak CSV export | KRYTYCZNY | ✅ Naprawione |
| H1 | Retry logic dla agentów | WYSOKI | ✅ Naprawione |
| H2 | Evidence Grading false positives | WYSOKI | ✅ Naprawione |
| H3 | FATAL assumption nie blokuje | WYSOKI | ✅ Naprawione |
| H4 | Error handling ujawnia stacktrace | WYSOKI | ✅ Naprawione |
| H5 | Brak walidacji UUID | WYSOKI | ✅ Naprawione |
| H6 | Brak data-testid | WYSOKI | ⏳ W toku |
| H7 | Report Executive Summary | WYSOKI | ⏳ W toku |
| H8 | AssumptionTable owner+deadline | WYSOKI | ⏳ W toku |
| M1 | Brak paginacji /api/projects | ŚREDNI | ⏳ Planowane |
| M2 | Tempfile leak | ŚREDNI | ⏳ Planowane |
| M3 | Modal filtrów poza viewport | ŚREDNI | ⏳ Planowane |
| M4 | Focus trap MiroExportModal | ŚREDNI | ⏳ Planowane |
| M5 | aria-label icon-only buttons | ŚREDNI | ⏳ Planowane |
| M6 | role=switch na toggle'ach | ŚREDNI | ⏳ Planowane |
| L1 | Kontrast kolorów WCAG AA | NISKI | ⏳ Planowane |
| L2 | Miro Board ID plaintext | NISKI | ⏳ Planowane |

---

## KRYTYCZNE

### [C1] SQL Injection w db.py
**Priorytet:** KRYTYCZNY | **Wysiłek:** S
**Problem:** `backend/db.py:67` — dynamiczne budowanie UPDATE przez string interpolację nazw kolumn.
```python
# PODATNE:
await db.execute(f"UPDATE sessions SET {', '.join(sets)} WHERE id=?", vals)
```
**Rozwiązanie:** Whitelist dopuszczalnych kolumn przed wykonaniem query.
**Pliki:** `backend/db.py:67`

---

### [C2] Brak globalnego timeout na discovery_task
**Priorytet:** KRYTYCZNY | **Wysiłek:** S
**Problem:** Sesja może wisieć w stanie `running` bez limitu czasu gdy API się zawiesi.
**Rozwiązanie:** `asyncio.wait_for(..., timeout=1800)` + obsługa TimeoutError.
**Pliki:** `backend/routes/discovery.py`

---

### [C3] Logout nie działa
**Priorytet:** KRYTYCZNY | **Wysiłek:** XS
**Problem:** `App.tsx:137-155` — żartobliwy popup zamiast wywołania `POST /api/auth/logout`.
**Rozwiązanie:** Wywołaj endpoint, wyczyść store Zustand, nawiguj do `/`.
**Pliki:** `frontend/src/App.tsx`

---

### [C4] Memory leak w CSV export
**Priorytet:** KRYTYCZNY | **Wysiłek:** XS
**Problem:** `Dashboard.tsx:72-82` — `document.body.appendChild(a)` bez `removeChild`, Blob URL bez `revokeObjectURL`.
**Rozwiązanie:** `URL.createObjectURL` + `URL.revokeObjectURL` po kliknięciu.
**Pliki:** `frontend/src/pages/Dashboard.tsx`

---

## WYSOKIE

### [H1] Brak retry logic dla wywołań agentów
**Priorytet:** WYSOKI | **Wysiłek:** M
**Problem:** Każde `await ba_agent.run()` to single-shot — jeden błąd API i węzeł pada.
**Rozwiązanie:** Wrapper z tenacity (3 próby, exponential backoff 2-10s).
**Pliki:** `src/product_discovery/workflows/discovery_graph.py`

---

### [H2] Evidence Grading false positives
**Priorytet:** WYSOKI | **Wysiłek:** M
**Problem:** `_grade_evidence()` — brak word boundaries, hipotetyczne formy ("kupiłby") klasyfikowane jako Level 5.
**Rozwiązanie:** Regex z `\b`, rozdzielenie form przeszłych od warunkowych.
**Pliki:** `src/product_discovery/workflows/discovery_graph.py:356-423`

---

### [H3] FATAL assumption nie blokuje ScorecardNode
**Priorytet:** WYSOKI | **Wysiłek:** S
**Problem:** `AssumptionMapNode` zawsze przechodzi do `ScorecardNode` — nawet z niezwalidowanymi FATAL assumptions.
**Rozwiązanie:** Sprawdź FATAL bez evidence Level 2+ → `UserInputNeededNode`.
**Pliki:** `src/product_discovery/workflows/discovery_graph.py:654`

---

### [H4] Error handling ujawnia stacktrace
**Priorytet:** WYSOKI | **Wysiłek:** S
**Problem:** `raise HTTPException(500, detail=str(e))` — pełny traceback do użytkownika, brak loggingu dla admina.
**Rozwiązanie:** Rozróżnij typy błędów, loguj przez `logger.exception()`, zwróć ogólny komunikat.
**Pliki:** `backend/routes/*.py`

---

### [H5] Brak walidacji UUID dla session_id
**Priorytet:** WYSOKI | **Wysiłek:** XS
**Problem:** `GET /api/discovery/{session_id}` przyjmuje dowolny string. `share_with` bez walidacji emaili.
**Rozwiązanie:** `uuid.UUID(session_id)` + `EmailStr` w Pydantic modelu.
**Pliki:** `backend/routes/discovery.py`, `backend/routes/export.py`

---

### [H6] Brak data-testid — flaky E2E selektory
**Priorytet:** WYSOKI | **Wysiłek:** M
**Problem:** ~40% selektorów bazuje na Tailwind classach — zmiana CSS łamie testy.
**Rozwiązanie:** data-testid na wszystkich interaktywnych elementach + aktualizacja page objects.
**Pliki:** `frontend/src/components/*.tsx`, `frontend/src/pages/*.tsx`, `e2e/pages/*.ts`

---

### [H7] Report.tsx — brak Executive Summary
**Priorytet:** WYSOKI | **Wysiłek:** M
**Problem:** PM scrolluje 2+ ekrany zanim zobaczy verdict. Brak "co dalej?".
**Rozwiązanie:** Sekcja hero z verdict + key insight + next steps na górze raportu.
**Pliki:** `frontend/src/pages/Report.tsx`

---

### [H8] AssumptionTable bez kolumn owner i deadline
**Priorytet:** WYSOKI | **Wysiłek:** S
**Problem:** Brak accountability — kto i kiedy testuje dane założenie.
**Rozwiązanie:** Edytowalne kolumny owner/deadline z persistencją w localStorage.
**Pliki:** `frontend/src/components/AssumptionTable.tsx`, `frontend/src/pages/Report.tsx`

---

## ŚREDNIE

### [M1] Brak paginacji /api/projects
**Priorytet:** ŚREDNI | **Wysiłek:** S
**Problem:** `list_sessions()` pobiera ALL rekordy — przy 1000 sesjach ~5MB JSON.
**Rozwiązanie:** `limit`/`offset` w DB, `page`/`size` w API, infinite scroll w UI.
**Pliki:** `backend/routes/projects.py`, `backend/db.py`, `frontend/src/pages/Dashboard.tsx`

---

### [M2] Tempfile directory leak
**Priorytet:** ŚREDNI | **Wysiłek:** XS
**Problem:** `export.py:69,99` — `tempfile.mkdtemp()` nigdy nie sprzątany.
**Rozwiązanie:** `BackgroundTask(shutil.rmtree, tmp_dir)` po wysłaniu FileResponse.
**Pliki:** `backend/routes/export.py`

---

### [M3] Modal filtrów poza viewport na mobile
**Priorytet:** ŚREDNI | **Wysiłek:** XS
**Problem:** `.right-0 mt-2` wychodzi poza prawą krawędź na małych ekranach.
**Rozwiązanie:** `left-0 right-0 md:left-auto` lub pozycja fixed na mobile.
**Pliki:** `frontend/src/pages/Dashboard.tsx`

---

### [M4] Focus trap w MiroExportModal
**Priorytet:** ŚREDNI | **Wysiłek:** S
**Problem:** Focus nie wraca na trigger po zamknięciu modalu — keyboard user traci orientację.
**Rozwiązanie:** Zapamiętaj trigger ref przed otwarciem, przywróć focus po zamknięciu.
**Pliki:** `frontend/src/components/MiroExportModal.tsx`

---

### [M5] aria-label na icon-only buttons
**Priorytet:** ŚREDNI | **Wysiłek:** S
**Problem:** 20+ przycisków z samymi ikonami bez tekstu dla screen readerów.
**Rozwiązanie:** `aria-label` na każdym + `aria-hidden="true"` na ikonie SVG.
**Pliki:** `frontend/src/pages/Agents.tsx`, `Dashboard.tsx`, `Report.tsx`, `Simulator.tsx`

---

### [M6] role=switch na toggle'ach w Settings
**Priorytet:** ŚREDNI | **Wysiłek:** XS
**Problem:** Custom toggle bez `role="switch"` i `aria-checked` — screen reader czyta "button".
**Rozwiązanie:** Dodaj `role="switch" aria-checked={enabled}` do button elementów.
**Pliki:** `frontend/src/pages/Settings.tsx`

---

## NISKIE

### [L1] Kontrast kolorów poniżej WCAG AA
**Priorytet:** NISKI | **Wysiłek:** XS
**Problem:** `#7A9BB0` na `#0D2535` w sidebar = ratio ~3.5:1 (wymagane 4.5:1).
**Rozwiązanie:** Zmień na `#8BB5CC` lub ciemniejszy wariant.
**Pliki:** `frontend/src/App.tsx`, `frontend/tailwind.config.ts`

---

### [L2] Miro Board ID zwracane plaintext
**Priorytet:** NISKI | **Wysiłek:** XS
**Problem:** `SettingsResponse` ujawnia `miro_board_id` w JSON odpowiedzi API.
**Rozwiązanie:** Zwróć tylko `miro_configured: bool`.
**Pliki:** `backend/routes/settings.py`

---

## Uwagi architekturalne (bez ticketów)

1. **PM Agent nie wpływa na Scorecard** — wyliczenia proceduralne zamiast wywołania `pm_agent.run()`
2. **InterviewCoachNode brakuje w grafie** — AGENT.md opisuje pętlę iteracyjną której nie ma
3. **`mode` param ignorowany** — trzy tryby CLI/API są faktycznie identyczne w grafie
4. **OSINT Researcher brak web endpointu** — dostępny tylko pośrednio przez BA agenta
5. **Forces Diagram string-search** — `"switch_unlikely"` w reasoning zamiast parsed scores 1-10
