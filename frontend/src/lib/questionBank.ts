/**
 * Profesjonalna baza pytań do wywiadów discovery.
 * Oparta na interview_question_bank.md — 46 pytań + 4 biznesowe = 50 total.
 *
 * Każde pytanie zawiera:
 * - id: unikalny identyfikator (P1-P46, PB1-PB4)
 * - text: pełna treść pytania
 * - category: etap/typ pytania
 * - forces_dimension: wymiar sił (push/pull/anxiety/habit/economics/anti_bs/social)
 * - evidence_level_target: docelowy poziom dowodów (0_Opinion–5_Cash)
 * - stage: etap procesu discovery
 */

import type { BatchQuestion } from '../types/discovery'

// ── Etapy i wymiary ────────────────────────────────────────────────────────────

export const STAGES = {
  problem:    'Definicja problemu',
  history:    'Historia i zachowania',
  struggle:   'Walka i frustracja',
  switch:     'Switching i zmiana',
  forces:     'Forces Diagram',
  economics:  'Ekonomia i WTP',
  market:     'Walidacja rynku',
  story:      'Narracja i kontekst',
} as const

export const FORCES_DIMS = {
  push:      { label: 'Push',      color: '#EF4444', desc: 'Popycha od status quo' },
  pull:      { label: 'Pull',      color: '#10B981', desc: 'Przyciąga do nowego rozwiązania' },
  anxiety:   { label: 'Anxiety',   color: '#F59E0B', desc: 'Lęk przed zmianą' },
  habit:     { label: 'Habit',     color: '#6B7280', desc: 'Siła przyzwyczajenia' },
  economics: { label: 'Economics', color: '#8B5CF6', desc: 'Wymiar ekonomiczny' },
  anti_bs:   { label: 'Anti-BS',   color: '#EC4899', desc: 'Weryfikacja deklaracji' },
  social:    { label: 'Social',    color: '#3B82F6', desc: 'Społeczna presja' },
} as const

export type ForcesDim = keyof typeof FORCES_DIMS

export const EVIDENCE_LABELS: Record<string, string> = {
  '0_Opinion':          '0 — Opinia',
  '1_Preference':       '1 — Preferencja',
  '2_Past_Behavior':    '2 — Zachowanie (przeszłe)',
  '3_Time_Commitment':  '3 — Czas (zaangażowanie)',
  '4_Financial':        '4 — Finansowe',
  '5_Cash':             '5 — Gotówka',
}

export const EVIDENCE_COLORS: Record<string, string> = {
  '0_Opinion':          '#9CA3AF',
  '1_Preference':       '#60A5FA',
  '2_Past_Behavior':    '#34D399',
  '3_Time_Commitment':  '#FBBF24',
  '4_Financial':        '#F87171',
  '5_Cash':             '#8B5CF6',
}

// ── Baza pytań ────────────────────────────────────────────────────────────────

