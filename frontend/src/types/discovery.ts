// TypeScript types odpowiadające Pydantic schemas z backendu

export type Verdict = 'GO' | 'NO-GO' | 'NEEDS_MORE_DATA'

export type EvidenceLevel =
  | '0_Opinion'
  | '1_Preference'
  | '2_Past_Behavior'
  | '3_Time_Commitment'
  | '4_Financial'
  | '5_Cash'

export type SessionStatus = 'queued' | 'running' | 'completed' | 'failed'

export type DiscoveryMode = 'auto' | 'problem' | 'solution'

export type ResponseQuality = 'genuine' | 'polite_lie' | 'vague' | 'detailed'

// ============ Discovery ============

export interface JTBDResult {
  functional_job: string
  emotional_job: string
  social_job: string
  competing_solutions: string[]
  verdict: Verdict
  evidence_level: EvidenceLevel
  confidence: number
  reasoning?: string
}

export interface ScorecardResult {
  hours_invested: number
  evidence_level_achieved: EvidenceLevel
  confidence_before: number
  confidence_after: number
  roi_estimate: string
}

export interface DiscoveryRunRequest {
  idea: string
  project_name: string
  mode: DiscoveryMode
  interview_notes?: string
}

export interface DiscoveryRunResponse {
  session_id: string
  status: SessionStatus
}

export interface DiscoveryStatusResponse {
  session_id: string
  status: SessionStatus
  progress: number
  current_node?: string
  logs: string[]
}

export interface DiscoveryResult {
  session_id: string
  project_name: string
  status: SessionStatus
  jtbd?: JTBDResult
  scorecard?: ScorecardResult
  competitive_report: string
  forces_report: string
  assumption_map: string
  synthetic_archetypes: string
  duration_hours: number
}

// ============ Projects ============

export interface ProjectSummary {
  session_id: string
  project_name: string
  mode: DiscoveryMode
  status: SessionStatus
  verdict?: Verdict
  confidence?: number
  evidence_level?: EvidenceLevel
  created_at: string
}

// ============ Simulator ============

export interface SyntheticProfile {
  archetype_name: string
  demographics: string
  psychology: string
  jtbd_hypothesis: string
  forces_hypothesis: string
  expected_interview_behaviors: string[]
  hypotheses_to_test: string[]
  red_flags_expected: string[]
}

export interface SimulatorQuestionRequest {
  archetype: SyntheticProfile
  question: string
  history?: string
}

export interface SimulatorAnswer {
  question_asked: string
  response: string
  response_quality: ResponseQuality
  hidden_thought: string
  follow_up_suggested: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  quality?: ResponseQuality
  hidden_thought?: string
  follow_up_suggested?: string
}
