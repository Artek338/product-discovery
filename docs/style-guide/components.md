# Komponenty UI

> Kompletna specyfikacja wszystkich komponentów reużywalnych w Product Builderze.
> Każdy komponent zawiera: opis, klasy Tailwind, warianty, stany.

---

## 1. Przyciski (Buttons)

### Wspólne atrybuty

```
inline-flex items-center justify-center gap-2
rounded-[8px]
text-sm font-semibold font-sans
transition-colors
```

### Warianty

#### Primary (`.btn-primary`)

```css
bg-[#14B8A6] text-[#FFFFFF]
px-5 py-[10px]
hover:bg-[#2DD4BF]
focus:outline-none focus:ring-2 focus:ring-[#14B8A6]
disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] disabled:cursor-not-allowed
```

#### Secondary (`.btn-secondary`)

```css
bg-[#FFFFFF] text-[#14B8A6]
px-5 py-[9px]
border border-[#14B8A6]
hover:bg-[#CCFBF1]
focus:outline-none focus:ring-2 focus:ring-[#14B8A6]
```

> `py-[9px]` zamiast `py-[10px]` — kompensacja 1px border.

#### Ghost (`.btn-ghost`)

```css
bg-[#CCFBF1] text-[#0D9488]
px-5 py-[10px]
hover:bg-[#14B8A6] hover:text-[#FFFFFF]
focus:outline-none
```

#### Danger (`.btn-danger`)

```css
bg-[#EF4444] text-[#FFFFFF]
px-5 py-[10px]
hover:bg-[#DC2626]
focus:outline-none focus:ring-2 focus:ring-[#EF4444]
```

### Loading state (w buttonie)

```html
<span class="flex items-center gap-2">
  <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
  Ładowanie...
</span>
```

---

## 2. Inputy (Form Fields)

### Klasa `.input`

```css
w-full
rounded-[8px]
border border-[#E2E8F0]
px-[14px] py-[10px]
text-sm font-sans text-[#0D2535]
bg-[#FFFFFF]
placeholder:text-[#94A3B8]
focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-[#14B8A6] focus:bg-[#F0FDFA]
disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:border-[#E2E8F0]
transition-colors
```

### Dark mode input

```css
dark:bg-[#111111] dark:border-[#333333] dark:text-slate-200 dark:placeholder:text-slate-600
```

### Input z ikoną (API key pattern)

```
Container: relative
Icon: absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400
Input: pl-9 pr-10  (aby zrobić miejsce na ikonę i toggle)
Toggle btn: absolute right-3 top-1/2 -translate-y-1/2
```

### Select

Identyczne style jak input, z dodanym `cursor-pointer`.

### Search pill (header)

```css
flex items-center gap-3
px-4 py-2.5
rounded-full
bg-white dark:bg-[#1A1A1A]
shadow-sm
border border-[#E2E8F0] dark:border-[#333333]
```

---

## 3. Karty (Cards)

### Główna karta

```css
bg-white dark:bg-[#1A1A1A]
rounded-2xl
p-6
shadow-sm
border border-[#E2E8F0] dark:border-[#333333]
transition-colors
```

### Nagłówek karty

```css
font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-lg
```

### Karty statystyk (KPI)

```css
/* Duży numer */
text-6xl font-sans font-bold leading-none text-[#0D2535] dark:text-slate-100

/* Akcentowana wartość */
text-xl font-semibold text-[#14B8A6]

/* Etykieta */
text-xs text-slate-500 dark:text-slate-400

/* Dzielnik pionowy */
border-x border-[#E2E8F0] dark:border-[#333333] px-6
```

### Sub-karta (usage stats)

```css
p-4 rounded-xl
border border-slate-100 dark:border-[#333333]
bg-slate-50/50 dark:bg-[#111111]
```

---

## 4. Badge'y

### Wspólne

```css
inline-flex items-center gap-1.5
px-3 py-1.5
rounded-full
text-xs font-semibold font-sans
```

### Discovery Mode Badges

| Tryb | BG | Tekst | Klasa |
|---|---|---|---|
| Auto | `#EDE9FE` | `#8B5CF6` | `.badge-mode-auto` |
| Problem | `#FFF7ED` | `#F97316` | `.badge-mode-problem` |
| Solution | `#F0FDFA` | `#0D9488` | `.badge-mode-solution` |
| Simulate | `#EFF6FF` | `#3B82F6` | `.badge-mode-simulate` |

