# Dark Mode

---

## Strategia

- **Mechanizm:** Klasa `dark` na elemencie `<html>` (Tailwind `darkMode: 'class'`)
- **Toggle:** Przełącznik w top header (ikona Moon/Sun)
- **Persistencja:** Stan zapisywany w store (Zustand)
- **Przejścia:** `transition-colors` na KAŻDYM elemencie, który zmienia kolor

---

## Mapowania Light → Dark

### Tła (Backgrounds)

| Element | Light | Dark |
|---|---|---|
| Body | `#EFF2F7` | `#111111` |
| Content area | `#F8FAFC` | `#141414` |
| Cards | `#FFFFFF` | `#1A1A1A` |
| Input bg | `#FFFFFF` | `#111111` |
| Hover bg (dropdown, row) | `slate-50` | `#2A2A2A` |
| Hover bg (header icons) | `white` | `#222222` |
| Sub-card bg | `slate-50/50` | `#111111` |
| Chat bg | `#F8FAFC` | — |

### Borders

| Element | Light | Dark |
|---|---|---|
| Card border | `#E2E8F0` | `#333333` |
| Input border | `#E2E8F0` | `#333333` |
| Table row border | `#F1F5F9` | `#333333/60` |
| Header bottom border | `transparent` | `#333333/50` |
| Banner border | `#14B8A6/25` | `#14B8A6/15` |

### Tekst

| Element | Light | Dark |
|---|---|---|
| Primary text | `#0D2535` | `slate-100` |
| Secondary text | `slate-500` | `slate-400` |
| Muted / hint | `slate-400` | `slate-500` |
| Placeholder | `#94A3B8` | `slate-600` |
| Disabled text | `#94A3B8` | `slate-500` |

### Ikony

| Element | Light | Dark |
|---|---|---|
| Default icon | `text-slate-400` | `text-slate-500` |
| Header icons | `text-[#0D2535]` | `text-slate-300` |

### Stany semantyczne (badge BG w dark)

| Badge type | Dark BG |
|---|---|
| Emerald (status OK) | `emerald-900/30` |
| Teal (section icon) | `teal-900/30` |
| Yellow (warning) | `yellow-900/20` |
| Purple (integration) | `purple-900/20` |
| Blue (info) | `blue-900/20` |
| Orange (mock) | `orange-900/20` / `orange-900/30` |
| Red (error alert) | `red-900/20` |

### Gradienty

| Element | Light | Dark |
|---|---|---|
| Banner bg | `from-teal-50/70 to-white` | `from-[#0D2535]/30 to-[#1A1A1A]` |
| Banner hover | `bg-teal-50/50` | `bg-white/[0.03]` |

### Toggle

| Element | Light | Dark |
|---|---|---|
| Toggle OFF track | `bg-slate-300` | `bg-slate-600` |
| Toggle ON track | `bg-[#14B8A6]` | `bg-[#14B8A6]` (same) |
| Toggle thumb | `bg-white` | `bg-white` (same) |

---

## Wzorce implementacyjne

### Karta (najczęstszy wzorzec)

```css
bg-white dark:bg-[#1A1A1A]
border border-[#E2E8F0] dark:border-[#333333]
transition-colors
```

### Input

```css
bg-white dark:bg-[#111111]
border border-[#E2E8F0] dark:border-[#333333]
text-[#0D2535] dark:text-slate-200
placeholder:text-slate-400 dark:placeholder:text-slate-600
```

### Dropdown item

```css
text-[#0D2535] dark:text-slate-300
hover:bg-slate-50 dark:hover:bg-[#2A2A2A]
```

### Error alert

```css
bg-red-50 dark:bg-red-900/20
border border-red-200 dark:border-red-800/50
text-red-700 dark:text-red-400
```

### Mini badge (Settings)

```css
text-emerald-600 dark:text-emerald-400
bg-emerald-50 dark:bg-emerald-900/30
```

---

## Kolory — Dark Mode Hex Reference

| Nazwa | Hex | Użycie |
|---|---|---|
| `#111111` | Dark body / input bg | Najciemniejszy |
| `#141414` | Dark content area bg | Główna treść |
| `#1A1A1A` | Dark card bg | Karty, modala, dropdown |
| `#222222` | Dark header icon hover | Delikatny hover |
| `#2A2A2A` | Dark dropdown/row hover | Interakcja |
| `#333333` | Dark border | Standardowy border |

> **Skala ciemności:** `#111111` → `#141414` → `#1A1A1A` → `#222222` → `#2A2A2A` → `#333333`

---

## Reguła „donut cutout"

W dark mode, wewnętrzny okrąg donut charta musi zmieniać tło na kolor karty:

```css
bg-white dark:bg-[#1A1A1A] rounded-full transition-colors
```
