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
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-text-primary font-semibold text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-accent" />
          Metas
        </h2>
        <Link href="/metas" className="text-accent hover:text-accent-hover text-xs flex items-center gap-1 transition-colors">
          Ver todas <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id}>
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-text-primary text-sm font-medium">{goal.name}</span>
                <span className="text-text-muted text-xs">{TYPE_LABELS[goal.type]}</span>
              </div>
              <span className="text-text-muted text-xs">
                {formatCurrency(goal.current)} / {formatCurrency(Number(goal.targetAmount))}
              </span>
            </div>
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[goal.status]}`}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
