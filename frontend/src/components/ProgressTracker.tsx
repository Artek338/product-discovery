interface Props {
  progress: number   // 0-8
  currentNode?: string | null
  logs?: string[]
}

const NODES = [
  { key: 'SyntheticInterviewNode', label: 'Syntetyczne wywiady', step: 1 },
  { key: 'BehavioralInterviewNode', label: 'Wywiady behawioralne', step: 2 },
  { key: 'CompetitiveResearchNode', label: 'Research konkurencji', step: 3 },
  { key: 'EvidenceGradingNode', label: 'Ocena dowodów', step: 4 },
  { key: 'ForcesDiagramNode', label: 'Forces Diagram', step: 5 },
  { key: 'SynthesisNode', label: 'Synteza JTBD', step: 6 },
  { key: 'AssumptionMapNode', label: 'Mapa założeń', step: 7 },
  { key: 'ScorecardNode', label: 'Scorecard', step: 8 },
]

export default function ProgressTracker({ progress, currentNode, logs = [] }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {NODES.map((node) => {
          const done = progress >= node.step
          const active = currentNode === node.key
          return (
            <div
              key={node.key}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                active ? 'bg-indigo-50 border border-indigo-200' :
                done ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              <span className="text-xl w-6 text-center">
                {done && !active ? '✅' : active ? '🔄' : '⏳'}
              </span>
              <span className={`text-sm font-medium ${
                active ? 'text-indigo-700' : done ? 'text-green-700' : 'text-gray-500'
              }`}>
                {node.step}. {node.label}
              </span>
              {active && (
                <span className="ml-auto text-xs text-indigo-500 animate-pulse">
                  W toku...
                </span>
              )}
            </div>
          )
        })}
      </div>

      {logs.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto">
          {logs.map((log, i) => (
            <p key={i} className="text-xs text-green-400 font-mono leading-5">
              {log}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
