import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "Last Staker Wins - Hedera Game",
  description: "Compete for the prize pool on Hedera Testnet",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Last Staker Wins - Hedera Game",
    description: "Compete for the prize pool on Hedera Testnet",
    images: [
      {
        url: "/LSW-logo.png",
        width: 1200,
        height: 630,
        alt: "Last Staker Wins Logo",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
