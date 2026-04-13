import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/shell/AppShell'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Pesca PR',
  description: 'Previsão de pesca para o litoral do Paraná',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ErrorBoundary>
          <AppShell>{children}</AppShell>
        </ErrorBoundary>
      </body>
    </html>
  )
}
