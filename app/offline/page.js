import Link from 'next/link';
import { WifiOff, Home } from 'lucide-react';

export const metadata = {
  title: 'Offline | CivicPulse',
  description: 'You are currently offline.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#1A1A1A] p-8 rounded-3xl max-w-md w-full border border-[#333333] shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A623]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex justify-center mb-6 relative">
          <div className="w-20 h-20 bg-[#F5A623]/20 rounded-full flex items-center justify-center animate-pulse">
            <WifiOff className="w-10 h-10 text-[#F5A623]" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3">You're Offline</h1>
        <p className="text-[#AAAAAA] mb-8 text-lg">
          It looks like you've lost your internet connection. 
          Don't worry, you can still view pages you've already visited.
        </p>
        
        <Link 
          href="/"
          className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-black font-semibold py-4 px-6 rounded-xl w-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
        >
          <Home className="w-5 h-5" />
          Return Home
        </Link>

        <p className="mt-6 text-sm text-[#777777]">
          The app will automatically reconnect when your connection returns.
        </p>
      </div>
    </div>
  );
}
