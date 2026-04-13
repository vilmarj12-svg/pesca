'use client'

import type { SnapshotGrafico } from '@/lib/types'

export function Score72h({ snapshots }: { snapshots: SnapshotGrafico[] }) {
  return (
    <div className="relative h-[180px] flex items-end gap-[2px]">
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-[10] bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-200/30" />
        <div className="flex-[15] bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-200/30" />
        <div className="flex-[15] bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200/30" />
        <div className="flex-[15] bg-orange-50/50 dark:bg-orange-950/20 border-b border-orange-200/30" />
        <div className="flex-[45] bg-red-50/30 dark:bg-red-950/10" />
      </div>
      {snapshots.map((s, i) => {
        const color = s.score >= 80 ? 'bg-emerald-500' : s.score >= 60 ? 'bg-amber-400' : s.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
        return (
          <div
            key={i}
            className={`relative flex-1 ${color} rounded-t-sm opacity-80 hover:opacity-100 transition-opacity`}
            style={{ height: `${s.score}%` }}
            title={`${s.timestamp.split('T')[1]?.slice(0, 5) ?? ''} — Score ${s.score}`}
          />
        )
      })}
    </div>
  )
}