export const ALL_QUESTIONS: BatchQuestion[] = [
  // ── STAGE 1: Problem Definition ──────────────────────────────────────────────
  {
    id: 'P1',
    text: 'Opowiedz mi o ostatnim razie, gdy napotkałeś ten problem. Co konkretnie się wydarzyło?',
    category: 'Problem Definition',
    forces_dimension: 'push',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P2',
    text: 'Jak często mierzysz się z tym problemem? Kiedy ostatni raz był szczególnie dotkliwy?',
    category: 'Problem Definition',
    forces_dimension: 'push',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P3',
    text: 'Co robiłeś, żeby sobie z tym poradzić? Jakie konkretne rozwiązania wypróbowałeś do tej pory?',
    category: 'Problem Definition',
    forces_dimension: 'anti_bs',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P4',
    text: 'Gdybyś miał opisać ten problem jednym zdaniem komuś, kto nigdy go nie doświadczył — co byś powiedział?',
    category: 'Problem Definition',
    forces_dimension: 'push',
    evidence_level_target: '1_Preference',
  },
  {
    id: 'P5',
    text: 'Jakie były konsekwencje tego problemu? Co się nie udało przez to, że ten problem istnieje?',
    category: 'Problem Definition',
    forces_dimension: 'push',
    evidence_level_target: '2_Past_Behavior',
  },

  // ── STAGE 2: History & Past Behavior ─────────────────────────────────────────
  {
    id: 'P6',
    text: 'Zanim znalazłeś obecne rozwiązanie — jakie inne metody próbowałeś? Dlaczego z nich zrezygnowałeś?',
    category: 'History & Behavior',
    forces_dimension: 'push',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P7',
    text: 'Jak długo używasz obecnego rozwiązania? Co sprawiło, że przy nim zostałeś?',
    category: 'History & Behavior',
    forces_dimension: 'habit',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P8',
    text: 'Czy kiedykolwiek próbowałeś zmienić swój sposób pracy z tym problemem? Co się wtedy stało?',
    category: 'History & Behavior',
    forces_dimension: 'habit',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P9',
    text: 'Jak wyglądał Twój typowy dzień/tydzień, zanim zacząłeś stosować obecne podejście?',
    category: 'History & Behavior',
    forces_dimension: 'habit',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P10',
    text: 'Opowiedz mi o momencie, gdy postanowiłeś coś zmienić w tym obszarze. Co Cię do tego skłoniło?',
    category: 'History & Behavior',
    forces_dimension: 'push',
    evidence_level_target: '2_Past_Behavior',
  },

  // ── STAGE 3: Struggle & Frustration ─────────────────────────────────────────
  {
    id: 'P11',
    text: 'Co Cię najbardziej frustruje w obecnym rozwiązaniu? Dlaczego to jest dla Ciebie problem?',
    category: 'Struggle & Frustration',
    forces_dimension: 'push',
    evidence_level_target: '1_Preference',
  },
  {
    id: 'P12',
    text: 'Czy zdarzają się momenty, w których żałujesz, że masz obecne rozwiązanie? Opowiedz o jednym z nich.',
    category: 'Struggle & Frustration',
    forces_dimension: 'habit',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P13',
    text: 'Jakie zadania/procesy są dla Ciebie najtrudniejsze lub najbardziej żmudne w tej chwili? Co robisz z tym?',
    category: 'Struggle & Frustration',
    forces_dimension: 'push',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P14',
    text: 'Gdybyś mógł zmienić jedną rzecz w swoim obecnym sposobie pracy — co by to było?',
    category: 'Struggle & Frustration',
    forces_dimension: 'push',
    evidence_level_target: '1_Preference',
  },
  {
    id: 'P15',
    text: 'Ile czasu tygodniowo tracisz przez ten problem? Jak to wyliczasz?',
    category: 'Struggle & Frustration',
    forces_dimension: 'anti_bs',
    evidence_level_target: '3_Time_Commitment',
  },

  // ── STAGE 4: Switching & Change ──────────────────────────────────────────────
  {
    id: 'P16',
    text: 'Co musiałoby się stać, żebyś porzucił obecne rozwiązanie i spróbował czegoś nowego?',
    category: 'Switching & Change',
    forces_dimension: 'anxiety',
    evidence_level_target: '1_Preference',
  },
  {
    id: 'P17',
    text: 'Czy aktywnie szukałeś alternatywnych rozwiązań dla tego problemu? Co znalazłeś?',
    category: 'Switching & Change',
    forces_dimension: 'pull',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P18',
    text: 'Czy masz kolegów/znajomych, którzy zmagają się z tym samym problemem? Jak oni sobie z tym radzą?',
    category: 'Switching & Change',
    forces_dimension: 'social',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P19',
    text: 'Co byłoby dla Ciebie idealnym rozwiązaniem? Jak byś je sobie wyobraził?',
    category: 'Switching & Change',
    forces_dimension: 'pull',
    evidence_level_target: '1_Preference',
  },
  {
    id: 'P20',
    text: 'Jakie są największe przeszkody w zmianie Twojego obecnego sposobu działania?',
    category: 'Switching & Change',
    forces_dimension: 'anxiety',
    evidence_level_target: '1_Preference',
  },

  // ── STAGE 5: Forces Diagram ───────────────────────────────────────────────────
  {
    id: 'P21',
    text: 'Co zyskałbyś, gdybyś miał idealne rozwiązanie tego problemu? Jakie by to miało znaczenie dla Twojej pracy/życia?',
    category: 'Forces Diagram',
    forces_dimension: 'pull',
    evidence_level_target: '1_Preference',
  },
  {
    id: 'P22',
    text: 'Czego się najbardziej obawiasz przy zmianie obecnego rozwiązania? Co może pójść nie tak?',
    category: 'Forces Diagram',
    forces_dimension: 'anxiety',
    evidence_level_target: '1_Preference',
  },
  {
    id: 'P23',
    text: 'Co sprawiłoby, że nowe rozwiązanie byłoby dla Ciebie atrakcyjne? Co musiałoby oferować?',
    category: 'Forces Diagram',
    forces_dimension: 'pull',
    evidence_level_target: '1_Preference',
  },
  {
    id: 'P24',
    text: 'Jakie zmiany w Twoim środowisku lub pracy popchnęłyby Cię do szukania nowego rozwiązania?',
    category: 'Forces Diagram',
    forces_dimension: 'push',
    evidence_level_target: '1_Preference',
  },
  {
    id: 'P25',
    text: 'Czy inni w Twojej firmie/branży już używają nowych rozwiązań do tego problemu? Jak na to reagujesz?',
    category: 'Forces Diagram',
    forces_dimension: 'social',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P26',
    text: 'Co sprawia, że nie zmieniłeś jeszcze swojego podejścia, mimo że jesteś niezadowolony?',
    category: 'Forces Diagram',
    forces_dimension: 'habit',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P27',
    text: 'Kiedy ostatni raz myślałeś poważnie o zmianie sposobu pracy w tym obszarze? Co Cię wtedy powstrzymało?',
    category: 'Forces Diagram',
    forces_dimension: 'anxiety',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P28',
    text: 'Gdybyś miał "przeprojektować" swój sposób pracy z tym problemem od zera — od czego byś zaczął?',
    category: 'Forces Diagram',
    forces_dimension: 'habit',
    evidence_level_target: '1_Preference',
  },

  // ── STAGE 6: Economics & WTP ──────────────────────────────────────────────────
  {
    id: 'P29',
    text: 'Ile płacisz miesięcznie za obecne rozwiązania związane z tym problemem (łącznie)?',
    category: 'Economics & WTP',
    forces_dimension: 'economics',
    evidence_level_target: '4_Financial',
  },
  {
    id: 'P30',
    text: 'Czy wiesz, jaki jest Twój całkowity budżet na narzędzia/usługi w tym obszarze? Skąd wiesz?',
    category: 'Economics & WTP',
    forces_dimension: 'economics',
    evidence_level_target: '4_Financial',
  },
  {
    id: 'P31',
    text: 'Gdybyś miał nowe rozwiązanie, które w pełni rozwiązuje ten problem — ile byłbyś skłonny za nie zapłacić miesięcznie?',
    category: 'Economics & WTP',
    forces_dimension: 'economics',
    evidence_level_target: '4_Financial',
  },
  {
    id: 'P32',
    text: 'Ile ten problem kosztuje Cię teraz — w czasie, pieniądzach, utraconych szansach?',
    category: 'Economics & WTP',
    forces_dimension: 'economics',
    evidence_level_target: '4_Financial',
  },
  {
    id: 'P33',
    text: 'Czy kiedykolwiek zapłaciłeś za próbę rozwiązania tego problemu? Ile? I co z tego wyszło?',
    category: 'Economics & WTP',
    forces_dimension: 'anti_bs',
    evidence_level_target: '5_Cash',
  },
  {
    id: 'P34',
    text: 'Przy jakiej cenie powiedziałbyś "za drogo"? A przy jakiej "podejrzanie tanio"?',
    category: 'Economics & WTP',
    forces_dimension: 'economics',
    evidence_level_target: '1_Preference',
  },
  {
    id: 'P35',
    text: 'Czy decyzja o zakupie narzędzia/usługi w tym obszarze leży po Twojej stronie, czy potrzebujesz zgody kogoś innego?',
    category: 'Economics & WTP',
    forces_dimension: 'social',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P36',
    text: 'Gdyby rozwiązanie kosztowało X — jaki ROI musiałbyś zobaczyć, żeby uzasadnić zakup?',
    category: 'Economics & WTP',
    forces_dimension: 'economics',
    evidence_level_target: '1_Preference',
  },

  // ── STAGE 7: Market Validation ────────────────────────────────────────────────
  {
    id: 'P37',
    text: 'Czy znasz kogoś, kto rozwiązał ten problem w inny, ciekawy sposób? Jak mu to wychodzi?',
    category: 'Market Validation',
    forces_dimension: 'social',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P38',
    text: 'Jakie są dostępne na rynku rozwiązania? Które z nich próbowałeś? Dlaczego żadne nie pasuje idealnie?',
    category: 'Market Validation',
    forces_dimension: 'pull',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P39',
    text: 'Gdybyś już miał to rozwiązanie — jak wyglądałby Twój typowy tydzień pracy? Co konkretnie byś robił inaczej?',
    category: 'Market Validation',
    forces_dimension: 'anti_bs',
    evidence_level_target: '1_Preference',
  },
  {
    id: 'P40',
    text: 'Jak bardzo priorytetowe jest dla Ciebie rozwiązanie tego problemu — w skali od 1 do 10? Dlaczego akurat tyle?',
    category: 'Market Validation',
    forces_dimension: 'anti_bs',
    evidence_level_target: '1_Preference',
  },
  {
    id: 'P41',
    text: 'Jakie informacje musiałbyś zobaczyć o nowym rozwiązaniu, żeby poważnie je rozważyć?',
    category: 'Market Validation',
    forces_dimension: 'anxiety',
    evidence_level_target: '1_Preference',
  },

  // ── STAGE 8: Narrative & Context ─────────────────────────────────────────────
  {
    id: 'P42',
    text: 'Opowiedz mi historię, jak zaczął się ten problem dla Ciebie. Od kiedy z nim się zmagasz?',
    category: 'Narrative & Context',
    forces_dimension: 'push',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P43',
    text: 'Jak problem zmienił się na przestrzeni czasu? Czy jest coraz gorszy, czy stabilny?',
    category: 'Narrative & Context',
    forces_dimension: 'push',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P44',
    text: 'Opowiedz mi o najtrudniejszym momencie związanym z tym problemem. Co się wtedy stało?',
    category: 'Narrative & Context',
    forces_dimension: 'push',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'P45',
    text: 'Jak ten problem wpływa na inne obszary Twojej pracy lub życia? Co jeszcze cierpi przez niego?',
    category: 'Narrative & Context',
    forces_dimension: 'push',
    evidence_level_target: '1_Preference',
  },
  {
    id: 'P46',
    text: 'Gdyby ten problem zniknął jutro — jak wyglądałoby Twoje życie za rok? Co byś osiągnął?',
    category: 'Narrative & Context',
    forces_dimension: 'pull',
    evidence_level_target: '1_Preference',
  },

  // ── BONUS: Business-specific ─────────────────────────────────────────────────
  {
    id: 'PB1',
    text: 'Jakie są KPI Twojego zespołu/firmy w obszarze związanym z tym problemem? Jak je mierzysz?',
    category: 'Business & B2B',
    forces_dimension: 'economics',
    evidence_level_target: '4_Financial',
  },
  {
    id: 'PB2',
    text: 'Kto jeszcze w Twojej organizacji cierpi na ten problem? Jak decyzje zakupowe są podejmowane w Twojej firmie?',
    category: 'Business & B2B',
    forces_dimension: 'social',
    evidence_level_target: '2_Past_Behavior',
  },
  {
    id: 'PB3',
    text: 'Czy ten problem pojawił się w ostatnim rocznym/kwartalnym przeglądzie celów firmy? Jak o nim mówiono?',
    category: 'Business & B2B',
    forces_dimension: 'push',
    evidence_level_target: '3_Time_Commitment',
  },
  {
    id: 'PB4',
    text: 'Jaki byłby ideał — opisz rozwiązanie, które sprawiłoby, że Twój zespół/firma osiągnęłaby cel X? Co musiałoby się wydarzyć?',
    category: 'Business & B2B',
    forces_dimension: 'pull',
    evidence_level_target: '1_Preference',
  },
]

