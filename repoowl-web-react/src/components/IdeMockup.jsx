import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Folder, Bug, Sparkles } from 'lucide-react';

const TYPING_TEXT = 'App crashes on login when\noffline mode is enabled...';

export default function IdeMockup() {
  const [typed, setTyped] = useState('');
  const [progress, setProgress] = useState(0);

  // Typewriter loop
  useEffect(() => {
    let idx = 0;
    let timeout;
    const type = () => {
      idx++;
      setTyped(TYPING_TEXT.slice(0, idx));
      if (idx < TYPING_TEXT.length) {
        timeout = setTimeout(type, 50);
      } else {
        timeout = setTimeout(() => { idx = 0; setTyped(''); timeout = setTimeout(type, 50); }, 2000);
      }
    };
    timeout = setTimeout(type, 50);
    return () => clearTimeout(timeout);
  }, []);

  // Progress bar loop
  useEffect(() => {
    let start;
    let raf;
    const duration = 2600;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setTimeout(() => { start = null; raf = requestAnimationFrame(animate); }, 1400);
      }
    };
    const timeout = setTimeout(() => { raf = requestAnimationFrame(animate); }, 800);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div
      className="w-full max-w-[900px] mx-auto text-left rounded-2xl overflow-hidden"
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

        {/* Body */}
        <div className="flex flex-col md:flex-row h-full">
          {/* Left — New Issue */}
          <div className="flex-1 p-5 border-r border-[#E8E5E0]">
            <div className="flex items-center gap-1.5 mb-3.5">
              <Bug className="w-3.5 h-3.5 text-[#6B6A67]" />
              <span className="text-xs font-semibold text-[#6B6A67] uppercase tracking-wider">New Issue</span>
            </div>

            {/* Title field */}
            <div className="w-full p-3 mb-2.5 border border-[#E8E5E0] rounded-lg bg-white">
              <span className="font-semibold text-[14px] text-[#1A1A1A]">
                App crashes on login
              </span>
            </div>

            {/* Body field w/ typewriter */}
            <div className="w-full min-h-[80px] p-3 mb-3.5 relative border border-[#E8E5E0] rounded-lg bg-[#F8F7F4]">
              <span className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-[#1A1A1A]">
                {typed}
              </span>
              <BlinkingCaret />
            </div>

            {/* Tag pills */}
            <div className="flex gap-1.5 mb-4">
              <TagPill label="bug" color="#FEE2E2" textColor="#DC2626" />
              <TagPill label="mobile" color="#EDE9FE" textColor="#7C3AED" />
              <TagPill label="auth" color="#FEF3C7" textColor="#D97706" />
            </div>

            {/* Analyzing progress */}
            <div className="mt-6">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#6B6A67]" />
                <span className="font-mono text-[11px] text-[#6B6A67]">
                  Analyzing… {Math.round(progress * 100)}%
                </span>
              </div>
              <div className="h-[5px] w-full rounded-full bg-[#ECEAE6] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1A1A1A] transition-none"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right — RepoOwl Insight */}
          <div className="flex-1 p-5 bg-white">
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-2 h-2 rounded-full bg-[#3FB950]" />
              <span className="text-xs font-semibold text-[#6B6A67] uppercase tracking-wider">RepoOwl Insight</span>
            </div>

            {/* Alert card */}
            <div className="w-full p-3.5 mb-3.5 border border-[#FECACA] bg-[#FFF5F5] rounded-xl">
              <div className="flex items-center mb-2">
                <span className="text-sm mr-2">⚠️</span>
                <span className="font-semibold text-[13px] text-[#1A1A1A]">Duplicate Detected</span>
                <div className="ml-auto px-2 py-0.5 bg-[#1A1A1A] rounded-md">
                  <span className="font-mono text-[11px] font-semibold text-white">92%</span>
                </div>
              </div>
              <div className="p-2.5 border border-[#E8E5E0] bg-white rounded-lg">
                <span className="font-mono text-[12px] text-[#6B6A67]">Matches Issue </span>
                <span className="font-mono text-[12px] font-semibold text-[#2F81F7]">#42</span>
                <br />
                <span className="font-mono text-[12px] text-[#9A9896]">
                  &quot;Login fatal error on offline mode&quot;
                </span>
              </div>
            </div>

            {/* Similarity bars */}
            <SimBar label="Semantic similarity" value={0.92} isHigh />
            <div className="h-2" />
            <SimBar label="Title match" value={0.78} />
            <div className="h-2" />
            <SimBar label="Label overlap" value={0.67} />

            {/* Action chips */}
            <div className="flex gap-2 mt-4">
              <ActionChip label="Mark Duplicate" primary />
              <ActionChip label="View #42" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlinkingCaret() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      className="inline-block w-[1.5px] h-3.5 translate-y-0.5 ml-0.5 transition-opacity duration-100 bg-[#1A1A1A]"
      style={{ opacity: visible ? 1 : 0 }}
    />
  );
}

function TagPill({ label, color, textColor }) {
  return (
    <span
      className="px-2 py-0.5 text-[11px] font-medium rounded-full"
      style={{ background: color, color: textColor }}
    >
      {label}
    </span>
  );
}

function SimBar({ label, value, isHigh = false }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[11px] text-[#6B6A67]">{label}</span>
        <span className="font-mono text-[11px] font-semibold text-[#1A1A1A]">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-[5px] w-full rounded-full bg-[#ECEAE6] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value * 100}%`, background: isHigh ? '#1A1A1A' : '#3FB950' }}
        />
      </div>
    </div>
  );
}

function ActionChip({ label, primary = false }) {
  return (
    <button
      className="px-3.5 py-2 text-[12px] font-semibold rounded-lg transition-colors duration-150"
      style={{
        background: primary ? '#1A1A1A' : 'white',
        color: primary ? 'white' : '#1A1A1A',
        border: primary ? 'none' : '1px solid #E8E5E0',
      }}
    >
      {label}
    </button>
  );
}
