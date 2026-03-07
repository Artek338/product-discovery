// API client — fetch wrappers dla wszystkich endpointów backendu

import type {
  AppSettings,
  BatchRunRequest,
  BatchSession,
  BatchSessionSummary,
  DiscoveryResult,
  DiscoveryRunRequest,
  DiscoveryRunResponse,
  DiscoveryStatusResponse,
  GDocsExportResponse,
  ProjectsPage,
  SimulatorAnswer,
  SimulatorQuestionRequest,
  SlackNotifyResponse,
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

  getProjects: (page = 1, size = 50): Promise<ProjectsPage> =>
    request(`/projects?page=${page}&size=${size}`),

  // ============ Simulator ============

  generateArchetypes: (
    segment: string,
    count?: number,
    market_type?: string,
  ): Promise<SyntheticProfile[]> =>
    request('/simulator/archetypes', {
      method: 'POST',
      body: JSON.stringify({ segment, count: count ?? 4, market_type: market_type ?? 'Mixed' }),
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

  exportSlack: (
    sessionId: string,
    body: { webhook_url?: string; report_url?: string; event?: string },
  ): Promise<SlackNotifyResponse> =>
    request(`/export/${sessionId}/slack`, { method: 'POST', body: JSON.stringify(body) }),

  exportGDocs: (
    sessionId: string,
    body: { share_with?: string[]; folder_id?: string },
  ): Promise<GDocsExportResponse> =>
    request(`/export/${sessionId}/gdocs`, { method: 'POST', body: JSON.stringify(body) }),

  // ============ Batch Interview Runner ============

  /**
   * Uruchamia batch — zwraca SSE stream.
   * Uwaga: użyj natywnego fetch z EventSource lub ReadableStream.
   */
  runBatchUrl: (): string => `${BASE}/batch/run`,

  getBatchSessions: (): Promise<BatchSessionSummary[]> =>
    request('/batch'),

  getBatchSession: (id: string): Promise<BatchSession> =>
    request(`/batch/${id}`),

  deleteBatchSession: (id: string): Promise<{ status: string }> =>
    request(`/batch/${id}`, { method: 'DELETE' }),

  // ============ Settings ============

  getSettings: (): Promise<AppSettings> =>
    request('/settings'),

  updateSettings: (body: Partial<Record<string, unknown>>): Promise<AppSettings> =>
    request('/settings', { method: 'PUT', body: JSON.stringify(body) }),

  getIntegrationStatus: (): Promise<{
    slack_configured: boolean
    miro_configured: boolean
    google_connected: boolean
    data_dir: string
    data_dir_exists: boolean
    db_exists: boolean
  }> => request('/settings/status'),

  // ============ Auth / Google ============

  getGoogleAuthUrl: (): Promise<{ auth_url: string }> =>
    request('/auth/google'),

  getGoogleStatus: (): Promise<{ connected: boolean; email: string }> =>
    request('/auth/google/status'),

  logoutGoogle: (): Promise<{ success: boolean; message: string }> =>
    request('/auth/google/logout', { method: 'POST' }),
}
