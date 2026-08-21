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
      style={{ borderTop: '1px solid #E0DDD8' }}
    >
      {/* ASCII Donut — faint centered background animation */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ opacity: 0.12 }}
      >
        <AsciiDonut opacity={1} />
      </div>

      <div className="relative z-10 px-5 md:px-12 py-20 md:py-28 flex justify-center">
        <div className="max-w-[600px] w-full flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-[48px] font-bold tracking-[-1.5px] mb-4 text-[#1A1A1A]">
            Get started in 2 clicks.
          </h2>
          <p className="text-[16px] leading-[1.7] mb-10 text-[#6B6A67]">
            No account. No server. No data collection.
            <br />
            Just drop it in Chrome and triage smarter.
          </p>

          <a
            href="https://github.com/YASHK-arch/RepoOwl-extension/releases/download/v0.1.1-client-side-overhaul/RepoOwl_v0.1.1.zip"
            className="flex items-center gap-3 px-8 py-4 font-semibold text-[15px] text-white bg-[#1A1A1A] rounded-xl hover:bg-[#333] transition-colors duration-150 shadow-sm"
          >
            <Download className="w-[18px] h-[18px]" strokeWidth={2} />
            Download RepoOwl.zip
          </a>

          <p className="mt-5 text-xs text-[#9A9896]">
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
      style={{ borderTop: '1px solid #E0DDD8' }}
    >
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center rounded bg-[#1A1A1A]">
            <img src="/assets/OWL.svg" alt="RepoOwl" className="w-[13px] h-[13px]" />
          </div>
          <span className="text-xs font-medium text-[#9A9896]">RepoOwl</span>
        </div>

        <div className="flex items-center gap-5">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-[#9A9896] hover:text-[#1A1A1A] transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="text-xs text-[#9A9896]">
          © 2026 RepoOwl. All rights reserved.
        </p>
      </div>
    </div>
  );
}
