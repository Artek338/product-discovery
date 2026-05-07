# Paleta kolorów

---

## 1. Brand — Teal (Primary)

Teal to główny kolor marki. Używany na przyciskach CTA, focus ringach, aktywnych linkach, avatarach, postępach.

| Token | Hex | RGB | Rola |
|---|---|---|---|
| `teal-100` | `#CCFBF1` | `204, 251, 241` | Tło focusu inputów, tło ghost buttona, badge solution |
| `teal-400` | `#2DD4BF` | `45, 212, 191` | Hover na primary button |
| `teal-500` | `#14B8A6` | `20, 184, 166` | **Główny akcent** — CTA, active nav, focus ring, avatar bg, logo accent |
| `teal-600` | `#0D9488` | `13, 148, 136` | Tekst ghost buttona, secondary hover |

### Kiedy stosować
- **`teal-500`** — domyślny stan każdego akcyjnego elementu
- **`teal-400`** — hover state na teal-500
- **`teal-100`** — delikatne tło pod elementami teal (focus input, badge bg)
- **`teal-600`** — tekst na jasnym tle teal

---

## 2. Neutrals / Dark

Kolory ciemne używane w sidebarze, nagłówkach i trybie dark.

| Token | Hex | RGB | Rola |
|---|---|---|---|
| `sidebar` | `#0D2535` | `13, 37, 53` | Tło sidebara, główny kolor tekstu na jasnym tle, backdrop modali |
| `dark-800` | `#1C2E40` | `28, 46, 64` | Drugorzędne ciemne tło |
| `dark-950` | `#0D1117` | `13, 17, 23` | Body w dark mode |

### Skala szarości (z Tailwind Slate)

W projekcie intensywnie używane są odcienie `slate`:

| Slate | Hex | Użycie |
|---|---|---|
| `slate-50` | `#F8FAFC` | Surface bg, hover elementy |
| `slate-100` | `#F1F5F9` | Tło badge completed, delikatne separatory |
| `slate-200` | `#E2E8F0` | **Border** — karty, inputy, tabele, separatory |
| `slate-300` | `#CBD5E1` | Toggle off, checkbox border |
| `slate-400` | `#94A3B8` | Placeholder, ikony domyślne, tekst disabled |
| `slate-500` | `#64748B` | Tekst drugorzędny |
| `slate-600` | `#475569` | Tekst badge completed |

---

## 3. Semantic

Kolory funkcjonalne do stanów i informacji.

| Token | Hex | Rola | Przykład użycia |
|---|---|---|---|
| `success` | `#10B981` | Sukces | Stan „Zapisano", running indicator |
| `warning` | `#F59E0B` | Ostrzeżenie | Ikona Miro/mock, queued status |
| `danger` | `#EF4444` | Błąd / destrukcja | Btn danger, status failed, usuwanie |
| `info` | `#3B82F6` | Informacja | Badge simulate, Google login, linki zewn. |
| `orange` | `#F97316` | Tryb „problem" | Badge mode problem |
| `violet` | `#8B5CF6` | Tryb „auto" | Badge mode auto |

### Pary semantyczne (tło + tekst)

| Semantic | Tło | Tekst | Border (opcjonalny) |
|---|---|---|---|
| Success | `#DCFCE7` / `#D1FAE5` | `#15803D` / `#10B981` | `#86EFAC` |
| Warning | `#FEF3C7` | `#B45309` | `#FDE68A` |
| Danger | `#FEE2E2` | `#DC2626` | `#FCA5A5` |
| Info | `#EFF6FF` | `#3B82F6` | — |
| Orange | `#FFF7ED` | `#F97316` | — |
| Violet | `#EDE9FE` | `#8B5CF6` | — |

---

## 4. Surfaces (Powierzchnie)

| Token | Hex | Rola |
|---|---|---|
| `surface` | `#F8FAFC` | Tło strony (light mode), tło header |
| `border` | `#E2E8F0` | Standardowy border kart, tabel, inputów |
| `white` | `#FFFFFF` | Tło kart, modali, inputów |
| `page-bg` | `#EFF2F7` | Tło body (light mode) |

---

## 5. Verdict (werdykty discovery)

Specyficzne kolory dla werdyktów Product Discovery:

| Werdykt | Tło | Border | Tekst |
|---|---|---|---|
| **GO** | `#DCFCE7` | `#86EFAC` | `#15803D` |
| **NO-GO** | `#FEE2E2` | `#FCA5A5` | `#DC2626` |
| **NEEDS_MORE_DATA** | `#FEF3C7` | `#FDE68A` | `#B45309` |
| **— (brak)** | `#F1F5F9` | `#E2E8F0` | `#64748B` |

---

## 6. Kolory wykresu (Charts)

| Segment | Hex | Użycie |
|---|---|---|
| Completed | `#14B8A6` | Donut chart — ukończone |
| Failed | `#FF8A65` | Donut chart — nieudane |
| Queued | `#FBBF24` | Donut chart — w kolejce |
| Ring track | `#F1F5F9` | Tło pierścienia (puste) |

---

## 7. Sidebar / Nav specyficzne

| Element | Hex | Rola |
|---|---|---|
| Nav text inactive | `#8BB5CC` | Tekst nieaktywnych linków |
| Nav section label | `#4A7090` | Etykieta sekcji „Zasoby" |
| Active indicator | `#14B8A6` | Border-left 3px na aktywnym linku |
| Active bg | `rgba(20,184,166,0.2)` | `bg-[#14B8A6]/20` na aktywnym linku |
| Hover bg | `rgba(255,255,255,0.05)` | `bg-white/5` na hover |
| Mobile nav border | `#1E3A5F` | Border-top mobile bottom nav |
