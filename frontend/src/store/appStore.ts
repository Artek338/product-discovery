// Zustand global state — przechowuje sesję discovery i stan symulatora
import { create } from 'zustand'
import type {
  BatchCell,
  BatchInsights,
  BatchMode,
  BatchQuestion,
  ChatMessage,
  DiscoveryResult,
  DiscoveryStatusResponse,
  Hypothesis,
  ProjectSummary,
  SyntheticProfile,
} from '../types/discovery'
import type { Lang } from '../lib/i18n'

export type ThemeMode = 'light' | 'dark'

interface AppState {
  // Projects list
  projects: ProjectSummary[]
  setProjects: (p: ProjectSummary[]) => void

  // Active discovery session
  activeSessionId: string | null
  setActiveSessionId: (id: string | null) => void

  sessionStatus: DiscoveryStatusResponse | null
  setSessionStatus: (s: DiscoveryStatusResponse | null) => void

  discoveryResult: DiscoveryResult | null
  setDiscoveryResult: (r: DiscoveryResult | null) => void

  // Simulator
  simulatorArchetypes: SyntheticProfile[]
  setSimulatorArchetypes: (a: SyntheticProfile[]) => void

  selectedArchetype: SyntheticProfile | null
  setSelectedArchetype: (a: SyntheticProfile | null) => void

  chatHistory: ChatMessage[]
  addMessage: (m: ChatMessage) => void
  clearChat: () => void

  // i18n
  language: Lang
  setLanguage: (lang: Lang) => void

  // Settings (persisted in localStorage)
  apiKey: string
  setApiKey: (key: string) => void

  llmModel: string
  setLlmModel: (model: string) => void

  globalSearchQuery: string
  setGlobalSearchQuery: (query: string) => void

  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void

  // =========================================================================
  // Batch Interview Runner
  // =========================================================================

  /** Aktualny krok kreatora (1–6) */
  batchStep: number
  setBatchStep: (step: number) => void

  /** Tryb batch */
  batchMode: BatchMode
  setBatchMode: (mode: BatchMode) => void

  /** Wybrane pytania */
  batchSelectedQuestions: BatchQuestion[]
  setBatchSelectedQuestions: (qs: BatchQuestion[]) => void

  /** Hipotezy do weryfikacji */
  batchHypotheses: Hypothesis[]
  setBatchHypotheses: (hs: Hypothesis[]) => void

  /** Archetypy wybrane do badania */
  batchArchetypes: SyntheticProfile[]
  setBatchArchetypes: (a: SyntheticProfile[]) => void

  /** Kontekst produktu */
  batchProductContext: string
  setBatchProductContext: (ctx: string) => void

  /** Segment */
  batchSegment: string
  setBatchSegment: (segment: string) => void

  /** Czy runda 2 (follow-upy dla słabych sygnałów) */
  batchMultiRound: boolean
  setBatchMultiRound: (v: boolean) => void

  /** Concurrency limit (1–8) */
  batchConcurrency: number
  setBatchConcurrency: (n: number) => void

  // ─── Execution state ─────────────────────────────────────────────────────

  batchRunning: boolean
  setBatchRunning: (v: boolean) => void

  batchSessionId: string | null
  setBatchSessionId: (id: string | null) => void

  /** Komórki macierzy napływające przez SSE */
  batchCells: BatchCell[]
  addBatchCell: (cell: BatchCell) => void
  clearBatchCells: () => void

  /** Wyniki analizy (po zakończeniu) */
  batchInsights: BatchInsights | null
  setBatchInsights: (ins: BatchInsights | null) => void

  /** Komunikaty statusu analizy */
  batchAnalyzingMessages: string[]
  addBatchAnalyzingMessage: (msg: string) => void

  /** Czy trwa runda 2 */
  batchRound2Running: boolean
  setBatchRound2Running: (v: boolean) => void

  /** Liczba słabych komórek dla rundy 2 */
  batchRound2WeakCount: number
  setBatchRound2WeakCount: (n: number) => void

  /** Reset całego stanu batch (nowa sesja) */
  resetBatch: () => void
}

function getLS(key: string, fallback: string): string {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}

