import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, TriangleAlert, X, GitBranch, GitPullRequest, BarChart2, Settings,
  Search, AlertCircle, Check, Zap, FileCode, Plus, Minus, Tag, MessageSquare
} from 'lucide-react';

/* ─── Scene timing (ms) ─────────────────────────── */
const SCENE_DURATIONS = [6500, 6000, 6500];

/* ─── Shared helpers ──────────────────────────────── */
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
  }, [target, trigger, duration]);
  return val;
}

function useTypewriter(text, speed = 30, startDelay = 0, trigger = true) {
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
  }, [text, trigger, speed]);
  return typed;
}

/* ─── Scene 1: Issue Triage (1.png -> 1.1.png) ────── */
const ISSUES = [
  { title: '[FEATURE]: Convert the BYOK based extension setup to OAuth application based setup', labels: ['enhancement', 'extension-setup', 'oauth-integration', 'supabase-authentication'], num: '#99', closed: true, insights: true },
  { title: '[REFACTOR]: refactor triage workflow', labels: ['collaborator-management', 'github-integration', 'triage-workflow'], num: '#98', closed: true, insights: true },
  { title: '[BUG] Excessive and low-utility auto-generated labels from LLM API', labels: [], num: '#97', closed: true, duplicate: true },
];

function LabelPill({ text, isDark }) {
  const colorMap = {
    'enhancement': 'bg-[#A371F7]/10 text-[#D2A8FF] border-[#A371F7]/30',
    'extension-setup': 'bg-[#A371F7]/10 text-[#D2A8FF] border-[#A371F7]/30',
    'oauth-integration': 'bg-[#A371F7]/10 text-[#D2A8FF] border-[#A371F7]/30',
    'supabase-authentication': 'bg-[#3FB950]/10 text-[#56D364] border-[#3FB950]/30',
    'collaborator-management': 'bg-[#A371F7]/10 text-[#D2A8FF] border-[#A371F7]/30',
    'github-integration': 'bg-[#3FB950]/10 text-[#56D364] border-[#3FB950]/30',
    'triage-workflow': 'bg-[#E3B341]/10 text-[#E3B341] border-[#E3B341]/30',
  };
  const cls = colorMap[text] || 'bg-[#388BFD]/10 text-[#79C0FF] border-[#388BFD]/30';
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
    const t = setTimeout(() => setPanelVisible(true), 1500); // Wait 1.5s then slide in
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="flex w-full h-full bg-[#0D1117] text-[#E6EDF3] relative overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-[52px] border-r border-[#30363D] flex flex-col items-center py-3 gap-4 flex-shrink-0 bg-[#010409]">
        <div className="w-7 h-7 rounded-full bg-[#388BFD] flex items-center justify-center text-white text-[10px] font-bold">Y</div>
        {[GitBranch, GitPullRequest, BarChart2, Settings].map((Icon, i) => (
          <Icon key={i} className="w-4 h-4 text-[#6E7681] hover:text-[#E6EDF3] cursor-pointer" />
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0D1117]">
        <div className="px-5 py-4 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[#E6EDF3]">All issues</h2>
          <button className="px-3 py-1.5 bg-[#238636] text-white text-[12px] font-medium rounded-md hover:bg-[#2EA043]">New issue</button>
        </div>

        {/* Filter bar */}
        <div className="px-5 pb-3 flex gap-2">
          <div className="flex-1 h-8 bg-[#010409] border border-[#30363D] rounded-md flex items-center px-3 gap-2">
            <span className="text-[12px] text-[#8B949E]">is:<span className="text-[#E6EDF3]">issue</span> state:<span className="text-[#E6EDF3]">closed</span></span>
          </div>
        </div>

        {/* Issues list */}
        <div className="mx-5 border border-[#30363D] rounded-md overflow-hidden bg-[#0D1117]">
          <div className="flex items-center px-4 py-2.5 bg-[#161B22] border-b border-[#30363D]">
            <div className="flex gap-3 text-[12px] text-[#8B949E]">
              <span>Open <span className="bg-[#30363D] text-[#E6EDF3] px-1.5 rounded-full text-[10px]">1</span></span>
              <span className="text-[#E6EDF3] font-medium">Closed <span className="bg-[#30363D] text-[#E6EDF3] px-1.5 rounded-full text-[10px]">34</span></span>
            </div>
          </div>
          
          {ISSUES.map((issue, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: active ? 1 : 0, y: active ? 0 : 5 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className={`flex items-start gap-3 px-4 py-3 border-b border-[#21262D] last:border-b-0 ${issue.duplicate && panelVisible ? 'bg-[#161B22]' : ''} hover:bg-[#161B22]`}
            >
              <div className="mt-0.5">
                <div className="w-4 h-4 rounded-full border border-[#8957E5] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-[#8957E5]" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {issue.duplicate && <span className="text-[10px] bg-[#D93A3A]/10 text-[#FF7B7B] border border-[#D93A3A]/30 px-2 py-0.5 rounded-full flex items-center gap-1"><TriangleAlert className="w-3 h-3"/> Duplicate</span>}
                  <span className="text-[14px] text-[#E6EDF3] font-semibold">{issue.title}</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {issue.labels.map(l => <LabelPill key={l} text={l} />)}
                  </div>
                </div>
                <div className="text-[11px] text-[#8B949E]">{issue.num} · by YASHK-arch was closed 1w ago</div>
              </div>
              {issue.insights && (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-[#8B949E]"><GitPullRequest className="w-3 h-3"/> 1</span>
                  <span className="flex items-center gap-1 text-[11px] text-[#8B949E]"><MessageSquare className="w-3 h-3"/> 4</span>
                  <span className="px-2 py-0.5 text-[10px] flex items-center gap-1 text-[#79C0FF] border border-[#1F6FEB]/30 rounded-full bg-[#1F6FEB]/10">
                    <Zap className="w-3 h-3 text-[#E3B341]"/> AI Insights
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sliding Duplicate Panel */}
      <AnimatePresence>
        {panelVisible && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="absolute right-0 top-0 bottom-0 w-[42%] bg-[#0D1117] border-l border-[#30363D] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363D]">
              <div className="flex items-center gap-2">
                <TriangleAlert className="w-5 h-5 text-[#E3B341]" />
                <span className="text-[16px] font-bold text-[#E6EDF3]">Duplicate Detected</span>
              </div>
              <X className="w-4 h-4 text-[#8B949E] cursor-pointer hover:text-[#E6EDF3]" />
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 text-[11px] text-[#8B949E] mb-6">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Issue #97 · YASHK-arch/RepoOwl-extension</span>
                <span className="ml-auto px-2 py-0.5 bg-[#D93A3A]/10 text-[#FF7B7B] border border-[#D93A3A]/30 rounded-full text-[10px] font-semibold">⚠ Duplicate</span>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded bg-[#D2A8FF]" />
                  <span className="text-[10px] font-bold text-[#8B949E] tracking-widest uppercase">Technical Summary</span>
                </div>
                <p className="text-[12px] text-[#E6EDF3] leading-relaxed">
                  This issue is a <span className="text-[#E3B341] font-semibold">duplicate of #74</span> because both target the improvement of the LLM API's auto-generated labels for GitHub issues and PRs, focusing on minimizing unnecessary labels.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-[#E3B341]" />
                    <span className="text-[10px] font-bold text-[#8B949E] tracking-widest uppercase">Predicted Affected Files</span>
                  </div>
                  <span className="text-[10px] bg-[#1F6FEB]/20 text-[#79C0FF] px-2 py-0.5 rounded-full font-bold">4</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {['extension/src/lib/githubContext.js', 'extension/src/content/fetchIssueInsights.js', 'extension/src/settings/ModelConfig.jsx', 'github/labeler.yml'].map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.8 + i * 0.1, duration: 0.3 }}
                      className="px-3 py-2 bg-[#161B22] border border-[#30363D] rounded-md text-[11px] font-mono text-[#8B949E]"
                    >
                      {f}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Scene 2: PR Triage Analysis (2.png) ─────────── */
function Scene2({ active }) {
  const p1 = useCountUp(100, 1000, 500, active);
  const p2 = useCountUp(100, 1200, 1600, active);
  const p3 = useCountUp(100, 1500, 2900, active);

  return (
    <div className="flex w-full h-full bg-[#0D1117] text-[#E6EDF3] relative font-sans">
      {/* Left: PR Diff View */}
      <div className="w-[60%] border-r border-[#30363D] flex flex-col bg-[#010409]">
        <div className="h-10 border-b border-[#30363D] flex items-center px-4 bg-[#161B22]">
          <span className="text-[12px] font-semibold text-[#E6EDF3]">.github/scripts/analyze-pr.js</span>
        </div>
        <div className="p-4 font-mono text-[12px] leading-relaxed">
          <div className="flex text-[#8B949E] opacity-50 mb-2">
            <span className="w-8 text-right mr-4">19</span>
            <span>const GROQ_URL = 'https://api.groq.com...';</span>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: active ? 1 : 0, x: active ? 0 : -10 }}
            transition={{ delay: 0.2 }}
            className="flex bg-[#F85149]/10 border-l-2 border-[#F85149] text-[#FFA198]"
          >
            <span className="w-8 text-right mr-4 opacity-50">22</span>
            <span><span className="text-[#F85149] mr-2">-</span>const MODEL_NAME = 'llama-3.1-8b-instant';</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: active ? 1 : 0, x: active ? 0 : -10 }}
            transition={{ delay: 0.4 }}
            className="flex bg-[#2EA043]/10 border-l-2 border-[#3FB950] text-[#7EE787] mt-1"
          >
            <span className="w-8 text-right mr-4 opacity-50">22</span>
            <span><span className="text-[#3FB950] mr-2">+</span>const MODEL_NAME = 'qwen/qwen3.6-27b';</span>
          </motion.div>

          <div className="flex text-[#8B949E] opacity-50 mt-2">
            <span className="w-8 text-right mr-4">23</span>
            <span>// Updated to new model for better triage</span>
          </div>
        </div>
      </div>

      {/* Right: AI Analysis Panel */}
      <div className="w-[40%] flex flex-col p-6 bg-[#0D1117]">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-4 h-4 text-[#E3B341]" />
          <span className="text-[14px] font-bold text-[#E6EDF3]">RepoOwl Auto-Labeller</span>
        </div>

        <div className="flex flex-col gap-6">
          {/* Step 1: Diff Analysis */}
          <div>
            <div className="flex justify-between mb-2">
              <span className={`text-[11px] font-medium transition-colors ${p1 === 100 ? 'text-[#3FB950]' : 'text-[#8B949E]'}`}>
                {p1 === 100 ? 'Diff analysis complete' : 'Analyzing diffs...'}
              </span>
              <span className="font-mono text-[11px] text-[#8B949E]">{p1}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#21262D] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#388BFD]"
                initial={{ width: 0 }}
                animate={{ width: active ? `${p1}%` : 0 }}
                style={{ transition: 'width 0.1s linear', background: p1 === 100 ? '#3FB950' : '#388BFD' }}
              />
            </div>
          </div>

          {/* Step 2: Context Check */}
          <div>
            <div className="flex justify-between mb-2">
              <span className={`text-[11px] font-medium transition-colors ${p2 === 100 ? 'text-[#3FB950]' : 'text-[#8B949E]'}`}>
                {p2 === 100 ? 'Context matched' : p1 === 100 ? 'Checking linked issues...' : 'Waiting...'}
              </span>
              <span className="font-mono text-[11px] text-[#8B949E]">{p2}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#21262D] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#A371F7]"
                initial={{ width: 0 }}
                animate={{ width: active ? `${p2}%` : 0 }}
                style={{ transition: 'width 0.1s linear', background: p2 === 100 ? '#3FB950' : '#A371F7' }}
              />
            </div>
          </div>

          {/* Step 3: Judgement & Labeling */}
          <div>
            <div className="flex justify-between mb-2">
              <span className={`text-[11px] font-medium transition-colors ${p3 === 100 ? 'text-[#3FB950]' : 'text-[#8B949E]'}`}>
                {p3 === 100 ? 'Labels generated' : p2 === 100 ? 'Forming judgement...' : 'Waiting...'}
              </span>
              <span className="font-mono text-[11px] text-[#8B949E]">{p3}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#21262D] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#E3B341]"
                initial={{ width: 0 }}
                animate={{ width: active ? `${p3}%` : 0 }}
                style={{ transition: 'width 0.1s linear', background: p3 === 100 ? '#3FB950' : '#E3B341' }}
              />
            </div>
          </div>
        </div>

        {p3 === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-[#161B22] border border-[#30363D] rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-[#3FB950]" />
              <span className="text-[12px] font-semibold text-[#E6EDF3]">Ready for review</span>
            </div>
            <p className="text-[11px] text-[#8B949E]">PR analysis is complete. Commenting on pull request...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ─── Scene 3: PR Triage Result (2.1.png) ─────────── */
function Scene3({ active }) {
  const commentTyped = useTypewriter(
    "The code changes directly align with the PR description's detailed breakdown, showing intentional implementations rather than generic AI filler. The low slop score reflects high signal-to-noise scoping.",
    15, 600, active
  );

  return (
    <div className="flex flex-col w-full h-full bg-[#0D1117] text-[#E6EDF3] relative overflow-hidden font-sans p-6">
      
      {/* PR Header mockup */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#8957E5] text-white px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1.5">
          <GitPullRequest className="w-3.5 h-3.5" /> Merged
        </div>
        <div className="flex-1">
          <h2 className="text-[18px] font-semibold">feat: Landing page redesign, WebGL bg, fixes <span className="text-[#8B949E] font-normal">#105</span></h2>
        </div>
      </div>

      {/* PR Comment Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="flex gap-3 max-w-[800px]"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#21262D] border border-[#30363D] flex items-center justify-center flex-shrink-0 mt-1">
          <Zap className="w-4 h-4 text-[#E3B341]" />
        </div>

        {/* Comment Body */}
        <div className="flex-1 border border-[#30363D] rounded-lg bg-[#010409] overflow-hidden shadow-lg">
          <div className="px-4 py-2 border-b border-[#30363D] bg-[#161B22] flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[#E6EDF3]">github-actions <span className="text-[#8B949E] font-normal border border-[#30363D] rounded-full px-1.5 py-0.5 ml-1 text-[10px]">Bot</span></span>
            <span className="text-[12px] text-[#8B949E]">commented just now</span>
          </div>
          
          <div className="p-5">
            <h3 className="text-[16px] font-bold text-[#E6EDF3] mb-4 flex items-center gap-2">
              🦉 RepoOwl PR Analysis
            </h3>
            
            <div className="mb-4">
              <span className="text-[13px] text-[#E6EDF3]">Slop Badge: 🟢 <span className="text-[#8B949E]">Code Matches Description</span></span>
            </div>

            <p className="text-[13px] text-[#8B949E] leading-relaxed mb-4 min-h-[40px]">
              <strong className="text-[#E6EDF3]">AI Slop Detection:</strong> {commentTyped}
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ delay: 3.5, duration: 0.5 }}
            >
              <h4 className="text-[13px] font-bold text-[#E6EDF3] mb-2">Domain Impact:</h4>
              <ul className="list-disc pl-5 text-[13px] text-[#8B949E] flex flex-col gap-1.5 mb-4">
                <li><strong className="text-[#E6EDF3]">Landing Page/UI:</strong> Introduces major visual redesign with minimalist styling.</li>
                <li><strong className="text-[#E6EDF3]">CI/CD Workflows:</strong> Fixes issue assignment logic and updates model to <code className="bg-[#21262D] px-1 rounded text-[#E6EDF3]">qwen3.6-27b</code>.</li>
              </ul>

              <div className="flex items-center gap-2 p-3 bg-[#161B22] border border-[#30363D] rounded-md">
                <Check className="w-4 h-4 text-[#3FB950]" />
                <span className="text-[13px] font-semibold text-[#E6EDF3]">Final Verdict: Approve</span>
                <span className="text-[13px] text-[#8B949E]">— No breaking changes detected.</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Auto-added labels */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ delay: 4.5, duration: 0.5 }}
        className="mt-6 flex items-center gap-2 pl-11"
      >
        <Tag className="w-4 h-4 text-[#8B949E]" />
        <span className="text-[12px] font-semibold text-[#E6EDF3]">github-actions</span>
        <span className="text-[12px] text-[#8B949E]">added</span>
        <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#A371F7]/10 text-[#D2A8FF] border border-[#A371F7]/30">enhancement</span>
        <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#3FB950]/10 text-[#56D364] border border-[#3FB950]/30">repoowl-analyzed</span>
        <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#E3B341]/10 text-[#E3B341] border border-[#E3B341]/30">ci</span>
        <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#1F6FEB]/10 text-[#79C0FF] border border-[#1F6FEB]/30">frontend</span>
        <span className="text-[12px] text-[#8B949E]">labels just now</span>
      </motion.div>
    </div>
  );
}

/* ─── Main Mockup ──────────────────────────────────── */
const SCENES = [
  { label: 'Issue Triage', Scene: Scene1 },
  { label: 'PR Auto-Labeller', Scene: Scene2 },
  { label: 'PR Analysis', Scene: Scene3 },
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
        boxShadow: '0 24px 80px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)',
        border: '1px solid #30363D',
        background: '#0D1117',
      }}
    >
      {/* Title bar */}
      <div className="h-10 flex items-center px-4 border-b border-[#30363D] bg-[#161B22] gap-4 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D1117] border border-[#30363D] rounded-md">
          <Folder className="w-3 h-3 text-[#8B949E]" />
          <span className="font-mono text-[11px] text-[#8B949E]">repoowl / workflows</span>
        </div>

        {/* Scene tabs */}
        <div className="ml-auto flex gap-1">
          {SCENES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => goTo(i)}
              className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all duration-200 ${
                scene === i
                  ? 'bg-[#388BFD] text-white'
                  : 'text-[#8B949E] hover:bg-[#21262D]'
              }`}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-[#21262D] relative overflow-hidden">
        <motion.div
          key={scene}
          className="h-full bg-[#388BFD] absolute left-0 top-0"
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
