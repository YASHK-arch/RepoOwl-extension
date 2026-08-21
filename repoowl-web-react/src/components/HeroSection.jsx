import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Code } from 'lucide-react';
import IdeMockup from './IdeMockup';

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative flex flex-col items-center py-20 md:py-28 text-center z-10 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-7 rounded-full bg-white border border-[#E0DDD8] text-[#6B6A67] text-xs font-medium shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3FB950] flex-shrink-0" />
          Now with LLaMA 3.3 Support
        </div>

        {/* Hero heading */}
        <h1 className="text-4xl md:text-[64px] font-bold leading-[1.1] tracking-[-2px] mb-5 text-[#1A1A1A]">
          Cut GitHub issue triage
          <br className="hidden md:block" />
          <span className="text-[#9C6644]"> time in half.</span>
        </h1>

        {/* Sub-text */}
        <p className="max-w-[500px] mx-auto text-[16px] text-[#6B6A67] leading-[1.7] mb-9 font-normal">
          AI-powered, client-side duplicate detection directly in your browser.
          Zero server costs. Absolute data privacy.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://github.com/YASHK-arch/RepoOwl-extension/releases/download/v0.1.1-client-side-overhaul/RepoOwl_v0.1.1.zip"
            className="px-6 py-3 font-semibold text-[14px] text-white bg-[#1A1A1A] rounded-xl flex items-center gap-2 hover:bg-[#333] transition-colors duration-150 shadow-sm"
          >
            <Download className="w-[16px] h-[16px]" strokeWidth={2.5} />
            Download Extension
            <span className="ml-1 text-[11px] font-normal bg-white/20 px-1.5 py-0.5 rounded-md">Desktop</span>
          </a>
          <a
            href="https://github.com/YASHK-arch/RepoOwl-extension.git"
            className="px-6 py-3 font-semibold text-[14px] text-[#1A1A1A] bg-white rounded-xl flex items-center gap-2 border border-[#E0DDD8] hover:border-[#C8C5C0] transition-colors duration-150 shadow-sm"
          >
            <Code className="w-[16px] h-[16px]" strokeWidth={2} />
            View on GitHub
          </a>
        </div>

        {/* Install hint */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="px-4 py-2 bg-white/60 rounded-lg border border-[#E0DDD8] font-mono text-[12px] text-[#6B6A67]">
            Drop the .zip into Chrome extensions
          </div>
        </div>
      </motion.div>

      {/* IDE Mockup */}
      <motion.div
        className="mt-14 md:mt-20 w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
      >
        <IdeMockup />
      </motion.div>
    </section>
  );
}
