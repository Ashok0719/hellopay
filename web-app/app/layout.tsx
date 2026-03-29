import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HelloPay | Secure Stock Claims & UPI Wallet',
  description: 'The futuristic fintech ecosystem for secure stock listings, UPI-verified claims, and AI-powered payment verification.',
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
