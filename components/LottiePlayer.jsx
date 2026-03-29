'use client';

export default function LottiePlayer({
  src,
  loop = true,
  autoplay = true,
  style = { height: '300px', width: '300px' },
  className = ""
}) {
  return (
    <div className={`${className} flex items-center justify-center`} style={style}>
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4 rounded-[32px] border border-gold/20 bg-gold/5 text-gold/40">
        <div className={`flex h-24 w-24 items-center justify-center rounded-full border border-gold/30 ${autoplay ? 'animate-pulse' : ''}`}>
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m12 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <span className="text-xs font-medium uppercase tracking-[0.3em]">
          {loop ? 'Motion Preview' : 'Success State'}
        </span>
      </div>
    </div>
  );
}
