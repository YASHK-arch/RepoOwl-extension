import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, Bug, Sparkles, TriangleAlert, X, GitBranch,
  GitPullRequest, Play, Users, BarChart2, Settings, ChevronDown,
  Search, AlertCircle, Check, Tag, Eye, MessageSquare, Zap,
} from 'lucide-react';

/* ─── Scene timing (ms) ─────────────────────────── */
const SCENE_DURATIONS = [5200, 5800, 5800];
const TOTAL = SCENE_DURATIONS.reduce((a, b) => a + b, 0);

/* ─── Shared helpers ──────────────────────────────── */
function useTypewriter(text, speed = 48, startDelay = 0, trigger = true) {
  const [typed, setTyped] = useState('');
  useEffect(() => {
    if (!trigger) { setTyped(''); return; }
    let idx = 0;
    let t = setTimeout(() => {
      const tick = () => {
        idx++;
        setTyped(text.slice(0, idx));
        if (idx < text.length) t = setTimeout(tick, speed);
      };
      tick();
    }, startDelay);
    return () => clearTimeout(t);
  }, [text, trigger]);
  return typed;
}

function useCountUp(target, duration = 1200, startDelay = 0, trigger = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) { setVal(0); return; }
    let start;
    let raf;
    const timeout = setTimeout(() => {
      const animate = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setVal(Math.round(p * target));
        if (p < 1) raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
    }, startDelay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [target, trigger]);
  return val;
}

/* ─── Scene 1: GitHub Issues List + sliding panel ──── */
const ISSUES = [
  { title: '[FEATURE]: Convert the BYOK based extension setup to OAuth application based setup', labels: ['extension-setup', 'oauth-integration', 'supabase-authentication'], num: '#96', closed: true },
  { title: '[REFACTOR]: refactor triage workflow', labels: ['collaborator-management', 'github-integration', 'triage-workflow'], num: '#98', closed: false, highlight: true },
  { title: '[BUG] Excessive and low-utility auto-generated labels from LLM API', labels: ['bug'], num: '#97', closed: true, duplicate: true },
  { title: '[REFACTOR]: update settings page based on the current architecture (routine cleanup)', labels: [], num: '#95', closed: true },
  { title: '[BUG]: crashbcramistarmbgh', labels: ['bug'], num: '#94', closed: true },
  { title: 'BUY CHEAP CRYPTO NOW!!', labels: ['🚨 ai-slop'], num: '#93', closed: false, scam: true },
  { title: 'Extension not working in Chrome', labels: [], num: '#92', closed: false },
  { title: 'Bug: popup doesn\'t open on Chrome 116', labels: [], num: '#91', closed: false },
];

