'use client'

import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex bg-stone-100 dark:bg-stone-950">
      <aside className="hidden md:flex md:w-64 md:flex-col bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 shrink-0">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
