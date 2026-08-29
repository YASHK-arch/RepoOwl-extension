import React from 'react';
import WebGLBackground from './WebGLBackground';

const ITEMS = [
  { value: '7', label: 'GitHub Actions', bg: '#F8E71C' },
  { value: '3-Step', label: 'Setup Wizard', bg: '#50E3C2' },
  { value: 'Qwen 3.6 27B', label: 'AI Engine', bg: '#FF4F5E', text: '#fff' },
  { value: 'Apache 2.0', label: 'Open Source', bg: '#BD10E0', text: '#fff' },
];

export default function MetricBanner() {
  return (
    <div
      className="w-full relative overflow-hidden"
      style={{
        background: '#F0EDE8',
        borderTop: '4px solid #000',
        borderBottom: '4px solid #000',
      }}
    >
      <WebGLBackground style={{ opacity: 0.6 }} />
      
      {/* Subtle overlay with original dot-grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundColor: 'rgba(245, 235, 215, 0.65)',
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-[800px] mx-auto px-5 py-16 md:py-20 text-center">
        {/* Heading */}
        <h2 className="text-2xl md:text-[36px] font-black tracking-tighter text-black uppercase mb-4">
          Built for maintainers. <br className="block sm:hidden" /><span className="bg-[#50E3C2] text-black px-2 py-1 mt-1 sm:mt-0 inline-block shadow-[4px_4px_0px_#000]">Designed for speed.</span>
        </h2>
        <p className="text-[16px] font-bold text-black leading-relaxed mb-12 max-w-[560px] mx-auto">
          RepoOwl integrates natively into your GitHub ecosystem. With Supabase and Groq API, triage happens instantly and automatically.
        </p>

        {/* Stats row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0">
          {ITEMS.map((item, i) => (
            <div key={item.label} className="flex items-center">
              <div className="flex flex-col items-center px-4 md:px-8">
                <span className="text-[32px] md:text-[36px] font-black tracking-tighter text-black mb-1">
                  {item.value}
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest px-2 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]" style={{ backgroundColor: item.bg, color: item.text || '#000' }}>
                  {item.label}
                </span>
              </div>
              {i < ITEMS.length - 1 && (
                <div className="hidden sm:block h-12 w-[3px] bg-black" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