### Status Badges

| Status | BG | Tekst | Klasa |
|---|---|---|---|
| Running | `#DCFCE7` | `#15803D` | `.badge-status-running` |
| Completed | `#F1F5F9` | `#475569` | `.badge-status-completed` |
| Failed | `#FEE2E2` | `#DC2626` | `.badge-status-failed` |
| Queued | `#FEF3C7` | `#B45309` | `.badge-status-queued` |

### Verdict Badge

```css
inline-flex items-center
rounded-[12px]
border
font-bold font-mono
/* Rozmiary: */
sm: text-xs px-2.5 py-1
md: text-sm px-3 py-1.5
lg: text-base px-4 py-2 font-bold
```

### Mini status badge (Settings)

```css
/* OK */
flex items-center gap-1 text-xs font-sans font-medium
text-emerald-600 dark:text-emerald-400
bg-emerald-50 dark:bg-emerald-900/30
px-2 py-0.5 rounded-full

/* Not OK */
text-slate-400 dark:text-slate-500
bg-slate-50 dark:bg-[#2A2A2A]
px-2 py-0.5 rounded-full
```

### Quality Badge (Chat)

```css
inline-flex items-center gap-1.5
text-[11px] font-sans font-semibold
px-2.5 py-1
rounded-full border

/* Warianty: */
genuine:    bg-emerald-50  text-emerald-700  border-emerald-100
detailed:   bg-blue-50     text-blue-700     border-blue-100
polite_lie: bg-red-50      text-red-700      border-red-100
vague:      bg-amber-50    text-amber-700    border-amber-100
```

---

## 5. Sidebar

### Container

```css
width: 256px  (w-64)
height: 100vh  (h-screen)
background: #0D2535
position: sticky top-0
display: flex flex-col
```

### Logo

```css
px-6 pt-6 pb-6 mb-2
/* Logo box */
w-8 h-8 rounded bg-[#14B8A6] text-[#0D2535] font-bold text-sm
/* Text */
font-mono font-bold text-white text-base tracking-wide leading-tight
/* Accent word: */ color: #14B8A6
```

### Nav item

```css
flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-sans transition-all duration-200

/* Aktywny: */
text-white font-medium bg-[#14B8A6]/20
border-left: 3px solid #14B8A6

/* Nieaktywny: */
color: #8BB5CC
border-left: 3px solid transparent
font-normal
hover:text-white hover:bg-white/5
```

### Section separator

```css
pt-4 pb-1
text-[10px] font-semibold uppercase tracking-widest text-[#4A7090]
px-4 mb-1
```

### Mobile bottom nav

```css
md:hidden fixed bottom-0 left-0 right-0 z-50
flex items-center justify-around
px-2 py-3
bg-[#0D2535]
border-t border-[#1E3A5F]

/* Nav item: */
flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-sans
Active: text-[#14B8A6] font-medium
Inactive: text-[#8BB5CC] font-normal
```

---

## 6. Top Header

```css
height: 80px  (h-20)
flex items-center justify-end
px-4 md:px-8
bg-[#F8FAFC] dark:bg-[#111111]
border-b border-transparent dark:border-[#333333]/50
transition-colors
```

### Icon buttons

```css
w-10 h-10 rounded-full
flex items-center justify-center
hover:bg-white dark:hover:bg-[#222222]
transition-colors
/* Icon color: */ text-[#0D2535] dark:text-slate-300
```

### Avatar

```css
w-10 h-10 rounded-full
bg-[#14B8A6] text-white
text-xs font-mono font-bold
shadow-sm
```

---

## 7. Tabele (Data Tables)

### Header

```css
/* Row: */
border-b border-[#E2E8F0] dark:border-[#333333]

/* Cell: */
py-4 px-4
text-xs font-semibold text-slate-400 font-sans tracking-wide
```

### Body

```css
/* Row: */
border-b border-[#F1F5F9] dark:border-[#333333]/60
last:border-0
hover:bg-slate-50 dark:hover:bg-[#222222]
transition-colors cursor-pointer

/* Cell: */
py-4 px-4
text-sm text-slate-500 dark:text-slate-400 font-sans

/* Link cell: */
font-sans font-medium text-[#0D2535] dark:text-slate-100
hover:text-[#14B8A6] transition-colors
```

### Checkbox

```css
rounded border-slate-300 w-4 h-4 cursor-pointer accent-[#14B8A6]
```

