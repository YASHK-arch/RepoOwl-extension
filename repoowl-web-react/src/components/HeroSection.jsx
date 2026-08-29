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
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-7 rounded-none bg-[#F8E71C] border-[2px] border-black shadow-[4px_4px_0px_#000] text-black text-[12px] font-black uppercase tracking-widest">
          <span className="w-2 h-2 rounded-none border border-black bg-[#FF4F5E] flex-shrink-0" />
          Now with Qwen 3.6 27B Support
        </div>

        {/* Hero heading */}
        <h1 className="text-4xl md:text-[64px] font-black leading-[1] tracking-tighter mb-5 text-black uppercase">
          Cut GitHub issue triage
          <br className="hidden md:block" />
          <span className="bg-[#50E3C2] text-black px-3 py-1 ml-2 inline-block shadow-[6px_6px_0px_#000]"> time in half.</span>
        </h1>

        {/* Sub-text */}
        <p className="max-w-[550px] mx-auto text-[16px] text-black font-bold leading-[1.7] mb-9">
          Dual-layer AI triage injected natively into GitHub. Powerful PR slop detection and duplicate flagging via GitHub Actions & Supabase Edge Functions.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-5">
          <a
            href="https://github.com/YASHK-arch/RepoOwl-extension/releases/download/v1.0.0/repoowl-production-release.zip"
            className="px-6 py-4 font-black uppercase tracking-widest text-[15px] text-black bg-[#FF4F5E] rounded-none flex items-center gap-2 border-[3px] border-black shadow-[6px_6px_0px_#000] hover:shadow-[10px_10px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-150"
          >
            <Download className="w-[18px] h-[18px] text-black" strokeWidth={3} />
            Download Extension
            <span className="ml-1 text-[10px] font-black bg-white px-2 py-0.5 rounded-none border-[2px] border-black text-black">DESKTOP</span>
          </a>
          <a
            href="https://github.com/YASHK-arch/RepoOwl-extension.git"
            className="px-6 py-4 font-black uppercase tracking-widest text-[15px] text-black bg-white rounded-none flex items-center gap-2 border-[3px] border-black shadow-[6px_6px_0px_#000] hover:bg-[#50E3C2] hover:shadow-[10px_10px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-150"
          >
            <Code className="w-[18px] h-[18px] text-black" strokeWidth={3} />
            View on GitHub
          </a>
        </div>

        {/* Install hint */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="px-4 py-2 bg-[#F8E71C] rounded-none border-[2px] border-black shadow-[4px_4px_0px_#000] font-black text-[12px] uppercase tracking-widest text-black">
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
