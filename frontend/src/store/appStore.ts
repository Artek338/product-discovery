// Zustand global state — przechowuje sesję discovery i stan symulatora
import { create } from 'zustand'
import type {
  ChatMessage,
  DiscoveryResult,
  DiscoveryStatusResponse,
  ProjectSummary,
  SyntheticProfile,
} from '../types/discovery'
import type { Lang } from '../lib/i18n'

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
}

function getLS(key: string, fallback: string): string {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
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
}))
