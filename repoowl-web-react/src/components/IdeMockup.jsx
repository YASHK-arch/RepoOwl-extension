import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Folder, Bug, Sparkles } from 'lucide-react';

const TYPING_TEXT = 'App crashes on login when\noffline mode is enabled...';

export default function IdeMockup() {
  const [typed, setTyped] = useState('');
  const [progress, setProgress] = useState(0);
  const [glowPhase, setGlowPhase] = useState(0);

  // Glow pulse loop
  useEffect(() => {
    let raf;
    const start = Date.now();
    const animate = () => {
      const t = (Date.now() - start) / 2800;
      setGlowPhase((Math.sin(t * Math.PI * 2) + 1) / 2);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

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

  const glowBlur = 20 + glowPhase * 28;
  const glowOp = 0.25 + glowPhase * 0.3;

  return (
    <div
      className="rounded-[14px] w-full max-w-[1000px] mx-auto text-left"
      style={{
        boxShadow: `0 0 ${glowBlur}px rgba(255,87,34,${glowOp}), 0 0 ${glowBlur * 1.4}px rgba(47,129,247,${glowOp * 0.5})`,
      }}
    >
      <div
        className="rounded-[14px] overflow-hidden flex flex-col"
        style={{ background: '#1C2028', border: '1px solid #30363D' }}
      >
        {/* Title bar */}
        <div className="h-10 flex items-center px-3.5" style={{ background: '#161B22' }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#DA3633' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#D29922' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#3FB950' }} />
          </div>
          <div
            className="ml-4 flex items-center gap-1.5 px-2.5 py-1 rounded"
            style={{ background: '#161B22', border: '1px solid #30363D' }}
          >
            <Folder className="w-3 h-3" style={{ color: '#8B949E' }} />
            <span className="font-mono text-[11px]" style={{ color: '#8B949E' }}>
              repoowl / triage.ts
            </span>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full" style={{ background: '#FF5722' }} />
        </div>

        <div style={{ height: 1, background: '#30363D' }} />

        {/* Body */}
        <div className="flex flex-col md:flex-row">
          {/* Left — New Issue */}
          <div className="flex-1 p-5" style={{ borderRight: '1px solid #30363D' }}>
            <div className="flex items-center gap-1.5 mb-3.5">
              <Bug className="w-3.5 h-3.5" style={{ color: '#2F81F7' }} />
              <span className="font-semibold text-xs" style={{ color: '#2F81F7' }}>New Issue</span>
            </div>

            {/* Title field */}
            <div
              className="w-full p-3 rounded mb-2.5"
              style={{ background: '#0D1117', border: '1px solid #30363D' }}
            >
              <span className="font-semibold text-[13px]" style={{ color: '#F0F6FC' }}>
                App crashes on login
              </span>
            </div>

            {/* Body field w/ typewriter */}
            <div
              className="w-full min-h-[80px] p-3 rounded mb-3.5 relative"
              style={{ background: '#0D1117', border: '1px solid rgba(47,129,247,0.5)' }}
            >
              <span className="font-mono text-xs leading-relaxed whitespace-pre-wrap" style={{ color: '#F0F6FC' }}>
                {typed}
              </span>
              <BlinkingCaret color="#2F81F7" />
            </div>

            {/* Tag pills */}
            <div className="flex gap-1.5 mb-4">
              <TagPill label="bug" color="#DA3633" />
              <TagPill label="mobile" color="#8B5CF6" />
              <TagPill label="auth" color="#D29922" />
            </div>

            {/* Analyzing progress */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3 h-3" style={{ color: '#FF5722' }} />
                <span className="font-mono text-[10px]" style={{ color: '#8B949E' }}>
                  Analyzing with RepoOwl… {Math.round(progress * 100)}%
                </span>
              </div>
              <div className="h-[3px] w-full rounded overflow-hidden" style={{ background: '#30363D' }}>
                <div
                  className="h-full transition-none"
                  style={{ width: `${progress * 100}%`, background: '#FF5722' }}
                />
              </div>
            </div>
          </div>

          {/* Right — RepoOwl Insight */}
          <div className="flex-1 p-5" style={{ background: '#0D1117' }}>
            <div className="flex items-center gap-2 mb-3.5">
              <motion.div
                animate={{ boxShadow: ['0 0 6px rgba(255,87,34,0.4)', '0 0 14px rgba(255,87,34,0.8)', '0 0 6px rgba(255,87,34,0.4)'] }}
                transition={{ duration: 2.8, repeat: Infinity }}
                className="w-2 h-2 rounded-full"
                style={{ background: '#FF5722' }}
              />
              <span className="font-semibold text-xs" style={{ color: '#FF5722' }}>RepoOwl Insight</span>
            </div>

            {/* Alert card */}
            <motion.div
              animate={{ borderColor: ['rgba(255,87,34,0.3)', 'rgba(255,87,34,0.55)', 'rgba(255,87,34,0.3)'] }}
              transition={{ duration: 2.8, repeat: Infinity }}
              className="w-full p-3.5 rounded-lg mb-3.5"
              style={{ background: 'rgba(255,87,34,0.07)', border: '1px solid rgba(255,87,34,0.3)' }}
            >
              <div className="flex items-center mb-2">
                <span className="text-sm mr-2">⚠️</span>
                <span className="font-bold text-xs" style={{ color: '#FF5722' }}>Duplicate Detected</span>
                <div
                  className="ml-auto px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255,87,34,0.15)' }}
                >
                  <span className="font-mono text-[10px] font-bold" style={{ color: '#FF5722' }}>92%</span>
                </div>
              </div>
              <div className="p-2.5 rounded" style={{ background: '#0D1117' }}>
                <span className="font-mono text-[11px]" style={{ color: '#8B949E' }}>Matches Issue </span>
                <span className="font-mono text-[11px] font-bold" style={{ color: '#2F81F7' }}>#42</span>
                <br />
                <span className="font-mono text-[11px]" style={{ color: '#F0F6FC' }}>
                  &quot;Login fatal error on offline mode&quot;
                </span>
              </div>
            </motion.div>

            {/* Similarity bars */}
            <SimBar label="Semantic similarity" value={0.92} isHigh />
            <div className="h-2" />
            <SimBar label="Title match" value={0.78} />
            <div className="h-2" />
            <SimBar label="Label overlap" value={0.67} />

            {/* Action chips */}
            <div className="flex gap-2 mt-4">
              <ActionChip label="Mark Duplicate" color="#FF5722" />
              <ActionChip label="View #42" color="#2F81F7" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlinkingCaret({ color }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      className="inline-block w-[1.5px] h-3.5 translate-y-0.5 ml-0.5 transition-opacity duration-100"
      style={{ background: color, opacity: visible ? 1 : 0 }}
    />
  );
}

function TagPill({ label, color }) {
  return (
    <span
      className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold"
      style={{
        color,
        background: `${color}1F`,
        border: `1px solid ${color}59`,
      }}
    >
      {label}
    </span>
  );
}

function SimBar({ label, value, isHigh = false }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px]" style={{ color: '#8B949E' }}>{label}</span>
        <span className="font-mono text-[10px]" style={{ color: '#3FB950' }}>{Math.round(value * 100)}%</span>
      </div>
      <div className="h-[3px] w-full rounded overflow-hidden" style={{ background: '#30363D' }}>
        <div
          className="h-full"
          style={{ width: `${value * 100}%`, background: isHigh ? '#FF5722' : '#3FB950' }}
        />
      </div>
    </div>
  );
}

function ActionChip({ label, color }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      className="px-2.5 py-1.5 rounded font-semibold text-[10px] transition-colors duration-150"
      style={{
        color,
        background: hovered ? `${color}33` : `${color}1A`,
        border: `1px solid ${color}66`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </button>
  );
}
