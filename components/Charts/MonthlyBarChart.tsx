'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { MonthlyData } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  data: MonthlyData[]
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-surface border border-border rounded-lg px-3 py-2.5 shadow-lg space-y-1">
        <p className="text-text-primary text-sm font-medium mb-2">{label}</p>
        {payload.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-text-secondary text-xs capitalize">
              {item.name === 'income' ? 'Receitas' : 'Despesas'}:
            </span>
            <span className="text-text-primary text-xs font-medium">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function MonthlyBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={4} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
          }
          width={50}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
        <Legend
          formatter={(value) => (
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>
              {value === 'income' ? 'Receitas' : 'Despesas'}
            </span>
          )}
          iconType="square"
          iconSize={10}
        />
        <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
