import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(240, 237, 232, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <div className="h-16 px-6 md:px-10 flex items-center max-w-[1200px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1A1A1A]">
            <img src="/assets/OWL.svg" alt="RepoOwl" className="w-[18px] h-[18px]" />
          </div>
          <span className="font-semibold text-[15px] tracking-[-0.3px] text-[#1A1A1A]">
            RepoOwl
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="ml-auto hidden md:flex items-center gap-7">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="https://github.com/YASHK-arch/RepoOwl-extension.git">GitHub</NavLink>
        </div>

        {/* CTA */}
        <a
          href="https://github.com/YASHK-arch/RepoOwl-extension/releases/download/v0.1.1-client-side-overhaul/RepoOwl_v0.1.1.zip"
          className="ml-auto md:ml-7 px-4 py-2 font-semibold text-[13px] text-white bg-[#1A1A1A] rounded-lg flex items-center gap-2 hover:bg-[#333] transition-colors duration-150"
        >
          <Download className="w-[13px] h-[13px]" strokeWidth={2.5} />
          Download
        </a>
      </div>
    </div>
  );
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-[#6B6A67] hover:text-[#1A1A1A] transition-colors duration-150"
    >
      {children}
    </a>
  );
}
