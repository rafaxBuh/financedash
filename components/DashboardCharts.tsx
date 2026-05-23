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
      <div className="glass-panel rounded-2xl p-5 lg:p-6">
        <h2 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">
          Receitas vs Despesas
        </h2>
        <MonthlyBarChart data={monthlyData} />
      </div>
      <div className="glass-panel rounded-2xl p-5 lg:p-6">
        <h2 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">
          Despesas por Categoria
        </h2>
        <ExpensePieChart data={categoryData} />
      </div>
    </div>
  )
}
