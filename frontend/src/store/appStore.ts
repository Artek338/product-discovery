// Zustand global state — przechowuje sesję discovery i stan symulatora
import { create } from 'zustand'
import type {
  ChatMessage,
  DiscoveryResult,
  DiscoveryStatusResponse,
  ProjectSummary,
  SyntheticProfile,
} from '../types/discovery'

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
}))
