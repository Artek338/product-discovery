# Layout & Spacing

---

## 1. Page Layout

### Desktop (≥ 768px)

```
┌──────────┬──────────────────────────────────────────┐
│          │  Top Header (h-20)                       │
│  Sidebar │─────────────────────────────────────────────│
│  w-64    │                                          │
│  sticky  │  Main Content                            │
│  top-0   │  p-8                                     │
│  h-screen│  max-w-[1600px] mx-auto                  │
│          │                                          │
│  #0D2535 │  #F8FAFC / dark:#141414                  │
└──────────┴──────────────────────────────────────────┘
```

```css
/* Root layout: */
flex min-h-screen flex-col md:flex-row

/* Content area: */
flex-1 flex flex-col min-h-screen
bg-[#F8FAFC] dark:bg-[#141414]
w-full overflow-x-hidden
transition-colors

/* Main: */
flex-1 overflow-auto
```

### Mobile (< 768px)

```
┌──────────────────────────────┐
│  Top Header (h-20)          │
├──────────────────────────────┤
│                              │
│  Content (p-4)               │
│  pb-16                       │
│                              │
├──────────────────────────────┤
│  Bottom Nav (fixed)          │
│  bg-[#0D2535]                │
└──────────────────────────────┘
```

---

## 2. Content Widths

| Kontekst | Max width | Klasa |
|---|---|---|
| Dashboard (karty + tabela) | 1600px | `max-w-[1600px] mx-auto` |
| Settings | 672px | `max-w-2xl mx-auto` |
| Chat | bez limitu | `flex flex-col h-full` |
| Modal | 448px | `max-w-md` (Tailwind md) |

---

## 3. Spacing Scale

### Padding strony

| Breakpoint | Padding | Klasa |
|---|---|---|
| Mobile | 16px | `p-4` |
| Desktop | 32px | `md:p-8` |

### Padding wewnętrzny

| Element | Wartość | Klasa |
|---|---|---|
| Karta | 24px | `p-6` |
| Modal body | 24px | `p-6` |
| Modal header | 24px / 16px | `px-6 py-4` |
| Sidebar logo | 24px / 24px | `px-6 pt-6 pb-6` |
| Sidebar nav | 16px | `px-4` |
| Nav item | 16px / 12px | `px-4 py-3` |
| Button (primary) | 20px / 10px | `px-5 py-[10px]` |
| Input | 14px / 10px | `px-[14px] py-[10px]` |
| Badge | 12px / 6px | `px-3 py-1.5` |
| Table cell | 16px / 16px | `py-4 px-4` |
| Chat bubble | 20px / 14px | `px-5 py-3.5` |

### Gap

| Kontekst | Wartość | Klasa |
|---|---|---|
| Grid kart | 24px | `gap-6` |
| Między sekcjami (Settings) | 24px | `space-y-6` |
| Elementy w buttonnie | 8px | `gap-2` |
| Nav items | 4px | `space-y-1` |
| Badge content | 6px | `gap-1.5` |
| Elementy headerowej grupy | 16–24px | `gap-4 md:gap-6` |
| Form fields wewnątrz | 12px | `space-y-3` |
| Chat messages | 24px | `space-y-6` |
| Section header elements | 12px | `gap-3` |

### Margin-bottom

| Element | Wartość | Klasa |
|---|---|---|
| Page title → content | 32px | `mb-8` |
| Section header → content | 20px | `mb-5` |
| Card group → next section | 24px | `mb-6` |
| Label → input | 6px | `mb-1.5` |
| Description → form | 16px | `mb-4` |

---

## 4. Border Radius

| Token | Wartość | Użycie |
|---|---|---|
| None | 0 | — |
| `rounded` | 4px | Logo icon box |
| `rounded-lg` | 8px | Nav items, dropdown, inputs, action buttons |
| `rounded-xl` | 12px | Sub-cards, chat input wrapper, usage stats card |
| `rounded-[12px]` | 12px | Modals, werdykty (explicit) |
| `rounded-2xl` | 16px | Karty główne, chat container, banner |
| `rounded-full` | 9999px | Avatary, badge pill, donut chart, search pill, toggle track |

---

## 5. Shadows

| Element | Shadow |
|---|---|
| Karty, bannery | `shadow-sm` |
| Dropdown menu | `shadow-lg` |
| Modal container | `shadow-xl` |
| Chat header | `shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]` |
| Avatar, mini badge | `shadow-sm` |

---

## 6. Gridy

### Dashboard — 3 stat cards

```css
grid grid-cols-1 lg:grid-cols-3 gap-6
```

### Onboarding banner — 3 kolumny

```css
grid grid-cols-1 md:grid-cols-3 gap-6
```

### Usage stats — 3 metryki

```css
grid grid-cols-1 md:grid-cols-3 gap-4
```

### Language selector — 2 opcje

```css
flex gap-3
/* Każdy button: */ flex-1
```

---

## 7. Responsive Breakpoints

| Breakpoint | Min-width | Zachowanie |
|---|---|---|
| Default (mobile) | 0 | Sidebar ukryty, bottom nav widoczny, 1-kolumnowe gridy, padding `p-4` |
| `sm` | 640px | Dropdowny: `left-0` → `right-0`, table search szerzsze |
| `md` | 768px | Sidebar sticky obok contentu, padding `p-8`, 3-kolumnowy onboarding |
| `lg` | 1024px | 3-kolumnowe stat cards |

### Wzorce responsywne

```css
/* Sidebar desktop-only: */
hidden md:flex

/* Mobile bottom nav: */
md:hidden fixed bottom-0

/* Padding: */
p-4 md:p-8

/* Flex direction: */
flex-col md:flex-row

/* Dropdown positioning: */
max-sm:left-0 max-sm:right-auto

/* Grid columns: */
grid-cols-1 lg:grid-cols-3
grid-cols-1 md:grid-cols-3
```

---

## 8. Z-index

| Element | Z-index |
|---|---|
| Modal backdrop | `z-50` |
| Mobile bottom nav | `z-50` |
| Dropdown menu | `z-10` |
| Chat header/input | `z-10` |

---

## 9. Overflow

| Element | Overflow |
|---|---|
| Body | `overflow-x: hidden` |
| Content container | `overflow-x-hidden` |
| Main area | `overflow-auto` |
| Table container | `overflow-x-auto` |
| Chat messages | `overflow-y-auto` |
| Log box | `max-h-40 overflow-y-auto` |
| Scrollbar hidden | `.hide-scrollbar` (custom utility — `scrollbar-width: none`) |
