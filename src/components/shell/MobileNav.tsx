'use client'

import { useState } from 'react'
import { Menu, X, Fish } from 'lucide-react'
import { Sidebar } from './Sidebar'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="flex md:hidden items-center gap-3 px-4 py-3 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 -ml-1.5 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors"
        >
          <Menu className="w-5 h-5" strokeWidth={1.75} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
            <Fish className="w-3 h-3 text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold text-stone-900 dark:text-stone-50 font-display">
            Pesca PR
          </span>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800
          transform transition-transform duration-200 ease-out md:hidden
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="absolute top-4 right-3">
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:text-stone-300 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>
        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>
    </>
  )
}
