'use client'

import { useState, useEffect } from 'react'
import { X, Share, Download } from 'lucide-react'

export default function PwaInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

    // Check if dismissed in localStorage
    if (localStorage.getItem('pwaPromptDismissed') === 'true') {
      setDismissed(true)
      return
    }

    // Android/Chrome logic
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // iOS Safari detection
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // @ts-ignore
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    
    // Only show iOS prompt if NOT standalone and running on iOS Safari
    if (isIosDevice && !isStandalone) {
      setIsIOS(true)
      setIsInstallable(true)
    }

    // Hide if it's already installed
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the native prompt
    deferredPrompt.prompt()

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstallable(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwaPromptDismissed', 'true')
  }

  if (!isInstallable || dismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 flex justify-center translate-y-0 transition-transform duration-500 ease-out">
      <div 
        className="bg-[#1A1A1A] border border-[#333333] shadow-2xl rounded-2xl w-full max-w-md overflow-hidden relative animate-in slide-in-from-bottom"
        style={{ animationDuration: '0.4s' }}
      >
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-[#777777] hover:text-white transition-colors p-1"
          aria-label="Dismiss install prompt"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-5 flex items-start gap-4">
          <div className="w-14 h-14 bg-[#0A0A0A] rounded-xl overflow-hidden shadow-inner flex-shrink-0 flex items-center justify-center border border-[#333333]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="CivicPulse Icon" className="w-[85%] h-[85%] object-contain" />
          </div>
          
          <div className="flex-1 mt-0.5">
            <h3 className="font-semibold text-white">Install CivicPulse</h3>
            <p className="text-sm text-[#AAAAAA] mt-1 pr-6 leading-relaxed">
              Add app to your home screen for quick access and offline features.
            </p>
            
            {isIOS ? (
              <div className="mt-4 bg-[#0A0A0A] border border-[#333333] rounded-lg p-3 text-sm text-[#EEEEEE]">
                Tap <Share className="w-[18px] h-[18px] inline-block mx-1 pb-0.5 text-blue-400" /> in the Safari menu, then <strong className="text-white">Add to Home Screen</strong>.
              </div>
            ) : (
              <button 
                onClick={handleInstallClick}
                className="mt-4 w-full bg-[#F5A623] hover:bg-[#F5A623]/90 text-black font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#F5A623]/20"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
