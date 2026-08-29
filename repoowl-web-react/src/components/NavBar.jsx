import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  const [openIssues, setOpenIssues] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    fetch('https://api.github.com/repos/YASHK-arch/RepoOwl-extension')
      .then(res => res.json())
      .then(data => {
        if (data.open_issues_count !== undefined) {
          setOpenIssues(data.open_issues_count);
        }
      })
      .catch(console.error);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-150"
      style={{
        background: scrolled ? '#ffffff' : 'transparent',
        borderBottom: scrolled ? '4px solid #000' : 'none',
      }}
    >
      <div className="h-16 px-6 md:px-12 w-full flex items-center mx-auto relative">
        {/* Logo */}
        <div className="flex items-center gap-2 border-[2px] border-black p-1.5 px-3 shadow-[2px_2px_0px_#000] bg-white z-10 hover:shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all">
          <div className="w-6 h-6 flex items-center justify-center bg-black">
            <img src="/assets/OWL.svg" alt="RepoOwl" className="w-[16px] h-[16px]" />
          </div>
          <span className="text-[16px] font-black text-black uppercase tracking-widest">
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
          <div className="hidden md:flex items-center gap-5">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="https://github.com/YASHK-arch/RepoOwl-extension/issues" className="relative mr-2">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              GitHub
              {openIssues !== null && (
                <span className="absolute -bottom-2 -right-3 bg-white text-black text-[9px] font-black px-1.5 py-0 rounded-full border-2 border-black shadow-[2px_2px_0px_#FF4F5E]">
                  {openIssues}
                </span>
              )}
            </NavLink>
          </div>
          <a
            href="https://github.com/YASHK-arch/RepoOwl-extension/releases/download/v1.0.0/repoowl-production-release.zip"
            className="px-4 py-2 font-black uppercase tracking-widest text-[13px] text-black bg-[#F8E71C] border-[2px] border-black rounded-none shadow-[4px_4px_0px_#000] flex items-center gap-2 hover:shadow-[6px_6px_0px_#000] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all"
          >
          <Download className="w-[14px] h-[14px] text-black" strokeWidth={3} />
          Download
        </a>
      </div>
      </div>
    </div>
  );
}

function NavLink({ href, children, className = '' }) {
  return (
    <a
      href={href}
      className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-black hover:bg-[#50E3C2] hover:shadow-[2px_2px_0px_#000] border-2 border-transparent hover:border-black px-2 py-1 transition-all duration-150 relative ${className}`}
    >
      {children}
    </a>
  );
}
