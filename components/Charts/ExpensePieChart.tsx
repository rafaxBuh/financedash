'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { CategoryData } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  data: CategoryData[]
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: CategoryData }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length > 0) {
    const item = payload[0]
    return (
      <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-text-primary text-sm font-medium">{item.name}</p>
        <p className="text-text-secondary text-sm">{formatCurrency(item.value)}</p>
      </div>
    )
  }
  return null
}

export default function ExpensePieChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">
        Sem despesas para exibir
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
          )}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