### Empty state (no data)

```css
py-10 text-center text-slate-400 text-sm font-sans
/* Link: */ text-[#14B8A6] hover:underline
```

---

## 8. Modale

### Backdrop

```css
fixed inset-0 z-50
flex items-center justify-center p-4
background-color: rgba(13, 37, 53, 0.6)  /* sidebar color @ 60% */
```

### Container

```css
bg-white rounded-[12px]
border border-[#E2E8F0]
w-full max-w-md
shadow-xl
```

### Header

```css
flex items-center justify-between
px-6 py-4
border-b border-[#E2E8F0]
/* Title: */ font-mono font-bold text-[#0D2535]
/* Icon: */ color: #14B8A6
/* Close: */ text-slate-400 hover:text-[#0D2535]
```

### Body

```css
p-6 space-y-4
```

### Footer

```css
flex gap-3 pt-4 justify-end
border-t border-[#E2E8F0]
```

---

## 9. Toggle Switch

### Standard (małe, Settings)

```css
/* Track: */
w-10 h-5 rounded-full transition-colors
OFF: bg-slate-300 dark:bg-slate-600
ON:  bg-[#14B8A6]

/* Thumb: */
absolute top-0.5 left-0.5
w-4 h-4 rounded-full bg-white shadow
transition-transform
ON: translate-x-5
```

### Large (Miro modal)

```css
/* Track: */
w-11 h-6 rounded-full

/* Thumb: */
w-5 h-5 rounded-full bg-white shadow
ON: translate-x-5
```

### Wariant pomarańczowy (Mock mode)

```css
ON: bg-orange-400
```

---

## 10. Chat Bubbles

### User message

```css
bg-[#14B8A6] text-white
rounded-2xl rounded-br-sm
px-5 py-3.5
text-sm font-sans leading-relaxed shadow-sm
```

### Assistant message

```css
bg-white border border-[#E2E8F0] text-[#0D2535]
rounded-2xl rounded-bl-sm
px-5 py-3.5
text-sm font-sans leading-relaxed shadow-sm
```

### Assistant avatar

```css
w-6 h-6 rounded-full
bg-white border border-[#E2E8F0]
text-[10px] shadow-sm
```

### Chat header

```css
px-6 py-4
border-b border-[#E2E8F0]
bg-white rounded-t-2xl
shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]
/* Name: */ text-sm font-sans font-bold text-[#0D2535]
/* Status: */ text-xs text-slate-500 + w-1.5 h-1.5 rounded-full bg-emerald-500
```

### Chat input

```css
/* Outer: */
p-4 border-t border-[#E2E8F0] bg-white rounded-b-2xl

/* Input wrapper: */
flex gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1.5
focus-within:border-[#14B8A6] focus-within:ring-1 focus-within:ring-[#14B8A6]

/* Input: */
flex-1 bg-transparent px-4 py-2 outline-none font-sans text-sm text-[#0D2535]

/* Send button: */
w-10 h-10 rounded-lg bg-[#14B8A6] hover:bg-[#0D9488]
text-white disabled:opacity-50
```

### Typing indicator

```css
/* 3 dots: */
w-2 h-2 rounded-full bg-[#14B8A6] animate-bounce
/* Staggered: */ animation-delay: 0s, 0.15s, 0.30s
```

---

## 11. Alerty / Error Boxes

### Error alert

```css
rounded-lg
bg-red-50 dark:bg-red-900/20
border border-red-200 dark:border-red-800/50
text-sm text-red-700 dark:text-red-400
font-sans
flex items-center gap-2
p-3
```

### Error inline (modal)

```css
rounded-[8px]
border border-[#FCA5A5]
bg-[#FEE2E2]
p-3
text-sm text-[#DC2626] font-sans
```

### Info hint box

```css
p-3 rounded-lg
bg-slate-50 dark:bg-[#111111]
border border-slate-200 dark:border-[#333333]
text-xs text-slate-500 dark:text-slate-400 font-sans
```

### Success result

```css
rounded-[8px]
border border-[#86EFAC]
bg-[#DCFCE7]
p-4 space-y-3
```

---

## 12. Banner (Onboarding)

```css
mb-6 rounded-2xl overflow-hidden shadow-sm transition-colors
border border-[#14B8A6]/25 dark:border-[#14B8A6]/15
bg-gradient-to-br from-teal-50/70 to-white dark:from-[#0D2535]/30 dark:to-[#1A1A1A]
```