const BATCH_DEFAULTS = {
  batchStep: 1,
  batchMode: 'discovery' as BatchMode,
  batchSelectedQuestions: [] as BatchQuestion[],
  batchHypotheses: [] as Hypothesis[],
  batchArchetypes: [] as SyntheticProfile[],
  batchProductContext: '',
  batchSegment: '',
  batchMultiRound: true,
  batchConcurrency: 4,
  batchRunning: false,
  batchSessionId: null as string | null,
  batchCells: [] as BatchCell[],
  batchInsights: null as BatchInsights | null,
  batchAnalyzingMessages: [] as string[],
  batchRound2Running: false,
  batchRound2WeakCount: 0,
}

export const useAppStore = create<AppState>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),

  activeSessionId: null,
  setActiveSessionId: (activeSessionId) => set({ activeSessionId }),

  sessionStatus: null,
  setSessionStatus: (sessionStatus) => set({ sessionStatus }),

  discoveryResult: null,
  setDiscoveryResult: (discoveryResult) => set({ discoveryResult }),

  simulatorArchetypes: [],
  setSimulatorArchetypes: (simulatorArchetypes) => set({ simulatorArchetypes }),

  selectedArchetype: null,
  setSelectedArchetype: (selectedArchetype) => set({ selectedArchetype }),

  chatHistory: [],
  addMessage: (m) => set((s) => ({ chatHistory: [...s.chatHistory, m] })),
  clearChat: () => set({ chatHistory: [] }),

  // i18n — domyślnie 'pl', persistowane w localStorage
  language: (getLS('pd_language', 'pl') as Lang),
  setLanguage: (language) => {
    localStorage.setItem('pd_language', language)
    set({ language })
  },

  // API key — persistowany w localStorage
  apiKey: getLS('pd_api_key', ''),
  setApiKey: (apiKey) => {
    localStorage.setItem('pd_api_key', apiKey)
    set({ apiKey })
  },

  // LLM model — persistowany w localStorage
  llmModel: getLS('pd_llm_model', 'claude-sonnet-4-6'),
  setLlmModel: (llmModel) => {
    localStorage.setItem('pd_llm_model', llmModel)
    set({ llmModel })
  },

  globalSearchQuery: '',
  setGlobalSearchQuery: (globalSearchQuery) => set({ globalSearchQuery }),

  theme: (getLS('pd_theme', 'light') as ThemeMode),
  setTheme: (theme) => {
    localStorage.setItem('pd_theme', theme)
    set({ theme })
  },
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('pd_theme', nextTheme)
    return { theme: nextTheme }
  }),

  // =========================================================================
  // Batch Interview Runner
  // =========================================================================

  ...BATCH_DEFAULTS,

  setBatchStep: (batchStep) => set({ batchStep }),
  setBatchMode: (batchMode) => set({ batchMode }),
  setBatchSelectedQuestions: (batchSelectedQuestions) => set({ batchSelectedQuestions }),
  setBatchHypotheses: (batchHypotheses) => set({ batchHypotheses }),
  setBatchArchetypes: (batchArchetypes) => set({ batchArchetypes }),
  setBatchProductContext: (batchProductContext) => set({ batchProductContext }),
  setBatchSegment: (batchSegment) => set({ batchSegment }),
  setBatchMultiRound: (batchMultiRound) => set({ batchMultiRound }),
  setBatchConcurrency: (batchConcurrency) => set({ batchConcurrency }),

  setBatchRunning: (batchRunning) => set({ batchRunning }),
  setBatchSessionId: (batchSessionId) => set({ batchSessionId }),

  addBatchCell: (cell) => set((s) => ({ batchCells: [...s.batchCells, cell] })),
  clearBatchCells: () => set({ batchCells: [] }),

  setBatchInsights: (batchInsights) => set({ batchInsights }),

  addBatchAnalyzingMessage: (msg) =>
    set((s) => ({ batchAnalyzingMessages: [...s.batchAnalyzingMessages, msg] })),

  setBatchRound2Running: (batchRound2Running) => set({ batchRound2Running }),
  setBatchRound2WeakCount: (batchRound2WeakCount) => set({ batchRound2WeakCount }),

  resetBatch: () => set({ ...BATCH_DEFAULTS }),
}))
