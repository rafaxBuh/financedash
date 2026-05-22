'use client'

import { MonthlyData, CategoryData } from '@/lib/types'
import MonthlyBarChart from '@/components/Charts/MonthlyBarChart'
import ExpensePieChart from '@/components/Charts/ExpensePieChart'

interface Props {
  monthlyData: MonthlyData[]
  categoryData: CategoryData[]
}

export default function DashboardCharts({ monthlyData, categoryData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-text-primary font-semibold text-sm mb-4">
          Receitas vs Despesas (últimos 6 meses)
        </h2>
        <MonthlyBarChart data={monthlyData} />
      </div>
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-text-primary font-semibold text-sm mb-4">
          Despesas por Categoria (mês atual)
        </h2>
        <ExpensePieChart data={categoryData} />
      </div>
    </div>
  )
}
