import type { IscaEmAltaView } from '@/lib/types'

export function IscasEmAlta({ iscas }: { iscas: IscaEmAltaView[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {iscas.map((isca) => (
        <div key={isca.nome} className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">{isca.tipo === 'natural' ? '🪱' : '🎣'}</span>
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{isca.nome}</span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${
              isca.tipo === 'natural'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
            }`}>{isca.tipo}</span>
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mb-1.5">{isca.destaque}</p>
          <div className="flex flex-wrap gap-1">
            {isca.especies.map((esp) => (
              <span key={esp} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300">{esp}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
