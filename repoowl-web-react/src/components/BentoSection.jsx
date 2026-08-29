import React from 'react';
import { motion } from 'framer-motion';
import {
  Key, Layers, Zap, CheckCircle, ChevronRight,
  GitPullRequest, Repeat2, GitBranch, Brain, Shield, AlertTriangle
} from 'lucide-react';
import DottedBackground from './DottedBackground';

import { PRAnalysisMockup, IssueAnalysisMockup, PathLabelingMockup } from './MockupComponents';

// ─── Color constants ────────────────────────────────────────────
const C = {
  bg: '#ffffff',
  surface: '#ffffff',
  border: '#000000',
  accent: '#000000',
  blue: '#4A90E2',
  blueText: '#000000',
  green: '#50E3C2',
  greenText: '#000000',
  yellow: '#F8E71C',
  yellowText: '#000000',
  purple: '#BD10E0',
  purpleText: '#000000',
  red: '#FF4F5E',
  redText: '#000000',
  textPrimary: '#000000',
  textSecondary: '#000000',
  textMuted: '#000000',
};

// ─── Animation Variants ─────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

// ─── Bento Card shell ───────────────────────────────────────────
function Card({ minH = 200, children, className = '', p = 'p-6', bg = 'bg-white' }) {
  return (
    <motion.div
      variants={fadeUp}
      className={`${p} ${bg} rounded-xl border-[3px] border-black shadow-[6px_6px_0px_#000] hover:shadow-[10px_10px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200 ${className}`}
      style={{ minHeight: minH }}
    >
      {children}
    </motion.div>
  );
}

function CardIcon({ bg, children }) {
  return (
    <div
      className="inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 border-black shadow-[3px_3px_0px_#000] mb-4"
      style={{ background: bg }}
    >
      {children}
    </div>
  );
}

function Tag({ text }) {
  return (
    <span className="inline-block px-2 py-1 bg-black text-[10px] font-black text-white uppercase tracking-wider border-2 border-black">
      {text}
    </span>
  );
}

function CodeBlock({ lines }) {
  return (
    <div className="w-full p-3 font-mono text-[12px] leading-[1.7] rounded-none bg-[#f4f4f0] border-[3px] border-black shadow-[4px_4px_0px_#000]">
      {lines.map(([text, color], i) => (
        <div key={i} className="font-bold" style={{ color: color === '#000000' ? '#000' : color }}>{text}</div>
      ))}
    </div>
  );
}

// ─── Individual feature cards ────────────────────────────────────

function MediatorCard({ className = '' }) {
  return (
    <Card minH={240} bg="bg-[#F8E71C]" className={className}>
      <CardIcon bg="#ffffff"><Key className="w-5 h-5" style={{ color: "#000" }} /></CardIcon>
      <div className="font-black text-[16px] text-black mb-1 uppercase tracking-tight">3-Layer Mediator</div>
      <div className="text-sm font-bold text-black mb-3">Zero-config contributor discovery</div>
      <p className="text-xs font-semibold leading-[1.6] mb-4 text-black">
        Contributors never paste API keys. The extension auto-discovers the maintainer's Supabase connection via a shared Central Mediator registry — fully automatic.
      </p>
      <CodeBlock lines={[
        ['// Zero-config discovery', '#333'],
        ['const hub = await registry', '#000'],
        ['  .discover(repoOwner);', '#000'],
        ['// fallback: repoowl.json', '#333'],
      ]} />
    </Card>
  );
}

function PathLabelingCard({ className = '' }) {
  return (
    <Card p="p-0" minH={240} bg="bg-[#0d1117]" className={`overflow-hidden flex items-center justify-center relative group ${className}`}>
       <PathLabelingMockup />
    </Card>
  );
}

function PRSlopCard({ className = '' }) {
  return (
    <Card minH={320} bg="bg-[#FF4F5E]" className={className}>
      <CardIcon bg="#ffffff"><GitPullRequest className="w-5 h-5" style={{ color: "#000" }} /></CardIcon>
      <div className="font-black text-[16px] text-black mb-1 uppercase tracking-tight">PR Slop Detection</div>
      <div className="text-sm font-bold text-black mb-3">AI-generated code & off-topic PRs flagged</div>
      <p className="text-xs font-semibold leading-[1.6] mb-4 text-black">
        Qwen 3.6 27B evaluates PR diffs against title, description, and linked issues — flagging AI-generated "slop", off-topic changes, and unresolved issues.
      </p>
      <CodeBlock lines={[
        ['{', '#000'],
        ['  "is_slop": true,', '#FF4F5E'],
        ['  "severity": "high",', '#000'],
        ['  "labels": ["ai-generated"]', '#000'],
        ['}', '#000'],
      ]} />
    </Card>
  );
}

function PRImageCard({ className = '' }) {
  return (
    <Card p="p-0" minH={320} bg="bg-white" className={`overflow-hidden flex items-center justify-center relative group ${className}`}>
       <PRAnalysisMockup />
    </Card>
  );
}

function IssueImageCard({ className = '' }) {
  return (
    <Card p="p-0" minH={320} bg="bg-white" className={`overflow-hidden flex items-center justify-center relative group ${className}`}>
       <IssueAnalysisMockup />
    </Card>
  );
}

