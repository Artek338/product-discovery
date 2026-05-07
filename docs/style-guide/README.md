# Product Builder — Design System & Style Guide

> **Cel:** Kompletna dokumentacja systemu wizualnego Product Buildera.
> Przekaż ten folder (`docs/style-guide/`) do dowolnego agenta lub zespołu, aby odtworzyli ten sam look & feel.

---

## 📁 Struktura plików

| Plik | Opis |
|---|---|
| [`colors.md`](./colors.md) | Pełna paleta kolorów — brand, semantic, surfaces, verdict, dark mode |
| [`typography.md`](./typography.md) | Fonty, hierarchia nagłówków, rozmiary tekstu |
| [`components.md`](./components.md) | Specyfikacja 16 komponentów UI z klasami Tailwind |
| [`layout.md`](./layout.md) | Spacing, gridy, border-radius, responsive breakpoints |
| [`dark-mode.md`](./dark-mode.md) | Strategia dark mode — mapowania light → dark |
| [`tokens.css`](./tokens.css) | Wszystkie tokeny jako CSS custom properties |
| [`tokens.json`](./tokens.json) | Tokeny w formacie JSON (machine-readable) |
| [`tailwind-preset.ts`](./tailwind-preset.ts) | Gotowy Tailwind preset — drop-in do nowego projektu |
| [`component-classes.css`](./component-classes.css) | Reusable CSS component classes (btn, input, badge, card) |

---

## ⚡ Quick Start (dla nowego projektu)

```bash
# 1. Zainstaluj fonty
npm install @fontsource/geist @fontsource/jetbrains-mono

# 2. Zainstaluj ikony
npm install lucide-react

# 3. Skopiuj preset do tailwind.config.ts
#    → użyj tailwind-preset.ts z tego folderu

# 4. Skopiuj component-classes.css do swojego index.css
#    → lub zaimportuj: @import './docs/style-guide/component-classes.css';
```

---

## 🎨 Zasady nadrzędne

1. **Kolor główny to Teal `#14B8A6`** — akcenty, CTA, focus rings, aktywne stany
2. **Dwa fonty:** Geist (body/UI) + JetBrains Mono (logo, werdykty, kod)
3. **Dark mode via klasy** — `darkMode: 'class'` w Tailwindzie, `dark:` prefix
4. **Transition na wszystkim** — `transition-colors` na każdym interaktywnym elemencie
5. **Lucide React** jako jedyna biblioteka ikon
6. **Sidebar ciemny `#0D2535`**, treść jasna `#F8FAFC` → dark `#141414`
7. **Karty:** `rounded-2xl shadow-sm border` — zawsze z border, nigdy sam cień
8. **Badge'y pill:** `rounded-full` z kolorowym tłem + ciemniejszym tekstem
