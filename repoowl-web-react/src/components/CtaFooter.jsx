import React, { useState } from 'react';
import { Download } from 'lucide-react';
import AsciiDonut from './AsciiDonut';

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
      style={{ borderTop: '4px solid #000', backgroundColor: '#F8E71C' }}
    >
      {/* ASCII Donut — faint centered background animation */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ opacity: 0.15 }}
      >
        <AsciiDonut opacity={1} />
      </div>

      <div className="relative z-10 px-5 md:px-12 py-20 md:py-28 flex justify-center">
        <div className="max-w-[600px] w-full flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-[48px] font-black tracking-tighter mb-4 text-black uppercase">
            Get started in 2 clicks.
          </h2>
          <p className="text-[16px] font-bold leading-[1.7] mb-10 text-black">
            Automated issue triaging and PR slop detection directly in your repository.
            <br />
            Drop it in Chrome, link your Supabase, and let GitHub Actions do the rest.
          </p>

          <a
            href="https://github.com/YASHK-arch/RepoOwl-extension/releases/download/v1.0.0/repoowl-production-release.zip"
            className="flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-[16px] text-black bg-[#FF4F5E] border-[3px] border-black rounded-none shadow-[6px_6px_0px_#000] hover:shadow-[10px_10px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200"
          >
            <Download className="w-[20px] h-[20px] text-black" strokeWidth={3} />
            Download RepoOwl.zip
          </a>

          <p className="mt-6 text-[12px] font-black text-black uppercase tracking-widest">
            Free forever&nbsp;&nbsp;·&nbsp;&nbsp;Apache 2.0 Licensed&nbsp;&nbsp;·&nbsp;&nbsp;Open Source
          </p>
        </div>
      </div>
    </div>
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
      className="w-full px-5 md:px-12 py-7"
      style={{ borderTop: '4px solid #000', backgroundColor: '#ffffff' }}
    >
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
        <div className="flex items-center gap-2 border-[2px] border-black p-1 px-3 shadow-[2px_2px_0px_#000]">
          <div className="w-5 h-5 flex items-center justify-center bg-black">
            <img src="/assets/OWL.svg" alt="RepoOwl" className="w-[13px] h-[13px]" />
          </div>
          <span className="text-[13px] font-black text-black uppercase tracking-widest">RepoOwl</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[11px] font-black uppercase tracking-widest text-black hover:bg-[#50E3C2] hover:shadow-[2px_2px_0px_#000] border-2 border-transparent hover:border-black px-2 py-1 transition-all duration-150"
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="text-[11px] font-black text-black uppercase tracking-widest">
          © 2026 RepoOwl. All rights reserved.
        </p>
      </div>
    </div>
  );
}
