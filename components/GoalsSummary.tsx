import Link from 'next/link'
import { ArrowRight, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { GoalWithProgress } from '@/app/metas/page'

const TYPE_LABELS = {
  savings: 'Economia',
  expense_limit: 'Limite',
  income_target: 'Receita',
}

const BAR_COLORS = {
  ok: 'bg-accent',
  warning: 'bg-yellow-500',
  danger: 'bg-danger',
  completed: 'bg-success',
}

export default function GoalsSummary({ goals }: { goals: GoalWithProgress[] }) {
  return (
    <div className="glass-panel rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
          <Target className="w-4 h-4 text-accent" />
          Metas
        </h2>
        <Link href="/metas" className="text-accent hover:text-accent-hover text-sm font-semibold flex items-center gap-1.5 transition-all hover:translate-x-1">
          Ver todas <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-5">
        {goals.map((goal) => (
          <div key={goal.id}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-white text-sm font-medium block">{goal.name}</span>
                <span className="text-text-muted text-xs">{TYPE_LABELS[goal.type]}</span>
              </div>
              <span className="text-text-muted text-xs text-right shrink-0 ml-2">
                {goal.progress}%
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[goal.status]}`}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-text-muted text-xs">{formatCurrency(goal.current)}</span>
              <span className="text-text-muted text-xs">{formatCurrency(Number(goal.targetAmount))}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
