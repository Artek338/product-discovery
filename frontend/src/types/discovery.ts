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

export interface ProjectsPage {
  items: ProjectSummary[]
  total: number
  page: number
  pages: number
  size: number
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

// ============ Settings ============

export interface AppSettings {
  data_dir: string
  anthropic_api_key_set: boolean
  anthropic_api_key_preview: string
  perplexity_api_key_set: boolean
  serper_api_key_set: boolean
  brave_api_key_set: boolean
  miro_access_token_set: boolean
  miro_board_id_set: boolean
  slack_webhook_url_set: boolean
  slack_auto_notify: boolean
  llm_model: string
  language: string
  google_client_id_set: boolean
  google_client_secret_set: boolean
  google_connected: boolean
  discovery_mock: boolean
}

// ============ Export responses ============

export interface SlackNotifyResponse {
  sent: boolean
  webhook_used: boolean
  message: string
}

export interface GDocsExportResponse {
  doc_url: string
  doc_id: string
  shared_with: string[]
}


// ============================================================================
// Batch Interview Runner
// ============================================================================

export type BatchMode = 'discovery' | 'forces' | 'wtp' | 'story' | 'hypothesis'

export interface BatchQuestion {
  id: string
  text: string
  category: string
  forces_dimension?: string
  evidence_level_target: string
  hypothesis_id?: string
}

export interface Hypothesis {
  id: string
  text: string
  status: 'pending' | 'validated' | 'invalidated' | 'inconclusive'
  evidence_quotes: string[]
  confidence: number
}

export interface BatchCell {
  q_idx: number
  a_idx: number
  question_id: string
  archetype_name: string
  response: string
  response_quality: ResponseQuality
  hidden_thought: string
  follow_up_suggested: string
  round: number
  follow_up_for?: number
}

export interface ForceSignal {
  score: number
  evidence_quotes: string[]
}

export interface ForcesPerArchetype {
  archetype_name: string
  push: ForceSignal
  pull: ForceSignal
  anxiety: ForceSignal
  habit: ForceSignal
  switch_likelihood: 'HIGH' | 'MEDIUM' | 'LOW'
  trigger_event?: string
}

export interface ConsensusSignal {
  topic: string
  agreement_level: 'strong' | 'moderate' | 'weak'
  evidence_quotes: string[]
  archetypes_count: number
  forces_dimension?: string
}

export interface DivergenceAlert {
  topic: string
  segments: string[]
  question_text: string
  segmentation_implication: string
}

export interface PainRanking {
  pain: string
  frequency: number
  archetypes_affected: string[]
  evidence_level: string
  forces_dimension: string
}

export interface WTPSignal {
  archetype_name: string
  willing_to_pay: boolean
  price_point?: string
  conditions?: string
  evidence_level: string
  van_westendorp?: Record<string, string>
}

export interface QuestionEffectiveness {
  question_id: string
  question_text: string
  quality_distribution: Record<string, number>
  signal_score: number
  recommendation: 'keep' | 'improve' | 'replace'
  improved_variant?: string
  forces_signal_strength?: string
}

export interface HypothesisResult {
  hypothesis_id: string
  hypothesis_text: string
  status: 'validated' | 'invalidated' | 'inconclusive'
  confidence: number
  evidence_quotes: string[]
  archetypes_validated: string[]
  archetypes_invalidated: string[]
}

export interface KeyQuotes {
  push: string[]
  pull: string[]
  anxiety: string[]
  habit: string[]
  surprising: string[]
}

export interface BatchInsights {
  forces_per_archetype: ForcesPerArchetype[]
  consensus_signals: ConsensusSignal[]
  divergence_alerts: DivergenceAlert[]
  pain_ranking: PainRanking[]
  wtp_signals: WTPSignal[]
  question_effectiveness: QuestionEffectiveness[]
  hypothesis_results?: HypothesisResult[]
  key_quotes: KeyQuotes
  segmentation_hypothesis?: string
  recommended_next_questions: string[]
  quality_score: number
  quality_verdict: 'HIGH_CONFIDENCE_GO' | 'CAUTIOUS_GO' | 'NEEDS_MORE_DATA' | 'RESET_DISCOVERY'
  executive_summary: string
}

export interface BatchRunRequest {
  segment: string
  mode: BatchMode
  questions: BatchQuestion[]
  archetypes: SyntheticProfile[]
  hypotheses?: Hypothesis[]
  multi_round: boolean
  concurrency: number
  product_context?: string
  language: string
}

export interface BatchSessionSummary {
  session_id: string
  segment: string
  mode: string
  status: string
  questions_count: number
  archetypes_count: number
  quality_score?: number
  quality_verdict?: string
  created_at: string
}

export interface BatchSession {
  id: string
  segment: string
  mode: string
  status: string
  questions_json: string
  archetypes_json: string
  cells_json: string
  insights_json?: string
  hypotheses_json?: string
  questions_count: number
  archetypes_count: number
  created_at: string
}