### Collapsible header

```css
w-full flex items-center justify-between
px-6 py-4 text-left
hover:bg-teal-50/50 dark:hover:bg-white/[0.03]
```

### Badge (tag)

```css
text-xs font-semibold bg-[#14B8A6] text-white px-2.5 py-0.5 rounded-full leading-5
```

### Numbered step

```css
w-5 h-5 rounded-full bg-[#14B8A6] text-white text-xs
flex items-center justify-center font-semibold
```

### Bullet point

```css
text-[#14B8A6] font-bold leading-5  /* · character */
```

### Key concept label

```css
text-xs font-semibold text-[#14B8A6] font-sans mb-0.5
```

---

## 13. Section Header (Settings)

```css
flex items-center gap-3 mb-5

/* Icon box: */
w-8 h-8 rounded-lg flex items-center justify-center
/* Icon: */ size={16}

/* Title: */
font-sans font-semibold text-[#0D2535] dark:text-slate-100

/* Optional badge inline */
```

### Warianty ikon

| Typ | Icon BG | Icon Color |
|---|---|---|
| Default (teal) | `bg-[#F0FDFA] dark:bg-teal-900/30` | `#14B8A6` |
| Warning | `bg-yellow-50 dark:bg-yellow-900/20` | `#F59E0B` |
| Purple | `bg-purple-50 dark:bg-purple-900/20` | `#7C3AED` |
| Blue | `bg-blue-50 dark:bg-blue-900/20` | `#3B82F6` |
| Orange | `bg-orange-50 dark:bg-orange-900/20` | `#F59E0B` |

---

## 14. Dropdown menu

```css
/* Container: */
absolute right-0 mt-2
bg-white dark:bg-[#1A1A1A]
rounded-lg shadow-lg
border border-[#E2E8F0] dark:border-[#333333]
py-1 z-10

/* Item: */
w-full text-left
px-4 py-2
text-sm text-[#0D2535] dark:text-slate-300
hover:bg-slate-50 dark:hover:bg-[#2A2A2A]

/* Active item: */
text-[#14B8A6] font-medium

/* Section separator: */
px-4 py-1 text-xs font-semibold text-slate-400 mt-1 uppercase
```

### Responsive override (mobile)

```css
max-sm:left-0 max-sm:right-auto
```

---

## 15. Donut / Ring Charts

### Donut (conic-gradient)

```css
relative w-36 h-36 rounded-full
background: conic-gradient(
  #14B8A6 0% ${completedPct}%,
  #FF8A65 ${completedPct}% ${completedPct + failedPct}%,
  #FBBF24 ${completedPct + failedPct}% 100%
)

/* Center cutout: */
absolute inset-0 m-auto w-24 h-24 bg-white dark:bg-[#1A1A1A] rounded-full

/* Empty state: */ background: #F1F5F9
```

### Ring (SVG stroke)

```css
/* Track: */
cx=50 cy=50 r=42 stroke=#F1F5F9 strokeWidth=6 fill=none

/* Value: */
stroke={color} strokeWidth=6 fill=none
strokeDasharray=264 strokeDashoffset={264 - (pct/100)*264}

/* Container: */ w-20 h-20, transform -rotate-90
```

### Legend dot

```css
w-2.5 h-2.5 rounded-full bg-{color}
```

---

## 16. Log / Terminal Output

```css
rounded-[8px] p-3
max-h-40 overflow-y-auto
background: #0D2535
/* Text: */ text-xs font-mono leading-5 color: #2DD4BF
```

---

## 17. Language Selector (Settings)

```css
/* Option button: */
flex-1 py-3 rounded-xl border-2 text-sm font-sans font-semibold transition-all

/* Active: */
border-[#14B8A6] bg-[#F0FDFA] dark:bg-teal-900/30 text-[#0D9488] dark:text-teal-400

/* Inactive: */
border-[#E2E8F0] dark:border-[#333333]
bg-white dark:bg-[#111111]
text-slate-500 dark:text-slate-400
hover:border-[#CCFBF1] dark:hover:border-teal-900/50
```

---

## 18. Tooltip / Popover (Logout)

```css
absolute bottom-20 left-4 z-50 w-72
bg-white dark:bg-[#1A1A1A]
rounded-xl shadow-xl overflow-hidden
border border-[#E2E8F0] dark:border-[#333333]
p-5
```
