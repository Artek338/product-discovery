import { useState, useRef, useEffect } from 'react'
import type { ChatMessage, ResponseQuality, SyntheticProfile } from '../types/discovery'
import { api } from '../lib/api'

interface Props {
  archetype: SyntheticProfile
  messages: ChatMessage[]
  onMessage: (msg: ChatMessage) => void
}

const QUALITY_CONFIG: Record<ResponseQuality, { label: string; icon: string; classes: string }> = {
  genuine:    { label: 'GENUINE',      icon: '✅', classes: 'bg-green-100 text-green-700' },
  detailed:   { label: 'DETAILED',     icon: '💎', classes: 'bg-blue-100 text-blue-700' },
  polite_lie: { label: 'POLITE LIE',   icon: '🚩', classes: 'bg-red-100 text-red-700' },
  vague:      { label: 'VAGUE',        icon: '⚠️', classes: 'bg-amber-100 text-amber-700' },
}

function QualityBadge({ quality }: { quality?: ResponseQuality }) {
  if (!quality) return null
  const cfg = QUALITY_CONFIG[quality]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.classes}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

export default function SimulatorChat({ archetype, messages, onMessage }: Props) {
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
        content: `Błąd: ${err instanceof Error ? err.message : 'Nieznany błąd'}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Nagłówek */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <p className="text-sm font-semibold text-gray-700">
          Rozmowa z: <span className="text-indigo-600">{archetype.archetype_name}</span>
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Zadaj pytanie — Enter lub kliknij Wyślij</p>
      </div>

      {/* Wiadomości */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            <p className="text-2xl mb-2">💬</p>
            <p>Zadaj pierwsze pytanie archetypu</p>
            <p className="text-xs mt-1 text-gray-300">
              Wskazówka: zacznij od pytania o przeszłe zachowanie, nie preferencje
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-last' : ''}`}>
              {/* Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                }`}
              >
                {msg.content}
              </div>

              {/* Badge jakości + rozwijany panel (tylko assistant) */}
              {msg.role === 'assistant' && msg.quality && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <QualityBadge quality={msg.quality} />
                    <button
                      onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedIdx === idx ? 'ukryj ▲' : 'szczegóły ▼'}
                    </button>
                  </div>

                  {expandedIdx === idx && (
                    <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2 border border-gray-100">
                      {msg.hidden_thought && (
                        <div>
                          <span className="font-semibold text-purple-600">💭 Ukryta myśl:</span>
                          <p className="text-gray-600 mt-0.5 italic">{msg.hidden_thought}</p>
                        </div>
                      )}
                      {msg.follow_up_suggested && (
                        <div>
                          <span className="font-semibold text-blue-600">🎯 Follow-up:</span>
                          <p className="text-gray-600 mt-0.5">"{msg.follow_up_suggested}"</p>
                          <button
                            className="mt-1 text-blue-500 hover:text-blue-700 underline text-xs"
                            onClick={() => setInput(msg.follow_up_suggested!)}
                          >
                            Użyj tego pytania →
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
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Zadaj pytanie... (Enter = wyślij)"
            disabled={loading}
            className="input flex-1"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="btn-primary px-5"
          >
            Wyślij
          </button>
        </div>
      </div>
    </div>
  )
}