// ── Presets ────────────────────────────────────────────────────────────────────

export const PRESETS: Record<string, {
  label: string
  description: string
  ids: string[]
  icon: string
}> = {
  mom_test: {
    label: 'Mom Test',
    description: 'Pytania behawioralne z przeszłości — zero hipotez, zero preferencji',
    icon: '🧪',
    ids: ['P1', 'P2', 'P3', 'P6', 'P7', 'P10', 'P13', 'P15', 'P33'],
  },
  forces: {
    label: 'Forces Diagram',
    description: 'Pełna analiza Push/Pull/Anxiety/Habit dla każdego archetypu',
    icon: '⚡',
    ids: ['P13', 'P19', 'P21', 'P22', 'P23', 'P24', 'P25', 'P26', 'P27', 'P28'],
  },
  economics: {
    label: 'Ekonomia & WTP',
    description: 'Gotowość do płacenia, budżet, ROI — Van Westendorp',
    icon: '💰',
    ids: ['P29', 'P30', 'P31', 'P32', 'P33', 'P34', 'P35', 'P36'],
  },
  story: {
    label: 'Story & Narrative',
    description: 'Narracyjne pytania odkrywające historię i kontekst problemu',
    icon: '📖',
    ids: ['P42', 'P43', 'P44', 'P45', 'P46'],
  },
  anti_bs: {
    label: 'Anti-BS',
    description: 'Pytania weryfikujące deklaracje — oddzielają opinie od faktów',
    icon: '🚫',
    ids: ['P3', 'P15', 'P33', 'P39', 'P40'],
  },
  switching: {
    label: 'Switching Research',
    description: 'Badanie gotowości do zmiany i barier przełączania',
    icon: '🔄',
    ids: ['P6', 'P8', 'P16', 'P17', 'P20', 'P22', 'P27'],
  },
  full_battery: {
    label: 'Full Battery (rekomendowane)',
    description: 'Optymalny zestaw 14 pytań pokrywający wszystkie wymiary',
    icon: '🔋',
    ids: ['P1', 'P3', 'P7', 'P13', 'P15', 'P19', 'P21', 'P22', 'P26', 'P31', 'P33', 'P39', 'P42', 'P46'],
  },
  b2b: {
    label: 'B2B Enterprise',
    description: 'Pytania dla kontekstu biznesowego — KPI, budżet, decyzje zakupowe',
    icon: '🏢',
    ids: ['P1', 'P3', 'P13', 'P15', 'P32', 'P35', 'PB1', 'PB2', 'PB3', 'PB4'],
  },
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const questionMap = new Map(ALL_QUESTIONS.map(q => [q.id, q]))

export function getPresetQuestions(presetKey: string): BatchQuestion[] {
  const preset = PRESETS[presetKey]
  if (!preset) return []
  return preset.ids.map(id => questionMap.get(id)).filter(Boolean) as BatchQuestion[]
}

export function getQuestionsByStage(stage: string): BatchQuestion[] {
  return ALL_QUESTIONS.filter(q => q.category === stage)
}

export function getQuestionsByForce(dim: ForcesDim): BatchQuestion[] {
  return ALL_QUESTIONS.filter(q => q.forces_dimension === dim)
}

export function getQuestionsByEvidenceLevel(level: string): BatchQuestion[] {
  return ALL_QUESTIONS.filter(q => q.evidence_level_target === level)
}

export const UNIQUE_CATEGORIES = [...new Set(ALL_QUESTIONS.map(q => q.category))]