function SupabaseRLSCard({ className = '' }) {
  return (
    <Card minH={320} bg="bg-[#50E3C2]" className={className}>
      <CardIcon bg="#ffffff"><Zap className="w-5 h-5" style={{ color: "#000" }} /></CardIcon>
      <div className="font-black text-[16px] text-black mb-3 uppercase tracking-tight">Secure RLS & Schema</div>
      <p className="text-xs font-semibold leading-[1.6] mb-4 text-black">
        Idempotent SQL schema with robust Row-Level Security across Maintainer Hub and Contributor Sandbox Supabase projects. Handles both roles seamlessly.
      </p>
      <CodeBlock lines={[
        ['-- Idempotent RLS Policy', '#333'],
        ['CREATE POLICY "secure_read_write"', '#000'],
        ['  ON issues FOR ALL', '#000'],
        ['  USING (role = current_role);', '#000'],
      ]} />
    </Card>
  );
}

function AutomationCard() {
  return (
    <Card minH={140} bg="bg-white" className="col-span-1 md:col-span-2">
      <div className="flex flex-wrap gap-3 items-start justify-between">
        <div>
          <CardIcon bg="#BD10E0"><Repeat2 className="w-5 h-5" style={{ color: "#fff" }} /></CardIcon>
          <div className="font-black text-[16px] text-black mb-1 uppercase tracking-tight">7 GitHub Actions Workflows</div>
          <p className="text-xs font-semibold leading-[1.6] text-black max-w-[500px]">
            Auto-install via the extension UI. Covers issue analysis, PR slop detection, auto-labeling, contributor assignment, stale management, welcome messages, and post-merge status updates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {['issue-analyze', 'repoowl-analyze', 'auto-label', 'issue-assignment', 'pr-merged', 'welcome', 'stale'].map(w => (
            <span key={w} className="font-mono font-bold text-[10px] px-2 py-1 bg-[#BD10E0] text-white border-2 border-black shadow-[2px_2px_0px_#000]">{w}.yml</span>
          ))}
        </div>
      </div>
    </Card>
  );
}

// How It Works steps
const HOW_STEPS = [
  { icon: GitBranch, label: 'Open a GitHub Repo', bg: C.blue, iconColor: C.blueText },
  { label: '→', arrow: true },
  { icon: Brain, label: 'Qwen 3.6 27B Scans Issues', bg: C.yellow, iconColor: C.yellowText },
  { label: '→', arrow: true },
  { icon: CheckCircle, label: 'Duplicates Flagged', bg: C.green, iconColor: C.greenText },
];

function HowItWorksCard() {
  return (
    <Card minH={140} bg="bg-white">
      <div className="mb-5">
        <Tag text="How It Works" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {HOW_STEPS.map((step, i) =>
          step.arrow ? (
            <ChevronRight key={i} className="w-5 h-5 text-black stroke-[3]" />
          ) : (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className="w-11 h-11 flex items-center justify-center rounded-lg border-2 border-black shadow-[3px_3px_0px_#000]"
                style={{ background: step.bg }}
              >
                <step.icon className="w-5 h-5" style={{ color: step.iconColor }} />
              </div>
              <span className="font-mono text-[10px] font-black text-black uppercase tracking-tight text-center max-w-[80px]">{step.label}</span>
            </div>
          )
        )}
      </div>
    </Card>
  );
}

// ─── Main BentoSection ──────────────────────────────────────────
export default function BentoSection() {
  return (
    <div
      id="features"
      className="w-full px-5 md:px-10 py-16 md:py-24 relative overflow-hidden"
      style={{ borderTop: '1px solid #E8E5E0' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.7 }}>
        <DottedBackground 
          bgColor="transparent" 
          colors={["rgba(139, 110, 87, 0.08)", "rgba(139, 110, 87, 0.18)"]}
          cellSize={30}
          frequency={3}
          speed={2}
          gamma={2}
        />
      </div>
      <div className="max-w-[1600px] mx-auto relative z-10">
        
        {/* Section heading */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-[44px] font-black tracking-tighter text-black mb-4 uppercase">
            Everything you need.
            <br className="hidden md:block" />
            <span className="bg-black text-[#F8E71C] px-2 py-1 inline-block mt-2 transform -rotate-2 shadow-[6px_6px_0px_#FF4F5E]">NOTHING YOU DON'T.</span>
          </h2>
          <p className="text-[16px] font-bold max-w-[480px] mx-auto leading-relaxed text-black">
            Dual-layer architecture combining native Chrome extension UI with powerful server-side GitHub Actions.
          </p>
        </motion.div>

        {/* ─── FEATURES SECTION ─── */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ staggerChildren: 0.1 }}
          className="mb-16"
        >
          {/* Row 1 */}
          <div className="mb-4">
            <HowItWorksCard />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <MediatorCard className="md:col-span-1" />
            <PathLabelingCard className="md:col-span-2" />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PRImageCard className="md:col-span-2" />
            <PRSlopCard className="md:col-span-1" />
          </div>
        </motion.div>

        {/* ─── TECHNOLOGY SECTION ─── */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ staggerChildren: 0.1 }}
        >
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <SupabaseRLSCard className="md:col-span-1" />
            <IssueImageCard className="md:col-span-2" />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-4">
            <AutomationCard />
          </div>
        </motion.div>

      </div>
    </div>
  );
}
