# Typografia

---

## 1. Fonty

### Sans — Geist (główny font UI)

```
font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
```

- **Użycie:** Body text, paragrafy, etykiety, nagłówki sekcji, przyciski, inputy, badge'y
- **Instalacja:** `npm install @fontsource/geist` lub Google Fonts
- **Tailwind:** `font-sans`

### Mono — JetBrains Mono

```
font-family: 'JetBrains Mono', ui-monospace, monospace;
```

- **Użycie:** Logo, tytuły modali, werdykty, pola kodowe (API keys), logi terminala
- **Instalacja:** `npm install @fontsource/jetbrains-mono` lub Google Fonts
- **Tailwind:** `font-mono`

---

## 2. Hierarchia nagłówków

| Element | Font | Weight | Size | Kolor | Klasa Tailwind |
|---|---|---|---|---|---|
| **H1 — Tytuł strony** | Geist (sans) | 600 (semibold) | `1.5rem` (24px) | `#0D2535` / `dark:slate-100` | `text-2xl font-sans font-semibold text-[#0D2535] dark:text-slate-100` |
| **H2 — Nagłówek sekcji** | Geist (sans) | 600 | `1.125rem` (18px) | `#0D2535` / `dark:slate-100` | `text-lg font-sans font-semibold text-[#0D2535] dark:text-slate-100` |
| **H3 — Podsekcja** | Geist (sans) | 600 | `0.875rem` (14px) | `#0D2535` / `dark:slate-100` | `text-sm font-sans font-semibold text-[#0D2535] dark:text-slate-100` |
| **H4 / Inline heading** | Geist (sans) | 600 | `0.875rem` (14px) | `#0D2535` / `dark:slate-100` | `text-sm font-sans font-semibold text-[#0D2535] dark:text-slate-100` |
| **Tytuł modala** | JetBrains Mono | 700 (bold) | `1rem` (16px) | `#0D2535` | `font-mono font-bold text-[#0D2535]` |
| **Logo** | JetBrains Mono | 700 | `1rem` (16px) | `#FFFFFF` + `#14B8A6` | `font-mono font-bold text-white` |

> **Reguła CSS:** W `index.css` zdefiniowane jest `h1–h6 { @apply font-mono }`, ale w praktyce większość komponentów nadpisuje to jawnie na `font-sans`. `font-mono` jest zarezerwowany dla logo, werdyktów i tytułów modali.

---

## 3. Rozmiary tekstu (body)

| Rola | Size | Klasa | Weight |
|---|---|---|---|
| Body / paragraf | 14px | `text-sm` | `font-normal` (400) |
| Etykieta formularza | 14px | `text-sm` | `font-semibold` (600) |
| Etykieta formularza (med) | 14px | `text-sm` | `font-medium` (500) |
| Badge tekst | 12px | `text-xs` | `font-semibold` (600) |
| Podpowiedź / hint | 12px | `text-xs` | `font-normal` (400) |
| Mini badge (quality) | 11px | `text-[11px]` | `font-semibold` (600) |
| Nav section label | 10px | `text-[10px]` | `font-semibold` (600) |
| Disclaimer / legal | 10px | `text-[10px]` | `font-medium` (500) |

---

## 4. Kolory tekstu

| Rola | Light | Dark | Klasa |
|---|---|---|---|
| Primary text | `#0D2535` | `slate-100` | `text-[#0D2535] dark:text-slate-100` |
| Secondary text | `slate-500` | `slate-400` | `text-slate-500 dark:text-slate-400` |
| Disabled / placeholder | `#94A3B8` (slate-400) | `slate-600` | `text-[#94A3B8]` / `placeholder:text-[#94A3B8]` |
| Muted text | `slate-400` | `slate-500` | `text-slate-400 dark:text-slate-500` |
| White (na ciemnym tle) | `#FFFFFF` | — | `text-white` |
| Accent text | `#14B8A6` | `teal-400` | `text-[#14B8A6]` |
| Link hover | `#14B8A6` | `#14B8A6` | `hover:text-[#14B8A6]` |

---

## 5. Line height & Spacing

| Element | Line height | Klasa |
|---|---|---|
| Body tekst | relaxed (1.625) | `leading-relaxed` |
| Nagłówki | tight (1.25) | `leading-tight` |
| Big numbers (KPI) | none (1) | `leading-none` |
| Badge | 5 (1.25rem) | `leading-5` |

---

## 6. Letter spacing

| Element | Spacing | Klasa |
|---|---|---|
| Logo | wide | `tracking-wide` |
| Nav section labels | widest | `tracking-widest` |
| Table headers | wide | `tracking-wide` |
| Body text | default | — |

---

## 7. Text transform

| Element | Transform |
|---|---|
| Nav section labels | `uppercase` |
| Table headers (opcjonalnie) | `uppercase` |
| Capitalize | `capitalize` na trybach (mode names) |
| Insight labels | `uppercase` + `tracking-wide` + `text-[10px]` |
