# CLAUDE.md — Product Discovery

> Czytaj ten plik przed wykonaniem jakiejkolwiek pracy w projekcie.
> Architektura systemu: docs/ARCHITECTURE.md. Style guide: docs/style-guide/.

> **Wiki projektu:** `wiki/` — trwała baza wiedzy o decyzjach produktowych i technicznych.
> Przed odpowiedzią na pytania o architekturę, workflow, AI modele — przeczytaj `wiki/index.md`.

---

## Wiki — Zasady dla LLM

1. **Na początku każdej sesji** przeczytaj `wiki/index.md` — daje przegląd dostępnej wiedzy.
2. **Przed odpowiedzią** na pytania o architekturę, protokoły, decyzje AI — sprawdź odpowiednią stronę wiki.
3. **Po każdej sesji** gdzie pojawiła się nowa wiedza — zaktualizuj wiki i dopisz wpis do `wiki/log.md`.
4. **Format wpisu w log.md:** `## [YYYY-MM-DD] typ | opis` (typy: `ingest`, `decision`, `research`, `update`).
5. **Nie pytaj użytkownika** czy zaktualizować wiki — rób to automatycznie gdy jest co zapisać.

---

## Subagents

Spawn subagents to isolate context, parallelize independent work, or offload bulk mechanical tasks. Don't spawn when the parent needs the reasoning, when synthesis requires holding things together, or when spawn overhead dominates.

Pick the cheapest model that can do the subtask well:
- Haiku: bulk mechanical work, no judgment
- Sonnet: scoped research, code exploration, in-scope synthesis
- Opus: subtasks needing real planning or tradeoffs

If a subagent realizes it needs a higher tier than itself, return to the parent.

Parent owns final output and cross-spawn synthesis. User instructions override.

---

## Preferred Tools

### Data Fetching

1. **WebFetch**: free, text-only, works on public pages that don't block bots.
2. **agent-browser CLI**: free, local Rust CLI + Chrome via CDP. For dynamic pages or auth walls that WebFetch can't handle. Returns the accessibility tree with element refs (@e1, @e2). ~82% fewer tokens than screenshot-based tools. Install: `npm i -g agent-browser && agent-browser install`. Use `snapshot` for AI-friendly DOM state, element refs for interaction.
3. **Notice recurring fetch patterns and propose wrapping them as dedicated tools.** When the same fetch/parse logic comes up more than once, suggest wrapping it as a named tool. Add the entry to `## Dedicated Tools` below.

### PDF Files

Use `pdftotext`, not the `Read` tool. Use `Read` only when the user directly asks to analyze images or charts inside the document.

## Dedicated Tools

<!-- List project-specific tools here. -->