function LabelPill({ text }) {
  const colorMap = {
    'bug': 'bg-[#D93A3A]/20 text-[#FF7B7B] border-[#D93A3A]/40',
    '🚨 ai-slop': 'bg-[#E5534B]/20 text-[#FF7B7B] border-[#E5534B]/40',
    'default': 'bg-[#388BFD]/10 text-[#79C0FF] border-[#388BFD]/30',
    'triage-workflow': 'bg-[#3FB950]/10 text-[#56D364] border-[#3FB950]/30',
    'github-integration': 'bg-[#388BFD]/10 text-[#79C0FF] border-[#388BFD]/30',
    'collaborator-management': 'bg-[#A371F7]/10 text-[#D2A8FF] border-[#A371F7]/30',
    'oauth-integration': 'bg-[#A371F7]/10 text-[#D2A8FF] border-[#A371F7]/30',
    'extension-setup': 'bg-[#388BFD]/10 text-[#79C0FF] border-[#388BFD]/30',
    'supabase-authentication': 'bg-[#3FB950]/10 text-[#56D364] border-[#3FB950]/30',
  };
  const cls = colorMap[text] || colorMap['default'];
  return (
    <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded-full border ${cls}`}>
      {text}
    </span>
  );
}

function Scene1({ active }) {
  const [panelVisible, setPanelVisible] = useState(false);
  useEffect(() => {
    if (!active) { setPanelVisible(false); return; }
    const t = setTimeout(() => setPanelVisible(true), 1800);
    return () => clearTimeout(t);
  }, [active]);

  const files = [
    { name: 'extension/src/lib/githubContext.js', color: 'bg-[#E3B341]' },
    { name: 'extension/src/content/fetchIssueInsights.js', color: 'bg-[#E3B341]' },
    { name: 'extension/src/settings/ModelConfig.jsx', color: 'bg-[#79C0FF]' },
    { name: 'extension/src/settings/AutoTriagePanel.jsx', color: 'bg-[#79C0FF]' },
    { name: 'extension/src/prTriage.js', color: 'bg-[#E3B341]' },
    { name: 'github/labeler.yml', color: 'bg-[#6B8E23]' },
    { name: 'github/workflows/auto-label.yml', color: 'bg-[#6B8E23]' },
    { name: 'shared/utils/formatHistoricalContext.js', color: 'bg-[#E3B341]' },
  ];

  return (
    <div className="flex w-full h-full bg-[#0D1117] text-[#E6EDF3] relative overflow-hidden">
      {/* Sidebar */}
      <div className="w-[52px] border-r border-[#30363D] flex flex-col items-center py-3 gap-4 flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-[#388BFD] flex items-center justify-center text-white text-[10px] font-bold">Y</div>
        {[GitBranch, GitPullRequest, BarChart2, Settings].map((Icon, i) => (
          <Icon key={i} className="w-4 h-4 text-[#6E7681] hover:text-[#E6EDF3] cursor-pointer" />
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top nav */}
        <div className="h-10 border-b border-[#30363D] flex items-center px-3 gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#E6EDF3] font-medium">
            <span className="text-[#6E7681]">RepoOwl-extension</span>
            <span className="text-[#6E7681]">/</span>
            <span>Issues</span>
          </div>
          <div className="ml-auto flex gap-2">
            <Search className="w-3.5 h-3.5 text-[#6E7681]" />
          </div>
        </div>

        {/* Tab bar */}
        <div className="h-8 border-b border-[#30363D] flex items-end px-3 gap-3 flex-shrink-0">
          {['Code', 'Issues', 'Pull requests', 'Agents', 'Actions', 'Projects', 'Wiki', 'Security', 'Insights', 'Settings'].map((t, i) => (
            <span key={t} className={`text-[10px] pb-1.5 cursor-pointer ${t === 'Issues' ? 'text-[#E6EDF3] border-b-2 border-[#F78166]' : 'text-[#6E7681]'}`}>{t}</span>
          ))}
        </div>

        {/* Issues list */}
        <div className="flex-1 overflow-hidden px-3 py-2">
          <div className="flex items-center mb-2">
            <h2 className="text-[12px] font-semibold text-[#E6EDF3]">All issues</h2>
            <div className="ml-auto flex gap-2 text-[10px] text-[#6E7681]">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#3FB950]" />Open 4</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#6E7681]" />Closed 14</span>
            </div>
          </div>
          <div className="border border-[#30363D] rounded-lg overflow-hidden">
            {ISSUES.map((issue, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: active ? 1 : 0, x: active ? 0 : -8 }}
                transition={{ delay: 0.08 * i, duration: 0.35 }}
                className={`flex items-start gap-2 px-3 py-2 border-b border-[#21262D] last:border-b-0 ${issue.highlight ? 'bg-[#161B22]' : ''} hover:bg-[#161B22] cursor-pointer`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {issue.closed
                    ? <div className="w-3.5 h-3.5 rounded-full border border-[#6E7681] flex items-center justify-center"><Check className="w-2 h-2 text-[#6E7681]" /></div>
                    : <AlertCircle className={`w-3.5 h-3.5 ${issue.scam ? 'text-[#E5534B]' : 'text-[#3FB950]'}`} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {issue.duplicate && <span className="text-[9px] bg-[#D93A3A]/30 text-[#FF7B7B] border border-[#D93A3A]/50 px-1.5 py-0.5 rounded-full">⚠ Duplicate</span>}
                    <span className="text-[11px] text-[#E6EDF3] font-medium truncate">{issue.title}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {issue.labels.map(l => <LabelPill key={l} text={l} />)}
                  </div>
                  <div className="text-[9px] text-[#6E7681] mt-0.5">{issue.num} · by YASHK-arch was closed 1w ago</div>
                </div>
                <div className="flex gap-2 text-[#6E7681] flex-shrink-0">
                  {!issue.closed && <span className="text-[9px] flex items-center gap-0.5 text-[#3FB950]"><Zap className="w-2.5 h-2.5" />AI Insights</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Sliding Panel */}
      <AnimatePresence>
        {panelVisible && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 bottom-0 w-[46%] bg-[#161B22] border-l border-[#30363D] flex flex-col overflow-hidden"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363D]">
              <div className="flex items-center gap-2">
                <TriangleAlert className="w-4 h-4 text-[#E3B341]" />
                <span className="text-[13px] font-semibold text-[#E6EDF3]">Duplicate Detected</span>
              </div>
              <X className="w-3.5 h-3.5 text-[#6E7681] cursor-pointer" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#30363D] text-[10px] text-[#6E7681]">
              <span>Issue #97 · YASHK-arch/RepoOwl-extension</span>
              <span className="ml-auto px-2 py-0.5 bg-[#D93A3A]/20 text-[#FF7B7B] border border-[#D93A3A]/40 rounded-full text-[9px] font-semibold">⚠ Duplicate</span>
            </div>

            {/* Technical Summary */}
            <div className="px-4 py-3 border-b border-[#30363D]">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#DA3633]" />
                <span className="text-[9px] font-bold text-[#6E7681] tracking-widest uppercase">Technical Summary</span>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-[11px] text-[#8B949E] leading-relaxed"
              >
                This issue is a <span className="bg-[#D93A3A]/30 text-[#FF7B7B] px-0.5 rounded">duplicate of</span> <span className="text-[#79C0FF] font-semibold">#74</span> because both target the{' '}
                <span className="bg-[#3FB950]/20 text-[#56D364] px-0.5 rounded">improvement</span> of the LLM Api's auto-generated labels for GitHub issues and PRs, focusing on minimizing unnecessary labels and enhancing the labeling system's accuracy and utility.
              </motion.p>
            </div>

            {/* Predicted Affected Files */}
            <div className="px-4 py-3 border-b border-[#30363D] flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded bg-[#E3B341]" />
                  <span className="text-[9px] font-bold text-[#6E7681] tracking-widest uppercase">Predicted Affected Files</span>
                </div>
                <span className="text-[9px] bg-[#388BFD]/20 text-[#79C0FF] border border-[#388BFD]/30 px-1.5 py-0.5 rounded-full font-semibold">{files.length}</span>
              </div>
              <div className="flex flex-col gap-1">
                {files.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.07, duration: 0.3 }}
                    className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md hover:border-[#388BFD]/50 cursor-pointer group"
                  >
                    <div className={`w-2 h-2 rounded-sm ${f.color} flex-shrink-0`} />
                    <span className="text-[10px] font-mono text-[#8B949E] group-hover:text-[#E6EDF3] truncate">{f.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Duplicate Trace */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px]">🔗</span>
                <span className="text-[9px] font-bold text-[#6E7681] tracking-widest uppercase">Duplicate Trace</span>
              </div>
              <p className="text-[10px] text-[#6E7681] italic leading-relaxed">
                This issue has been flagged as a duplicate by RepoOwl AI. See the Technical Summary above for the specific matching issue reference.
              </p>
            </div>

            <div className="px-4 py-2 border-t border-[#30363D] flex justify-between items-center">
              <span className="text-[9px] text-[#6E7681]">Powered by RepoOwl · Groq LLaMA 3.3</span>
              <span className="text-[9px] text-[#79C0FF] cursor-pointer">GitHub ↗</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Scene 2: Triage Analysis ──────────────────────── */
const BODY_TEXT = 'App crashes on login when\noffline mode is enabled...';

function BlinkCaret() {
  const [on, setOn] = useState(true);
  useEffect(() => { const id = setInterval(() => setOn(v => !v), 530); return () => clearInterval(id); }, []);
  return <span className="inline-block w-[1.5px] h-3.5 translate-y-0.5 ml-0.5 bg-[#1A1A1A]" style={{ opacity: on ? 1 : 0 }} />;
}

function SimBar({ label, value, isHigh, delay, active }) {
  const v = useCountUp(Math.round(value * 100), 900, delay, active);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-[#6B6A67]">{label}</span>
        <span className="font-mono text-[11px] font-semibold text-[#1A1A1A]">{v}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#ECEAE6] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: active ? `${value * 100}%` : 0 }}
          transition={{ duration: 0.9, delay: delay / 1000, ease: 'easeOut' }}
          style={{ background: isHigh ? '#1A1A1A' : '#52C41A' }}
        />
      </div>
    </div>
  );
}

function Scene2({ active }) {
  const typed = useTypewriter(BODY_TEXT, 46, 400, active);
  const progress = useCountUp(100, 2400, 600, active);

  return (
    <div className="flex w-full h-full bg-white">
      {/* Left Pane */}
      <div className="w-1/2 flex flex-col p-5 border-r border-[#E8E5E0]">
        <div className="flex items-center gap-1.5 mb-4">
          <Bug className="w-3.5 h-3.5 text-[#8C8B89]" />
          <span className="text-[10px] font-bold text-[#8C8B89] tracking-widest uppercase">New Issue</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: active ? 1 : 0, y: active ? 0 : 8 }}
          transition={{ duration: 0.4 }}
          className="px-3 py-2.5 border border-[#E8E5E0] rounded-lg mb-2.5 bg-white shadow-sm"
        >
          <span className="text-[14px] font-semibold text-[#1A1A1A]">App crashes on login</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: active ? 1 : 0, y: active ? 0 : 8 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="min-h-[90px] px-3 py-2.5 border border-[#E8E5E0] rounded-lg mb-3.5 bg-[#F8F7F4]"
        >
          <span className="font-mono text-[12px] whitespace-pre-wrap text-[#1A1A1A] leading-relaxed">{typed}</span>
          <BlinkCaret />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-1.5 mb-6"
        >
          {[['bug', '#FEE2E2', '#DC2626'], ['mobile', '#EDE9FE', '#7C3AED'], ['auth', '#FEF3C7', '#D97706']].map(([l, bg, tc]) => (
            <span key={l} className="px-2 py-0.5 text-[10px] font-bold rounded-full" style={{ background: bg, color: tc }}>{l}</span>
          ))}
        </motion.div>

        <div className="mt-auto">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6B6A67]" />
            <span className="font-mono text-[11px] text-[#6B6A67]">Analyzing… {progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#ECEAE6] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#1A1A1A]"
              initial={{ width: 0 }}
              animate={{ width: active ? `${progress}%` : 0 }}
              style={{ transition: 'width 0.05s linear' }}
            />
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-1/2 flex flex-col p-5 bg-[#FAFAFA]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#4CAF50]" />
          <span className="text-[10px] font-bold text-[#8C8B89] tracking-widest uppercase">RepoOwl Insight</span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.97 }}
          transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
          className="bg-[#FFF5F5] border border-[#FCD6D6] rounded-xl p-1 mb-5 shadow-sm"
        >
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-[13px] font-bold text-[#1A1A1A]">Duplicate Detected</span>
            </div>
            <div className="bg-[#1A1A1A] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">92%</div>
          </div>
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-3 mx-1 mb-1">
            <p className="text-[11px] font-mono text-[#8C8B89] mb-1">Matches Issue <span className="text-[#0366D6] font-semibold">#42</span></p>
            <p className="text-[11px] font-mono text-[#8C8B89]">"Login fatal error on offline mode"</p>
          </div>
        </motion.div>

        <div className="flex flex-col gap-3.5 mb-6">
          <SimBar label="Semantic similarity" value={0.92} isHigh delay={800} active={active} />
          <SimBar label="Title match" value={0.78} delay={1000} active={active} />
          <SimBar label="Label overlap" value={0.67} delay={1200} active={active} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: active ? 1 : 0, y: active ? 0 : 8 }}
          transition={{ delay: 1.6, duration: 0.4 }}
          className="mt-auto flex gap-2.5"
        >
          <button className="px-4 py-2 bg-[#1A1A1A] text-white text-[12px] font-semibold rounded-lg hover:bg-black transition-colors shadow-sm">Mark Duplicate</button>
          <button className="px-4 py-2 bg-white border border-[#E5E5E5] text-[#1A1A1A] text-[12px] font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">View #42</button>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Scene 3: Result Confirmed ────────────────────── */
function Scene3({ active }) {
  return (
    <div className="flex w-full h-full bg-[#0D1117] text-[#E6EDF3] relative overflow-hidden">
      {/* Blurred issue list bg */}
      <div className="absolute inset-0 flex">
        <div className="w-[56%] h-full border-r border-[#30363D] opacity-30">
          {ISSUES.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 border-b border-[#21262D]">
              <div className="w-3.5 h-3.5 rounded-full border border-[#6E7681] mt-0.5 flex-shrink-0" />
              <div className="h-2.5 bg-[#6E7681]/40 rounded w-3/4 mt-0.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Main result panel (center stage) */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 30, scale: active ? 1 : 0.96 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative z-10 m-auto w-[78%] bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#30363D] bg-[#0D1117]">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: active ? [1, 1.2, 1] : 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <TriangleAlert className="w-5 h-5 text-[#E3B341]" />
            </motion.div>
            <span className="text-[14px] font-bold text-[#E6EDF3]">Analysis Complete</span>
          </div>
          <div className="flex gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: active ? 1 : 0 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#D93A3A]/20 text-[#FF7B7B] border border-[#D93A3A]/40 rounded-full text-[10px] font-bold"
            >
              ⚠ Duplicate
            </motion.div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-[#1F6FEB]/20 text-[#79C0FF] border border-[#1F6FEB]/30 rounded-full text-[10px] font-bold">
              92% Match
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Left summary */}
          <div className="flex-1 p-5 border-r border-[#30363D]">
            <div className="text-[10px] font-bold text-[#6E7681] tracking-widest uppercase mb-2">Issue Summary</div>
            <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg mb-3">
              <div className="text-[12px] font-semibold text-[#E6EDF3] mb-1">App crashes on login</div>
              <div className="flex gap-1">
                {[['bug', '#D93A3A'], ['mobile', '#A371F7'], ['auth', '#E3B341']].map(([l, c]) => (
                  <span key={l} className="px-1.5 py-0.5 text-[9px] font-bold rounded-full border" style={{ color: c, borderColor: c + '60', background: c + '15' }}>{l}</span>
                ))}
              </div>
            </div>

            <div className="text-[10px] font-bold text-[#6E7681] tracking-widest uppercase mb-2">Similarity Scores</div>
            {[['Semantic similarity', 92, '#E6EDF3'], ['Title match', 78, '#56D364'], ['Label overlap', 67, '#56D364']].map(([label, val, color]) => (
              <div key={label} className="mb-2.5">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-[#8B949E]">{label}</span>
                  <span className="text-[10px] font-mono font-bold" style={{ color }}>{val}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#21262D] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: active ? `${val}%` : 0 }}
                    transition={{ duration: 0.9, delay: 0.3 + (label === 'Semantic similarity' ? 0 : label === 'Title match' ? 0.15 : 0.3), ease: 'easeOut' }}
                    style={{ background: label === 'Semantic similarity' ? '#E6EDF3' : '#56D364' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Right actions */}
          <div className="w-[45%] p-5 flex flex-col">
            <div className="text-[10px] font-bold text-[#6E7681] tracking-widest uppercase mb-3">Matched Issue</div>
            <div className="p-3 bg-[#0D1117] border border-[#388BFD]/40 rounded-lg mb-4">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-3 h-3 text-[#3FB950]" />
                <span className="text-[11px] font-semibold text-[#79C0FF]">#42 — Login fatal error on offline mode</span>
              </div>
              <p className="text-[10px] text-[#8B949E] leading-relaxed">Same root cause: authentication handler throws unhandled exception when device is offline.</p>
            </div>

            <div className="text-[10px] font-bold text-[#6E7681] tracking-widest uppercase mb-2">Recommended Actions</div>
            <div className="flex flex-col gap-2 mb-5">
              {['Close as duplicate of #42', 'Add "duplicate" label', 'Notify issue author'].map((action, i) => (
                <motion.div
                  key={action}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: active ? 1 : 0, x: active ? 0 : 10 }}
                  transition={{ delay: 0.5 + i * 0.12, duration: 0.3 }}
                  className="flex items-center gap-2 text-[10px] text-[#8B949E]"
                >
                  <div className="w-3.5 h-3.5 rounded border border-[#30363D] flex items-center justify-center flex-shrink-0">
                    <Check className="w-2 h-2 text-[#3FB950]" />
                  </div>
                  {action}
                </motion.div>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: active ? 1 : 0, y: active ? 0 : 8 }}
                transition={{ delay: 1.0 }}
                className="w-full py-2 bg-[#1A1A1A] text-white text-[12px] font-semibold rounded-lg hover:bg-[#333] transition-colors border border-[#E6EDF3]/20 shadow-lg"
              >
                Mark as Duplicate
              </motion.button>
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: active ? 1 : 0, y: active ? 0 : 8 }}
                transition={{ delay: 1.1 }}
                className="w-full py-2 bg-[#0D1117] text-[#E6EDF3] text-[12px] font-semibold rounded-lg hover:bg-[#21262D] transition-colors border border-[#30363D]"
              >
                View #42
              </motion.button>
            </div>
          </div>
        </div>

        <div className="px-5 py-2 border-t border-[#30363D] bg-[#0D1117] flex justify-between">
          <span className="text-[9px] text-[#6E7681]">Powered by RepoOwl · Groq LLaMA 3.3</span>
          <motion.span
            animate={{ opacity: active ? [0, 1, 0] : 0 }}
            transition={{ delay: 0.3, duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="text-[9px] text-[#3FB950]"
          >
            ● Live
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Mockup ──────────────────────────────────── */
const SCENES = [
  { label: 'GitHub Issues', Scene: Scene1 },
  { label: 'Triage Analysis', Scene: Scene2 },
  { label: 'Result', Scene: Scene3 },
];

export default function IdeMockup() {
  const [scene, setScene] = useState(0);
  const timerRef = useRef(null);

  const goTo = (i) => {
    setScene(i);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setScene(s => (s + 1) % SCENES.length), SCENE_DURATIONS[i]);
  };

  useEffect(() => {
    timerRef.current = setTimeout(() => setScene(1), SCENE_DURATIONS[0]);
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setScene(s => (s + 1) % SCENES.length);
    }, SCENE_DURATIONS[scene]);
    return () => clearTimeout(timerRef.current);
  }, [scene]);

  return (
    <div
      className="w-full max-w-[1000px] mx-auto text-left rounded-2xl overflow-hidden"
      style={{
        boxShadow: '0 24px 80px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.07)',
        border: '1px solid #E8E5E0',
        background: '#FFFFFF',
      }}
    >
      {/* Title bar */}
      <div className="h-10 flex items-center px-4 border-b border-[#E8E5E0] bg-[#F8F7F4] gap-4 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E8E5E0] rounded-md">
          <Folder className="w-3 h-3 text-[#6B6A67]" />
          <span className="font-mono text-[11px] text-[#6B6A67]">repoowl / triage.ts</span>
        </div>

        {/* Scene tabs */}
        <div className="ml-auto flex gap-1">
          {SCENES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => goTo(i)}
              className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all duration-200 ${
                scene === i
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#6B6A67] hover:bg-[#F0EDE8]'
              }`}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-[#F0EDE8] relative overflow-hidden">
        <motion.div
          key={scene}
          className="h-full bg-[#1A1A1A] absolute left-0 top-0"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: SCENE_DURATIONS[scene] / 1000, ease: 'linear' }}
        />
      </div>

      {/* Scene viewport */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: 480 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {React.createElement(SCENES[scene].Scene, { active: true })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
