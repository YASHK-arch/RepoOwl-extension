import React, { useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import AsciiDonut from './AsciiDonut';

const C = {
  border: '#30363D',
  accent: '#FF5722',
  textPrimary: '#F0F6FC',
  textSecondary: '#8B949E',
};

export default function CtaFooter() {
  return (
    <>
      <CtaSection />
      <Footer />
    </>
  );
}

function CtaSection() {
  return (
    <div
      className="w-full relative overflow-hidden"
      style={{ borderTop: `1px solid ${C.border}` }}
    >
      {/* Spinning ASCII donut — full-bleed centered, matches Flutter _CtaSection Positioned.fill */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ opacity: 0.15 }}
      >
        <AsciiDonut opacity={1} />
      </div>

      <div className="relative z-10 px-5 md:px-12 py-[72px] md:py-[100px] flex justify-center">
        <div className="max-w-[700px] w-full flex flex-col items-center text-center">
          <h2
            className="text-3xl md:text-[52px] font-extrabold tracking-[-1.2px] mb-4"
            style={{ color: C.textPrimary }}
          >
            Get started in 2 clicks.
          </h2>
          <p className="text-[16px] leading-[1.6] mb-11" style={{ color: C.textSecondary }}>
            No account. No server. No data collection.
            <br />
            Just drop it in Chrome and triage smarter.
          </p>

          <PulseButton />

          <p className="mt-5 text-xs" style={{ color: `${C.textSecondary}A6` }}>
            Free forever&nbsp;&nbsp;·&nbsp;&nbsp;Apache 2.0 Licensed&nbsp;&nbsp;·&nbsp;&nbsp;Open Source
          </p>
        </div>
      </div>
    </div>
  );
}

function PulseButton() {
  const [pulse, setPulse] = useState(0);
  const [hovered, setHovered] = useState(false);
  const rafRef = useRef();
  const startRef = useRef();

  useEffect(() => {
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const t = (ts - startRef.current) / 1600;
      setPulse((Math.sin(t * Math.PI * 2) + 1) / 2);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const glowOp = 0.35 + pulse * 0.3;
  const glowBlur = 24 + pulse * 20;
  const spreadPx = Math.round(pulse * 4);

  return (
    <a
      href="https://github.com/YASHK-arch/RepoOwl-extension/releases/download/v0.1.1-client-side-overhaul/RepoOwl_v0.1.1.zip"
      className="flex items-center gap-3 px-10 py-5 rounded-[14px] font-bold text-[18px] text-white transition-colors duration-150"
      style={{
        background: hovered ? `rgba(255,87,34,0.9)` : C.accent,
        boxShadow: `0 0 ${glowBlur}px ${spreadPx}px rgba(255,87,34,${glowOp}), 0 0 60px rgba(255,87,34,0.15)`,
        letterSpacing: '-0.2px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Download className="w-[22px] h-[22px]" />
      Download RepoOwl.zip
    </a>
  );
}

function Footer() {
  const links = [
    { label: 'GitHub', href: 'https://github.com/YASHK-arch/RepoOwl-extension.git' },
    { label: 'Apache 2.0 License', href: 'https://github.com/YASHK-arch/RepoOwl-extension/blob/main/LICENSE' },
    { label: 'View Source', href: 'https://github.com/YASHK-arch/RepoOwl-extension.git' },
  ];

  return (
    <div
      className="w-full px-5 md:px-12 py-8 relative overflow-hidden"
      style={{ borderTop: `1px solid ${C.border}` }}
    >
      {/* Ghost watermark text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none font-black tracking-[12px] text-[56px] md:text-[120px]"
        style={{ color: `${C.textPrimary}07`, fontFamily: 'Inter' }}
      >
        REPOOWL
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Links row */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-0">
          {links.map((link, i) => (
            <React.Fragment key={link.label}>
              <FooterLink href={link.href}>{link.label}</FooterLink>
              {i < links.length - 1 && (
                <span className="hidden md:inline px-2" style={{ color: C.textSecondary }}>·</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <p className="text-xs" style={{ color: C.textSecondary }}>
          © 2026 RepoOwl. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function FooterLink({ href, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      className="text-sm transition-colors duration-150"
      style={{ color: hovered ? C.textPrimary : C.textSecondary }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  );
}
