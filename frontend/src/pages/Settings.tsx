import { useEffect, useState, useCallback, useId } from 'react'
import {
  Key, Cpu, Globe, Eye, EyeOff, BarChart3, CreditCard,
  Folder, Slack, Settings2, AlertCircle, CheckCircle2,
  ExternalLink, RefreshCw,
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'
import { api } from '../lib/api'
import type { AppSettings } from '../types/discovery'

const MODELS = [
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (domyślny / default)' },
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6 (najsilniejszy / strongest)' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (najszybszy / fastest)' },
]

// Pomocniczy komponent: pole API key z maską i toggle
function ApiKeyField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  isSet,
  preview,
  language = 'pl',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  hint?: string
  isSet?: boolean
  preview?: string
  language?: 'pl' | 'en'
}) {
  const [show, setShow] = useState(false)
  const inputId = useId()

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        <label htmlFor={inputId} className="block text-sm font-sans font-semibold text-[#0D2535] dark:text-slate-200">{label}</label>
        {isSet && !value && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-sans font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
            {preview || '****'}
          </span>
        )}
      </div>
      <div className="relative">
        <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          id={inputId}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={isSet && !value ? t(language, 'set_key_keep') : placeholder}
          className="w-full bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#333333] rounded-lg pl-9 pr-10 py-2.5 text-[#0D2535] dark:text-slate-200 dark:placeholder:text-slate-600 text-sm font-mono outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-[#0D2535] dark:hover:text-slate-200 transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {hint && <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-1.5">{hint}</p>}
    </div>
  )
}

// Pomocniczy: nagłówek sekcji z ikoną
function SectionHeader({
  icon: Icon,
  title,
  badge,
  iconBg = 'bg-[#F0FDFA] dark:bg-teal-900/30',
  iconColor = '#14B8A6',
}: {
  icon: React.ElementType
  title: string
  badge?: React.ReactNode
  iconBg?: string
  iconColor?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon size={16} style={{ color: iconColor }} />
      </div>
      <h2 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100">{title}</h2>
      {badge}
    </div>
  )
}

