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
      <div className="h-16 px-6 md:px-12 w-full flex items-center mx-auto relative">
        {/* Logo */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1A1A1A]">
            <img src="/assets/OWL.svg" alt="RepoOwl" className="w-[26px] h-[26px]" />
          </div>
          <span className="font-bold text-[24px] tracking-[-0.6px] text-[#1A1A1A]">
            RepoOwl
          </span>
        </div>

        {/* Middle nav links */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-7">
          <NavLink href="#setup">Setup</NavLink>
          <NavLink href="#documentation">Documentation</NavLink>
          <NavLink href="#contributors">Contributors</NavLink>
        </div>

        {/* Right nav links & CTA */}
        <div className="ml-auto flex items-center gap-7 z-10">
          <div className="hidden md:flex items-center gap-7">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="https://github.com/YASHK-arch/RepoOwl-extension.git">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              GitHub
            </NavLink>
          </div>
          <a
            href="https://github.com/YASHK-arch/RepoOwl-extension/releases/download/v0.1.1-client-side-overhaul/RepoOwl_v0.1.1.zip"
            className="px-4 py-2 font-semibold text-[13px] text-white bg-[#1A1A1A] rounded-lg flex items-center gap-2 hover:bg-[#333] transition-colors duration-150"
          >
          <Download className="w-[13px] h-[13px]" strokeWidth={2.5} />
          Download
        </a>
      </div>
      </div>
    </div>
  );
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 text-sm font-medium text-[#6B6A67] hover:text-[#1A1A1A] transition-colors duration-150"
    >
      {children}
    </a>
  );
}
