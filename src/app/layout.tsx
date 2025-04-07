'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <title>Var Bir Sebebi</title>
        <meta name="description" content="Herhangi bir yazarlık, şairlik iddiamız yok. Kendi halinde, neşeli, şakacı delikanlılarız." />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
} 