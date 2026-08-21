import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Real SVG brand logos ─────────────────────────────────────────
const GitHubLogo = () => (
  <svg viewBox="0 0 24 24" width="36" height="36" fill="#1A1A1A">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const GroqLogo = () => (
  <svg viewBox="0 0 80 80" width="36" height="36">
    <circle cx="40" cy="40" r="40" fill="#F55036"/>
    <text x="40" y="53" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold" fontFamily="monospace">G</text>
  </svg>
);

const ChromeLogo = () => (
  <svg viewBox="0 0 100 100" width="36" height="36">
    <circle cx="50" cy="50" r="50" fill="#4285F4"/>
    <circle cx="50" cy="50" r="20" fill="white"/>
    <circle cx="50" cy="50" r="14" fill="#4285F4"/>
    <path d="M50 20 L88 85 L12 85 Z" fill="#EA4335" opacity="0.9" transform="rotate(0,50,50)"/>
    <path d="M50 20 L88 85 L12 85 Z" fill="#34A853" opacity="0.9" transform="rotate(120,50,50)"/>
    <path d="M50 20 L88 85 L12 85 Z" fill="#FBBC05" opacity="0.9" transform="rotate(240,50,50)"/>
    <circle cx="50" cy="50" r="18" fill="white"/>
    <circle cx="50" cy="50" r="12" fill="#4285F4"/>
  </svg>
);

const SupabaseLogo = () => (
  <svg viewBox="0 0 109 113" width="34" height="34">
    <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874L63.708 110.284z" fill="url(#supabase_grad1)"/>
    <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874L63.708 110.284z" fill="url(#supabase_grad2)" fillOpacity="0.2"/>
    <path d="M45.317 2.071c2.86-3.601 8.657-1.628 8.726 2.97l.442 67.251H9.83c-8.19 0-12.759-9.46-7.665-15.875L45.317 2.071z" fill="#3ECF8E"/>
    <defs>
      <linearGradient id="supabase_grad1" x1="53.974" y1="54.974" x2="94.163" y2="71.829" gradientUnits="userSpaceOnUse">
        <stop stopColor="#249361"/>
        <stop offset="1" stopColor="#3ECF8E"/>
      </linearGradient>
      <linearGradient id="supabase_grad2" x1="36.156" y1="30.578" x2="54.484" y2="65.081" gradientUnits="userSpaceOnUse">
        <stop/>
        <stop offset="1" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

const LlamaLogo = () => (
  <svg viewBox="0 0 80 80" width="36" height="36">
    <rect width="80" height="80" rx="16" fill="#1B3A5C"/>
    <text x="40" y="54" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="monospace">🦙</text>
  </svg>
);

const ShieldCheckLogo = () => (
  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#6B6A67" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
  </svg>
);

// ─── Feature data with real logo components ───────────────────────
const FEATURES = [
  {
    title: 'GitHub duplicate detection',
    desc: 'Watch any public repository for new issues, run client-side semantic similarity search with Llama 3, and flag duplicates before they pile up.',
    tag: 'AI TRIAGE',
    Logo: GitHubLogo,
  },
  {
    title: 'Powered by Groq + Llama 3.3',
    desc: 'Blazing-fast inference via Groq API. Your issue text is semantically understood — not just keyword-matched — for dramatically higher accuracy.',
    tag: 'AI ENGINE',
    Logo: GroqLogo,
  },
  {
    title: 'Chrome extension, zero install',
    desc: 'Drop the .zip into Chrome extensions, pin it, and you\'re done. No Node, no server, no config files. Works on any GitHub repo page instantly.',
    tag: 'BROWSER NATIVE',
    Logo: ChromeLogo,
  },
  {
    title: 'Supabase mediator & RLS',
    desc: 'A Supabase-backed central registry handles maintainer key distribution automatically. Row-Level Security ensures contributors only see what they should.',
    tag: 'AUTHENTICATION',
    Logo: SupabaseLogo,
  },
  {
    title: 'Privacy-first, $0 server cost',
    desc: 'All AI inference runs client-side. Your issue data never leaves your browser. No telemetry, no cloud processing, no monthly bill.',
    tag: 'PRIVACY',
    Logo: ShieldCheckLogo,
  },
];

// ─── Main Component ───────────────────────────────────────────────
export default function FeatureSlider() {
  const scrollRef = useRef(null);

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -440, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 440, behavior: 'smooth' });

  return (
    <div className="w-full relative py-16 md:py-20 overflow-hidden" style={{ borderTop: '1px solid #E8E5E0' }}>
      {/* Section Header */}
      <div className="relative z-10 text-center mb-12 px-5">
        <h2 className="text-3xl md:text-[40px] font-bold tracking-[-1px] text-[#1A1A1A] leading-tight">
          Features that work where you do
        </h2>
        <p className="mt-3 text-[15px] text-[#6B6A67] max-w-[520px] mx-auto leading-relaxed">
          Open a GitHub repo, let the AI scan, and get duplicate flags in seconds — all in your browser.
        </p>
      </div>

      <div className="relative w-full">
        {/* Nav Buttons */}
        <button
          onClick={scrollLeft}
          aria-label="Scroll left"
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <ChevronLeft className="w-4 h-4 text-[#1A1A1A]" strokeWidth={2} />
        </button>
        <button
          onClick={scrollRight}
          aria-label="Scroll right"
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <ChevronRight className="w-4 h-4 text-[#1A1A1A]" strokeWidth={2} />
        </button>



        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingLeft: '10%',
            paddingRight: '10%',
          }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>

          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="snap-center shrink-0 flex flex-col bg-white border border-[#E8E5E0] rounded-2xl hover:shadow-md transition-shadow duration-200"
              style={{
                width: 'clamp(280px, 38vw, 420px)',
                padding: '28px 28px 24px',
              }}
            >
              {/* Logo */}
              <div className="mb-5">
                <feature.Logo />
              </div>

              {/* Title */}
              <h3 className="text-[17px] font-semibold text-[#1A1A1A] mb-2.5 leading-snug">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-[13.5px] text-[#6B6A67] leading-[1.65] flex-grow">
                {feature.desc}
              </p>

              {/* Tag */}
              <div className="mt-8 pt-5 border-t border-[#F0EDE8]">
                <span className="text-[10px] font-semibold text-[#9A9896] uppercase tracking-[1.2px]">
                  {feature.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
