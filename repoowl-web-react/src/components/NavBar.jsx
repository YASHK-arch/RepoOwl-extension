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
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[18px]">
      <div
        className="h-16 px-6 flex items-center transition-all duration-220"
        style={{
          background: scrolled ? 'rgba(13,17,23,0.88)' : 'rgba(13,17,23,0.55)',
          borderBottom: scrolled ? '1px solid #30363D' : '1px solid transparent',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: '#FF5722',
              boxShadow: '0 0 12px rgba(255,87,34,0.4)',
            }}
          >
            <img src="/assets/OWL.svg" alt="RepoOwl" className="w-[22px] h-[22px]" />
          </div>
          <span className="font-bold text-lg tracking-[-0.3px]" style={{ color: '#F0F6FC' }}>
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
          className="ml-auto md:ml-7 px-[18px] py-[9px] rounded-[10px] font-semibold text-[13px] text-white flex items-center gap-2 transition-all duration-180"
          style={{ background: '#FF5722' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,87,34,0.85)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255,87,34,0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FF5722';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Download className="w-[15px] h-[15px]" />
          Download .zip
        </a>
      </div>
    </div>
  );
}

function NavLink({ href, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      className="text-sm font-medium transition-colors duration-150"
      style={{ color: hovered ? '#F0F6FC' : '#8B949E' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  );
}
