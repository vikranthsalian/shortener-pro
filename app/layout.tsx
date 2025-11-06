import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shortner Pro - URL Shortener, Link Analytics & Monetization Platform",
  description:
    "Create short links with advanced analytics, track clicks, and earn money with every view. Shortner Pro is the best free URL shortener for businesses, marketers, and content creators.",
  keywords: [
    "URL shortener",
    "Shortner Pro",
    "Url Shortner",
    "short link",
    "link shortener",
    "short URL",
    "link analytics",
    "monetize links",
    "click tracker",
    "URL tracking",
  ],
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  authors: [{ name: "Shortner Pro" }],
  creator: "Shortner Pro",
  publisher: "Shortner Pro",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://shortner-pro.com",
    siteName: "Shortner Pro",
    title: "Shortner Pro - URL Shortener & Monetization",
    description:
      "Create professional short links with analytics, track clicks, and monetize your content with Shortner Pro.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://shortner-pro.com"}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Shortner Pro - URL Shortener Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shortner Pro - URL Shortener & Monetization",
    description: "Create short links, track analytics, and earn money with Shortner Pro.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || "https://shortner-pro.com"}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "2CQJB7Lwkk-y4EVGbHqjdmCh81h_g_5UkJqiLUaiULA",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || "https://shortner-pro.com",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://shortner-pro.com"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Shortner Pro",
    description: "Create short links, track analytics, and earn money with Shortner Pro URL shortener.",
    url: baseUrl,
    potentialAction: {
      "@type": "CreateAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/?url={url}`,
      },
    },
    organization: {
      "@type": "Organization",
      name: "Shortner Pro",
      description: "Professional URL shortener and link analytics platform",
      url: baseUrl,
      logo: `${baseUrl}/shortner-pro-logo.png`,
      sameAs: [
        "https://twitter.com/shortnerpro",
        "https://www.facebook.com/shortnerpro",
        "https://www.linkedin.com/company/shortnerpro",
      ],
    },
  }

  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-3042492065432652" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <link rel="icon" href="/favicon.jpg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.jpg" />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

        {/* Preconnect to Google APIs for performance */}
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
