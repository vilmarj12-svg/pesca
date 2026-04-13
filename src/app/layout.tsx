import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pesca PR',
  description: 'Previsão de pesca para o litoral do Paraná',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
