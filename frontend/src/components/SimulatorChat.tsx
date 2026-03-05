import { useState, useRef, useEffect } from 'react'
import type { ChatMessage, ResponseQuality, SyntheticProfile } from '../types/discovery'
import { api } from '../lib/api'
import { Send, Eye, EyeOff } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'

interface Props {
  archetype: SyntheticProfile
  messages: ChatMessage[]
  onMessage: (msg: ChatMessage) => void
}

const QUALITY_CONFIG: Record<ResponseQuality, { label: string; icon: string; classes: string }> = {
  genuine: { label: 'Genuine Insight', icon: '✅', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  detailed: { label: 'Detailed Recount', icon: '📝', classes: 'bg-blue-50 text-blue-700 border-blue-100' },
  polite_lie: { label: 'Polite Lie', icon: '🚩', classes: 'bg-red-50 text-red-700 border-red-100' },
  vague: { label: 'Vague Stance', icon: '⚠️', classes: 'bg-amber-50 text-amber-700 border-amber-100' },
}

function QualityBadge({ quality }: { quality?: ResponseQuality }) {
  if (!quality) return null
  const cfg = QUALITY_CONFIG[quality]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-sans font-semibold px-2.5 py-1 rounded-full border ${cfg.classes}`}>
      <span>{cfg.icon}</span> {cfg.label}
    </span>
  )
}

export default function SimulatorChat({ archetype, messages, onMessage }: Props) {
  const { language } = useAppStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const buildHistoryStr = () =>
    messages
      .map(m => `${m.role === 'user' ? 'Interviewer' : archetype.archetype_name}: ${m.content}`)
      .join('\n')

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput('')

    onMessage({ role: 'user', content: question })
    setLoading(true)

    try {
      const answer = await api.askQuestion({
        archetype,
        question,
        history: buildHistoryStr(),
      })

      onMessage({
        role: 'assistant',
        content: answer.response,
        quality: answer.response_quality as ResponseQuality,
        hidden_thought: answer.hidden_thought,
        follow_up_suggested: answer.follow_up_suggested,
      })
    } catch (err) {
      onMessage({
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Unknown error occurred.'}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-testid="simulator-chat" className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Nagłówek */}
      <div className="px-6 py-4 border-b border-[#E2E8F0] bg-white rounded-t-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-xl shadow-sm">
            👤
          </div>
          <div>
            <p className="text-sm font-sans font-bold text-[#0D2535]">
              {archetype.archetype_name}
            </p>
            <p className="text-xs text-slate-500 font-sans mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {t(language, 'chat_ready')}
            </p>
          </div>
        </div>
      </div>

      {/* Wiadomości */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] flex items-center justify-center text-2xl mb-4">
              💬
            </div>
            <h3 className="font-sans font-semibold text-[#0D2535] mb-2">{t(language, 'chat_empty_title')}</h3>
            <p className="text-sm font-sans leading-relaxed">
              {t(language, 'chat_empty_sub')}
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} data-testid="chat-message" data-role={msg.role} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

              <div className="flex items-end gap-2 mb-1.5">
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[10px] shadow-sm shrink-0 mb-1">
                    👤
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`px-5 py-3.5 text-sm font-sans leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-[#14B8A6] text-white rounded-2xl rounded-br-sm'
                    : 'bg-white border border-[#E2E8F0] text-[#0D2535] rounded-2xl rounded-bl-sm'
                    }`}
                >
                  {msg.content}
                </div>
              </div>

              {/* Badge jakości + rozwijany panel (tylko assistant) */}
              {msg.role === 'assistant' && msg.quality && (
                <div className="ml-8 w-full">
                  <div className="flex items-center gap-3">
                    <QualityBadge quality={msg.quality} />
                    <button
                      onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                      className="text-xs font-sans font-medium text-slate-400 hover:text-[#0D2535] transition-colors flex items-center gap-1"
                    >
                      {expandedIdx === idx ? <><EyeOff size={12} /> {t(language, 'chat_hide_insights')}</> : <><Eye size={12} /> {t(language, 'chat_reveal')}</>}
                    </button>
                  </div>

                  {expandedIdx === idx && (
                    <div className="mt-3 bg-white rounded-xl p-4 text-xs font-sans space-y-4 border border-[#E2E8F0] shadow-sm relative before:absolute before:content-[''] before:w-3 before:h-3 before:bg-white before:border-l before:border-t before:border-[#E2E8F0] before:rotate-45 before:-top-1.5 before:left-6">
                      {msg.hidden_thought && (
                        <div>
                          <span className="font-semibold text-indigo-600 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide text-[10px]">
                            <span className="text-sm">💭</span> {t(language, 'chat_hidden_thought')}
                          </span>
                          <p className="text-slate-600 leading-relaxed italic border-l-2 border-indigo-100 pl-3 py-0.5">{msg.hidden_thought}</p>
                        </div>
                      )}
                      {msg.follow_up_suggested && (
                        <div>
                          <span className="font-semibold text-blue-600 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide text-[10px]">
                            <span className="text-sm">🎯</span> {t(language, 'chat_ideal_followup')}
                          </span>
                          <p className="text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-50">"{msg.follow_up_suggested}"</p>
                          <button
                            className="mt-2 text-[#14B8A6] hover:text-[#0D9488] font-medium text-xs flex items-center gap-1"
                            onClick={() => {
                              setInput(msg.follow_up_suggested!)
                              setExpandedIdx(null)
                            }}
                          >
                            {t(language, 'chat_use_followup')} <span className="text-lg leading-none">→</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-6 h-6 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[10px] shadow-sm shrink-0 mb-1">
                👤
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2h-2 rounded-full bg-[#14B8A6] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#E2E8F0] bg-white rounded-b-2xl z-10">
        <div className="flex gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1.5 focus-within:border-[#14B8A6] focus-within:ring-1 focus-within:ring-[#14B8A6] transition-all">
          <input
            data-testid="chat-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={t(language, 'chat_ph')}
            disabled={loading}
            className="flex-1 bg-transparent px-4 py-2 outline-none font-sans text-sm text-[#0D2535] placeholder:text-slate-400"
          />
          <button
            data-testid="send-message-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Wyślij"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] font-sans text-slate-400 font-medium">{t(language, 'chat_disclaimer')}</span>
        </div>
      </div>
    </div>
  )
}
