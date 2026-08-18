import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Code } from 'lucide-react';
import IdeMockup from './IdeMockup';

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay hero entrance to match splash exit (~1.6s of splash)
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative flex flex-col items-center py-14 md:py-20 text-center z-10 w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Badge */}
        <div
          className="inline-flex items-center px-3 py-1.5 mb-6 rounded-full"
          style={{
            background: 'rgba(255,87,34,0.1)',
            border: '1px solid rgba(255,87,34,0.35)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full mr-2"
            style={{ background: '#FF5722' }}
          />
          <span className="text-xs font-medium" style={{ color: '#FF5722' }}>
            Now with LLaMA 3.3 Support
          </span>
        </div>

        {/* Hero heading */}
        <h1
          className="text-4xl md:text-[62px] font-extrabold leading-[1.12] tracking-[-1.5px] mb-5"
          style={{ color: '#F0F6FC' }}
        >
          Cut GitHub issue triage
          <br className="hidden md:block" /> time in half, Instantly.
        </h1>

        {/* Sub-text */}
        <p
          className="max-w-[560px] mx-auto text-[15px] md:text-[17px] leading-[1.65] mb-9"
          style={{ color: '#8B949E' }}
        >
          AI-powered, client-side duplicate detection directly in your browser.
          Zero server costs. Absolute data privacy.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://github.com/YASHK-arch/RepoOwl-extension/releases/download/v0.1.1-client-side-overhaul/RepoOwl_v0.1.1.zip"
            className="group px-6 py-3.5 rounded-[10px] font-semibold text-[15px] text-white flex items-center gap-2 transition-all duration-180"
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
            <Download className="w-[17px] h-[17px]" />
            Download Extension
          </a>
          <a
            href="https://github.com/YASHK-arch/RepoOwl-extension.git"
            className="px-6 py-3.5 rounded-[10px] font-semibold text-[15px] flex items-center gap-2 transition-all duration-180"
            style={{ color: '#F0F6FC', border: '1px solid #30363D', background: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#161B22'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Code className="w-[17px] h-[17px]" />
            View Source on GitHub
          </a>
        </div>
      </motion.div>

      {/* IDE Mockup */}
      <motion.div
        className="mt-12 md:mt-16 w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
      >
        <IdeMockup />
      </motion.div>
    </section>
  );
}
