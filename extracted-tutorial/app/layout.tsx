import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Link from "next/link"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SwiftUI Porting Guide - Satellite Development",
  description: "Transform React Native Web to SwiftUI for iOS, iPadOS, and macOS",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 items-center px-4">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">SwiftUI Porting Guide</span>
            </Link>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <Link href="/secrets" className="text-sm font-medium transition-colors hover:text-primary">
                Secrets
              </Link>
              <Link href="/satellite-components" className="text-sm font-medium transition-colors hover:text-primary">
                Components
              </Link>
            </div>
          </div>
        </nav>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
