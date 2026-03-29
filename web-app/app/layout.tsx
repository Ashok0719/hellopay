import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HelloPay | Advanced UPI Claims & Stock Registry',
  description: 'The futuristic fintech ecosystem for secure stock listings, UPI-verified claims, and real-time payment reconciliation.',
  keywords: ['fintech', 'upi', 'stock registry', 'hellopay', 'secure payments', 'india', 'neural core'],
  authors: [{ name: 'HelloPay Neural' }],
  openGraph: {
    title: 'HelloPay | Secure UPI Claims Ecosystem',
    description: 'Transforming stock claims with UPI-ready security and real-time verification.',
    url: 'https://hellopayapp.com',
    siteName: 'HelloPay',
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        {children}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </body>
    </html>
  )
}
