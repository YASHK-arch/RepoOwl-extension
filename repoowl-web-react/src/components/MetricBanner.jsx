import React from 'react';
import WebGLBackground from './WebGLBackground';

const ITEMS = [
  { value: '100%', label: 'Client-Side' },
  { value: '$0', label: 'Server Costs' },
  { value: 'LLaMA 3.3', label: 'AI Engine' },
  { value: 'Apache 2.0', label: 'Open Source' },
];

export default function MetricBanner() {
  return (
    <div
      className="w-full relative overflow-hidden"
      style={{
        background: '#F0EDE8',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <WebGLBackground style={{ opacity: 0.6 }} />
      
      {/* Neutral overlay with dot-grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundColor: 'rgba(245, 235, 215, 0.65)', /* Pale wheatish/warm cream overlay */
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-[760px] mx-auto px-5 py-16 md:py-20 text-center">
        {/* Heading */}
        <h2 className="text-2xl md:text-[32px] font-bold tracking-[-0.5px] text-[#1A1A1A] mb-3">
          Built for privacy. Designed for speed.
        </h2>
        <p className="text-[14px] md:text-[15px] text-[#3A3A3A] leading-relaxed mb-12 max-w-[560px] mx-auto">
          RepoOwl runs entirely in your browser. No accounts, no servers, no monthly bill.
          Just open a GitHub repo and start triaging.
        </p>

        {/* Stats row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0">
          {ITEMS.map((item, i) => (
            <div key={item.label} className="flex items-center">
              <div className="flex flex-col items-center px-8">
                <span className="text-[28px] md:text-[34px] font-bold tracking-[-0.5px] text-[#1A1A1A]">
                  {item.value}
                </span>
                <span className="text-[10px] font-semibold text-[#3A3A3A] uppercase tracking-[1.2px] mt-1">
                  {item.label}
                </span>
              </div>
              {i < ITEMS.length - 1 && (
                <div className="hidden sm:block h-8 w-px bg-black/20" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
