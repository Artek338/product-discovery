// API client — fetch wrappers dla wszystkich endpointów backendu

import type {
  DiscoveryResult,
  DiscoveryRunRequest,
  DiscoveryRunResponse,
  DiscoveryStatusResponse,
  ProjectSummary,
  SimulatorAnswer,
  SimulatorQuestionRequest,
  SyntheticProfile,
} from '../types/discovery'

const BASE = '/api'

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }
  return res.json()
}

// ============ Discovery ============

export const api = {
  // Uruchom nową sesję discovery
  runDiscovery: (body: DiscoveryRunRequest): Promise<DiscoveryRunResponse> =>
    request('/discovery/run', { method: 'POST', body: JSON.stringify(body) }),

  // Polling statusu
  getStatus: (sessionId: string): Promise<DiscoveryStatusResponse> =>
    request(`/discovery/${sessionId}/status`),

  // Pobierz pełny wynik
  getResult: (sessionId: string): Promise<DiscoveryResult> =>
    request(`/discovery/${sessionId}/result`),

  // ============ Projects ============

  getProjects: (): Promise<ProjectSummary[]> =>
    request('/projects'),

  // ============ Simulator ============

  generateArchetypes: (segment: string): Promise<SyntheticProfile[]> =>
    request('/simulator/archetypes', {
      method: 'POST',
      body: JSON.stringify({ segment }),
    }),

  askQuestion: (body: SimulatorQuestionRequest): Promise<SimulatorAnswer> =>
    request('/simulator/question', { method: 'POST', body: JSON.stringify(body) }),

  // ============ Export ============

  exportHtmlUrl: (sessionId: string): string =>
    `${BASE}/export/${sessionId}/html`,

  exportPdfUrl: (sessionId: string): string =>
    `${BASE}/export/${sessionId}/pdf`,

  exportMiro: (
    sessionId: string,
    body: { token?: string; board_id?: string; dry_run: boolean; sections?: string[] },
  ): Promise<{ url: string; items_created: number; dry_run: boolean; log: string[] }> =>
    request(`/export/${sessionId}/miro`, { method: 'POST', body: JSON.stringify(body) }),
}
