'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MapPin, Settings, Fish, Ship } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Pesqueiros', href: '/pesqueiro', icon: MapPin },
  { label: 'Navios', href: '/navios', icon: Ship },
  { label: 'Admin', href: '/admin', icon: Settings },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      <div className="px-6 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Fish className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-stone-900 dark:text-stone-50 tracking-tight font-display">
            Pesca PR
          </h1>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium tracking-wide uppercase">
            Litoral do Paraná
          </p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 text-left w-full
                ${isActive
                  ? 'bg-blue-50 text-blue-700 border-l-[3px] border-blue-500 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-400'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-200 border-l-[3px] border-transparent'
                }
              `}
            >
              <item.icon
                className={`w-[18px] h-[18px] shrink-0 ${
                  isActive
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-stone-400 group-hover:text-stone-600 dark:text-stone-500 dark:group-hover:text-stone-300'
                }`}
                strokeWidth={1.75}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