function StatusBadge({ ok, labelOk, labelNo }: { ok: boolean; labelOk: string; labelNo: string }) {
  return ok ? (
    <span className="flex items-center gap-1 text-xs font-sans font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
      <CheckCircle2 size={11} /> {labelOk}
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs font-sans font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-[#2A2A2A] px-2 py-0.5 rounded-full">
      <AlertCircle size={11} /> {labelNo}
    </span>
  )
}

export default function Settings() {
  const { language, setLanguage, setDiscoveryMock: setStoreMock, setLlmModel: setStoreLlmModel } = useAppStore()

  // Aktualny stan z backendu
  const [serverSettings, setServerSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Pola formularza (puste = "nie zmieniam")
  const [dataDir, setDataDir] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [perplexityKey, setPerplexityKey] = useState('')
  const [serperKey, setSerperKey] = useState('')
  const [braveKey, setBraveKey] = useState('')
  const [miroToken, setMiroToken] = useState('')
  const [miroBoard, setMiroBoard] = useState('')
  const [slackUrl, setSlackUrl] = useState('')
  const [slackAuto, setSlackAuto] = useState(false)
  const [llmModel, setLlmModel] = useState('claude-sonnet-4-6')
  const [googleClientId, setGoogleClientId] = useState('')
  const [googleClientSecret, setGoogleClientSecret] = useState('')
  const [discoveryMock, setDiscoveryMock] = useState(false)

  // Google OAuth status
  const [googleStatus, setGoogleStatus] = useState<{ connected: boolean; email: string } | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const s = await api.getSettings()
      setServerSettings(s)
      setDataDir(s.data_dir)
      setSlackAuto(s.slack_auto_notify)
      // miro_board_id nie jest zwracany z serwera (bezpieczeństwo) — pole pozostaje puste
      setLlmModel(s.llm_model)
      setStoreLlmModel(s.llm_model)
      setDiscoveryMock(s.discovery_mock)
      setStoreMock(s.discovery_mock)
      // Nie wypełniamy pól kluczy — użytkownik musi je wpisać świadomie
    } catch {
      setError('Nie można wczytać ustawień z serwera')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadGoogleStatus = useCallback(async () => {
    try {
      const s = await api.getGoogleStatus()
      setGoogleStatus(s)
    } catch {
      setGoogleStatus({ connected: false, email: '' })
    }
  }, [])

  useEffect(() => {
    loadSettings()
    loadGoogleStatus()
  }, [loadSettings, loadGoogleStatus])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const updates: Record<string, unknown> = {
        slack_auto_notify: slackAuto,
        llm_model: llmModel,
        language,
        discovery_mock: discoveryMock,
      }
      // Wysyłaj tylko niepuste wartości (żeby nie nadpisać pustym stringiem)
      if (dataDir.trim()) updates.data_dir = dataDir.trim()
      if (miroBoard.trim()) updates.miro_board_id = miroBoard.trim()
      if (anthropicKey) updates.anthropic_api_key = anthropicKey
      if (perplexityKey) updates.perplexity_api_key = perplexityKey
      if (serperKey) updates.serper_api_key = serperKey
      if (braveKey) updates.brave_api_key = braveKey
      if (miroToken) updates.miro_access_token = miroToken
      if (slackUrl) updates.slack_webhook_url = slackUrl
      if (googleClientId) updates.google_client_id = googleClientId
      if (googleClientSecret) updates.google_client_secret = googleClientSecret

      const updated = await api.updateSettings(updates)
      setServerSettings(updated)
      setStoreMock(discoveryMock)
      setStoreLlmModel(llmModel)
      setSaved(true)
      // Wyczyść pola kluczy po zapisaniu
      setAnthropicKey('')
      setPerplexityKey('')
      setSerperKey('')
      setBraveKey('')
      setMiroToken('')
      setSlackUrl('')
      setGoogleClientId('')
      setGoogleClientSecret('')
      setTimeout(() => setSaved(false), 2500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Błąd zapisu')
    } finally {
      setSaving(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const { auth_url } = await api.getGoogleAuthUrl()
      const popup = window.open(auth_url, 'google_auth', 'width=600,height=700,scrollbars=yes')

      // Nasłuchuj wiadomości z popup (po callback)
      const listener = (e: MessageEvent) => {
        if (e.data === 'google_connected') {
          window.removeEventListener('message', listener)
          popup?.close()
          loadGoogleStatus()
          loadSettings()
          setGoogleLoading(false)
        }
      }
      window.addEventListener('message', listener)

      // Fallback: zamknij loading po 60s
      setTimeout(() => {
        window.removeEventListener('message', listener)
        setGoogleLoading(false)
        loadGoogleStatus()
      }, 60000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Błąd logowania Google')
      setGoogleLoading(false)
    }
  }

  const handleGoogleLogout = async () => {
    await api.logoutGoogle()
    setGoogleStatus({ connected: false, email: '' })
    loadSettings()
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-slate-400 dark:text-slate-500 font-sans">
        <RefreshCw size={16} className="inline mr-2 animate-spin" />
        {t(language, 'set_loading')}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-sans font-semibold text-[#0D2535] dark:text-slate-100 mb-1">
          {t(language, 'set_title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-sans text-sm">
          {language === 'pl'
            ? 'Konfiguracja jest przechowywana lokalnie na Twoim komputerze (~/.product-discovery/config.json).'
            : 'Settings are stored locally on your computer (~/.product-discovery/config.json).'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-sm text-red-700 dark:text-red-400 font-sans flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="space-y-6">

        {/* ── Język ────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
          <SectionHeader icon={Globe} title={t(language, 'set_lang_title')} />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mb-4">{t(language, 'set_lang_desc')}</p>
          <div className="flex gap-3">
            {(['pl', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-sans font-semibold transition-all ${language === lang
                    ? 'border-[#14B8A6] bg-[#F0FDFA] dark:bg-teal-900/30 text-[#0D9488] dark:text-teal-400'
                    : 'border-[#E2E8F0] dark:border-[#333333] bg-white dark:bg-[#111111] text-slate-500 dark:text-slate-400 hover:border-[#CCFBF1] dark:hover:border-teal-900/50'
                  }`}
              >
                {lang === 'pl' ? 'Polski' : 'Angielski'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Folder danych ────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
          <SectionHeader icon={Folder} title={t(language, 'set_data_title')} iconBg="bg-[#F0FDFA] dark:bg-teal-900/30" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mb-4">{t(language, 'set_data_desc')}</p>
          <div className="mb-2">
            <label htmlFor="data-dir-inp" className="block text-sm font-sans font-semibold text-[#0D2535] dark:text-slate-200 mb-1.5">
              {t(language, 'set_data_dir')}
            </label>
            <input
              id="data-dir-inp"
              type="text"
              value={dataDir}
              onChange={e => setDataDir(e.target.value)}
              placeholder={t(language, 'set_data_dir_ph')}
              className="w-full bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#333333] rounded-lg px-4 py-2.5 text-[#0D2535] dark:text-slate-200 dark:placeholder:text-slate-600 text-sm font-mono outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all"
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-1">
            {language === 'pl'
              ? 'W tym folderze znajdziesz: discovery.db, google_tokens.json, projekty.'
              : 'This folder contains: discovery.db, google_tokens.json, projects.'}
          </p>
        </div>

        {/* ── API & Model ──────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
          <SectionHeader icon={Cpu} title={t(language, 'set_api_title')} iconBg="bg-[#F0FDFA] dark:bg-teal-900/30" />

          <ApiKeyField
            label={t(language, 'set_api_key')}
            value={anthropicKey}
            onChange={setAnthropicKey}
            placeholder="sk-ant-..."
            hint={t(language, 'set_api_key_hint')}
            isSet={serverSettings?.anthropic_api_key_set}
            preview={serverSettings?.anthropic_api_key_preview}
            language={language}
          />

          <div>
            <label htmlFor="model-select-inp" className="block text-sm font-sans font-semibold text-[#0D2535] dark:text-slate-200 mb-1.5">
              {t(language, 'set_model')}
            </label>
            <select
              id="model-select-inp"
              value={llmModel}
              onChange={e => setLlmModel(e.target.value)}
              className="w-full bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#333333] rounded-lg px-4 py-2.5 text-[#0D2535] dark:text-slate-200 text-sm font-sans outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all cursor-pointer"
            >
              {MODELS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-1.5">{t(language, 'set_model_hint')}</p>
          </div>
        </div>

        {/* ── Klucze Research API ──────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
          <SectionHeader icon={Settings2} title={t(language, 'set_research_title')} iconBg="bg-[#F0FDFA] dark:bg-teal-900/30" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mb-4">{t(language, 'set_research_desc')}</p>

          <ApiKeyField
            label={`Perplexity API Key (${t(language, 'set_optional')})`}
            value={perplexityKey}
            onChange={setPerplexityKey}
            placeholder="pplx-..."
            isSet={serverSettings?.perplexity_api_key_set}
            language={language}
          />
          <ApiKeyField
            label={`Serper API Key (${t(language, 'set_optional')})`}
            value={serperKey}
            onChange={setSerperKey}
            placeholder="serper-..."
            isSet={serverSettings?.serper_api_key_set}
            language={language}
          />
          <ApiKeyField
            label={`Brave Search API Key (${t(language, 'set_optional')})`}
            value={braveKey}
            onChange={setBraveKey}
            placeholder="BSAv..."
            isSet={serverSettings?.brave_api_key_set}
            language={language}
          />
        </div>

        {/* ── Miro ─────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
          <SectionHeader
            icon={Settings2}
            title={t(language, 'set_miro_title')}
            badge={
              <StatusBadge
                ok={!!serverSettings?.miro_access_token_set && !!serverSettings?.miro_board_id_set}
                labelOk={t(language, 'set_configured')}
                labelNo={t(language, 'set_not_configured')}
              />
            }
            iconBg="bg-yellow-50 dark:bg-yellow-900/20"
            iconColor="#F59E0B"
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mb-4">{t(language, 'set_miro_desc')}</p>

          <ApiKeyField
            label={t(language, 'set_miro_token')}
            value={miroToken}
            onChange={setMiroToken}
            placeholder={t(language, 'set_miro_token_ph')}
            isSet={serverSettings?.miro_access_token_set}
            language={language}
          />

          <div>
            <label htmlFor="miro-board-inp" className="block text-sm font-sans font-semibold text-[#0D2535] dark:text-slate-200 mb-1.5">
              {t(language, 'set_miro_board')}
            </label>
            <input
              id="miro-board-inp"
              type="text"
              value={miroBoard}
              onChange={e => setMiroBoard(e.target.value)}
              placeholder={t(language, 'set_miro_board_ph')}
              className="w-full bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#333333] rounded-lg px-4 py-2.5 text-[#0D2535] dark:text-slate-200 dark:placeholder:text-slate-600 text-sm font-mono outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all"
            />
          </div>
        </div>

        {/* ── Slack ────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
          <SectionHeader
            icon={Slack}
            title={t(language, 'set_slack_title')}
            badge={
              <StatusBadge
                ok={!!serverSettings?.slack_webhook_url_set}
                labelOk={t(language, 'set_configured')}
                labelNo={t(language, 'set_not_configured')}
              />
            }
            iconBg="bg-purple-50 dark:bg-purple-900/20"
            iconColor="#7C3AED"
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mb-4">{t(language, 'set_slack_desc')}</p>

          <div className="mb-4">
            <label htmlFor="slack-url-inp" className="block text-sm font-sans font-semibold text-[#0D2535] dark:text-slate-200 mb-1.5">
              {t(language, 'set_slack_url')}
            </label>
            <input
              id="slack-url-inp"
              type="url"
              value={slackUrl}
              onChange={e => setSlackUrl(e.target.value)}
              placeholder={serverSettings?.slack_webhook_url_set ? t(language, 'set_already_set') : t(language, 'set_slack_url_ph')}
              className="w-full bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#333333] rounded-lg px-4 py-2.5 text-[#0D2535] dark:text-slate-200 dark:placeholder:text-slate-600 text-sm font-mono outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                role="switch"
                aria-checked={slackAuto}
                checked={slackAuto}
                onChange={e => setSlackAuto(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-10 h-5 rounded-full transition-colors ${slackAuto ? 'bg-[#14B8A6]' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${slackAuto ? 'translate-x-5' : ''}`} />
              </div>
            </div>
            <span className="text-sm font-sans text-[#0D2535] dark:text-slate-300">{t(language, 'set_slack_auto')}</span>
          </label>
        </div>

        {/* ── Google Docs ──────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
          <SectionHeader
            icon={ExternalLink}
            title={t(language, 'set_google_title')}
            badge={
              <StatusBadge
                ok={!!googleStatus?.connected}
                labelOk={t(language, 'set_google_connected')}
                labelNo={t(language, 'set_google_not_connected')}
              />
            }
            iconBg="bg-blue-50 dark:bg-blue-900/20"
            iconColor="#3B82F6"
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mb-4">{t(language, 'set_google_desc')}</p>

          {/* OAuth credentials */}
          <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#333333] text-xs text-slate-500 dark:text-slate-400 font-sans">
            {t(language, 'set_google_oauth_hint')}
          </div>

          <ApiKeyField
            label={t(language, 'set_google_client_id')}
            value={googleClientId}
            onChange={setGoogleClientId}
            placeholder="*.apps.googleusercontent.com"
            isSet={serverSettings?.google_client_id_set}
            language={language}
          />
          <ApiKeyField
            label={t(language, 'set_google_client_secret')}
            value={googleClientSecret}
            onChange={setGoogleClientSecret}
            placeholder="GOCSPX-..."
            isSet={serverSettings?.google_client_secret_set}
            language={language}
          />

          {/* Login / Logout */}
          {googleStatus?.connected ? (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span className="text-sm font-sans text-emerald-700 dark:text-emerald-400">
                  {googleStatus.email || t(language, 'set_google_connected')}
                </span>
              </div>
              <button
                onClick={handleGoogleLogout}
                className="text-sm font-sans font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {t(language, 'set_google_logout')}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || (!serverSettings?.google_client_id_set && !googleClientId)}
              className="w-full mt-2 py-2.5 rounded-lg border-2 border-[#4285F4] dark:border-blue-500 text-[#4285F4] dark:text-blue-400 text-sm font-sans font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {googleLoading ? (
                <><RefreshCw size={14} className="animate-spin" /> {t(language, 'set_google_connecting')}</>
              ) : (
                t(language, 'set_google_login')
              )}
            </button>
          )}
        </div>

        {/* ── Tryb testowy ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
          <SectionHeader
            icon={Settings2}
            title={t(language, 'set_mock_title')}
            iconBg="bg-orange-50 dark:bg-orange-900/20"
            iconColor="#F59E0B"
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mb-4">{t(language, 'set_mock_desc')}</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                role="switch"
                aria-checked={discoveryMock}
                checked={discoveryMock}
                onChange={e => setDiscoveryMock(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-10 h-5 rounded-full transition-colors ${discoveryMock ? 'bg-orange-400' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${discoveryMock ? 'translate-x-5' : ''}`} />
              </div>
            </div>
            <span className="text-sm font-sans text-[#0D2535] dark:text-slate-300">{t(language, 'set_mock_label')}</span>
            {discoveryMock && (
              <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full font-sans font-medium">
                MOCK
              </span>
            )}
          </label>
        </div>

        {/* ── Zużycie i Koszty ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center border border-orange-100 dark:border-orange-900/30">
                <BarChart3 size={16} className="text-orange-500" />
              </div>
              <div>
                <h2 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100">{t(language, 'usage_title')}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">{t(language, 'usage_desc')}</p>
              </div>
            </div>
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-sans font-medium text-slate-400 dark:text-slate-500 hover:text-[#14B8A6] dark:hover:text-teal-400 transition-colors"
            >
              Anthropic Console <ExternalLink size={12} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-[#333333] bg-slate-50/50 dark:bg-[#111111]">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-sans font-medium text-slate-500 dark:text-slate-400">{t(language, 'usage_tokens')}</p>
                <Cpu size={14} className="text-slate-400 dark:text-slate-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-sans font-bold text-[#0D2535] dark:text-slate-100">—</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-2">
                {language === 'pl' ? 'Sprawdź w Anthropic Console' : 'Check in Anthropic Console'}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 dark:border-[#333333] bg-slate-50/50 dark:bg-[#111111]">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-sans font-medium text-slate-500 dark:text-slate-400">{t(language, 'usage_cost')}</p>
                <CreditCard size={14} className="text-slate-400 dark:text-slate-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-sans font-bold text-[#0D2535] dark:text-slate-100">—</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-2">
                {language === 'pl' ? 'Sprawdź w Anthropic Console' : 'Check in Anthropic Console'}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 dark:border-[#333333] bg-slate-50/50 dark:bg-[#111111] flex flex-col justify-center items-center text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-sans">
                {language === 'pl'
                  ? 'Koszty są widoczne w Anthropic Console po zalogowaniu się kluczem API.'
                  : 'Costs are visible in Anthropic Console after logging in with your API key.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Zapis ────────────────────────────────────────────────── */}
        <div className="flex justify-end pt-2 pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 rounded-md text-sm font-sans font-medium transition-all shadow-sm flex items-center gap-2 ${saved
                ? 'bg-[#10B981] text-white border border-[#10B981]'
                : 'bg-[#14B8A6] hover:bg-[#0D9488] text-white border border-transparent disabled:opacity-60'
              }`}
          >
            {saving && <RefreshCw size={14} className="animate-spin" />}
            {saved ? t(language, 'set_saved') : saving ? (language === 'pl' ? 'Zapisywanie...' : 'Saving...') : t(language, 'set_save')}
          </button>
        </div>
      </div>
    </div>
  )
}
