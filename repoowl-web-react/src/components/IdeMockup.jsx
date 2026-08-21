import React from 'react';
import { motion } from 'framer-motion';
import { Folder } from 'lucide-react';
import img1 from '../assets/1.png';
import img3 from '../assets/3.png';
import img2 from '../assets/2.png';

export default function IdeMockup() {
  return (
    <div
      className="w-full max-w-[1000px] mx-auto text-left rounded-2xl overflow-hidden"
      style={{
        boxShadow: '0 20px 60px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)',
        border: '1px solid #E8E5E0',
        background: '#FFFFFF',
      }}
    >
      <div className="flex flex-col h-full">
        {/* Title bar */}
        <div className="h-10 flex items-center px-4 border-b border-[#E8E5E0] bg-[#F8F7F4]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="ml-4 flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E8E5E0] rounded-md">
            <Folder className="w-3 h-3 text-[#6B6A67]" />
            <span className="font-mono text-[11px] text-[#6B6A67]">
              repoowl / triage.ts
            </span>
          </div>
        </div>

        {/* Content Body - Stacked Images */}
        <div className="flex flex-col w-full bg-[#F6F8FA]">
          {/* First Image */}
          <div className="w-full flex items-center justify-center p-4 md:p-6 border-b border-[#E8E5E0]">
            <img src={img1} alt="Triage Step 1" className="w-full h-auto object-contain rounded-md shadow-sm border border-[#E1E4E8]" />
          </div>

          {/* Second Image (Newly Uploaded) */}
          <div className="w-full flex items-center justify-center px-8 md:px-16 py-8 md:py-12 border-b border-[#E8E5E0]">
            <img src={img3} alt="Triage Step 2" className="w-full h-auto object-contain rounded-lg shadow-2xl border border-[#30363D]" />
          </div>

          {/* Third Image */}
          <div className="w-full flex items-center justify-center p-4 md:p-6">
            <img src={img2} alt="Triage Step 3" className="w-full h-auto object-contain rounded-md shadow-sm border border-[#E1E4E8]" />
          </div>
        </div>
      </div>
    </div>
  );
}
