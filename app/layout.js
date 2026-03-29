import { Suspense } from 'react'
import { UserProvider } from '@/lib/contexts/UserContext'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata = {
  title: 'Civic Issue System | Digital Governance',
  description: 'A modern platform for citizens to report and track civic issues with AI-powered analysis and real-time updates.',
}

function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#AAAAAA] text-sm">
          Loading CivicPulse...
        </p>
      </div>
    </div>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <UserProvider>
          <Suspense fallback={<GlobalLoading />}>
            {children}
          </Suspense>
          <Toaster
            position="top-right"
            toastOptions={{ duration: 3000 }}
          />
        </UserProvider>
      </body>
    </html>
  )
}
