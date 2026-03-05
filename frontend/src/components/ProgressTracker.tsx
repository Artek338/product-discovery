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
    <div data-testid="progress-tracker" className="space-y-5">
      <div className="space-y-1.5">
        {NODES.map((node) => {
          const done = progress >= node.step
          const active = currentNode === node.key
          return (
            <div
              key={node.key}
              data-testid="progress-node"
              data-node={node.key}
              data-status={active ? 'active' : done ? 'done' : 'pending'}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'border border-teal-500 bg-[#F0FDFA]'
                  : done
                  ? 'bg-[#DCFCE7]'
                  : 'bg-surface'
              }`}
            >
              {/* Dot indicator */}
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  active ? 'bg-teal-500 animate-pulse' :
                  done ? 'bg-success' :
                  'bg-slate-300'
                }`}
              />

              <span className={`text-sm font-sans font-medium ${
                active ? 'text-teal-600' :
                done ? 'text-[#15803D]' :
                'text-slate-400'
              }`}>
                <span className="font-mono text-xs mr-1.5 opacity-60">{node.step}.</span>
                {node.label}
              </span>

              {active && (
                <span className="ml-auto text-xs text-teal-500 font-sans animate-pulse">
                  W toku...
                </span>
              )}
              {done && !active && (
                <span className="ml-auto text-xs text-[#15803D] font-sans">✓</span>
              )}
            </div>
          )
        })}
      </div>

      {logs.length > 0 && (
        <div className="bg-sidebar rounded-[12px] p-4 max-h-48 overflow-y-auto">
          {logs.map((log, i) => (
            <p key={i} className="text-xs text-teal-400 font-mono leading-5">
              {log}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
