import React from 'react';
import {
  Key, Layers, Zap, Brain, Shield, GitBranch, CheckCircle, ChevronRight,
  AlertTriangle, Eye, GitPullRequest, Repeat2, ArrowDown,
} from 'lucide-react';
import AsciiArtBackground from './AsciiArtBackground';

// ─── Color constants ────────────────────────────────────────────
const C = {
  bg: '#F0EDE8',
  surface: '#FFFFFF',
  border: '#E8E5E0',
  accent: '#1A1A1A',
  blue: '#EFF6FF',
  blueText: '#2F81F7',
  green: '#F0FDF4',
  greenText: '#3FB950',
  yellow: '#FEFCE8',
  yellowText: '#CA8A04',
  purple: '#F5F3FF',
  purpleText: '#8B5CF6',
  red: '#FEF2F2',
  redText: '#DA3633',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6A67',
  textMuted: '#9A9896',
};

// ─── Bento Card shell ───────────────────────────────────────────
function Card({ minH = 200, children, className = '' }) {
  return (
    <div
      className={`p-6 bg-white rounded-2xl border border-[#E8E5E0] hover:shadow-md transition-shadow duration-200 ${className}`}
      style={{ minHeight: minH }}
    >
      {children}
    </div>
  );
}

function CardIcon({ bg, children }) {
  return (
    <div
      className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4"
      style={{ background: bg }}
    >
      {children}
    </div>
  );
}

function Tag({ text }) {
  return (
    <span className="inline-block px-2 py-1 bg-[#F0EDE8] text-[10px] font-semibold text-[#9A9896] uppercase tracking-[0.8px] rounded-md">
      {text}
    </span>
  );
}

function CodeBlock({ lines }) {
  return (
    <div className="w-full p-3 font-mono text-[12px] leading-[1.7] rounded-xl bg-[#F8F7F4] border border-[#ECEAE6]">
      {lines.map(([text, color], i) => (
        <div key={i} style={{ color }}>{text}</div>
      ))}
    </div>
  );
}

function FlowBox({ label, sub, bg, icon: Icon, iconColor }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#E8E5E0]" style={{ background: bg }}>
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: iconColor }} />
      <div>
        <div className="font-mono text-[11px] font-semibold text-[#1A1A1A]">{label}</div>
        <div className="text-[10px] text-[#6B6A67]">{sub}</div>
      </div>
    </div>
  );
}

// ─── Individual feature cards ────────────────────────────────────

function MediatorCard() {
  return (
    <Card minH={230}>
      <CardIcon bg={C.yellow}><Key className="w-5 h-5" style={{ color: C.yellowText }} /></CardIcon>
      <div className="font-semibold text-[15px] text-[#1A1A1A] mb-1">3-Layer Mediator</div>
      <div className="text-xs text-[#6B6A67] mb-3">Zero-config contributor discovery</div>
      <p className="text-xs leading-[1.6] mb-4 text-[#6B6A67]">
        Contributors never paste API keys. The extension auto-discovers the maintainer's Supabase connection via a shared Central Mediator registry — fully automatic.
      </p>
      <CodeBlock lines={[
        ['// Zero-config discovery', C.textMuted],
        ['const hub = await registry', C.textSecondary],
        ['  .discover(repoOwner);', C.blueText],
        ['// fallback: repoowl.json', C.textMuted],
      ]} />
    </Card>
  );
}

function LiveSyncCard() {
  return (
    <Card minH={230}>
      <CardIcon bg={C.blue}><Layers className="w-5 h-5" style={{ color: C.blueText }} /></CardIcon>
      <div className="font-semibold text-[15px] text-[#1A1A1A] mb-3">Live Sync Tracking</div>
      <p className="text-xs leading-[1.5] mb-4 text-[#6B6A67]">
        Maintainers force-sync keys to the mediator and track real-time contributor registration status directly from the Settings UI.
      </p>
      <FlowBox label="Maintainer Node" sub="Pushes encrypted keys" bg={C.blue} icon={Layers} iconColor={C.blueText} />
      <div className="flex justify-center my-2">
        <ArrowDown className="w-3.5 h-3.5 text-[#C8C5C0]" />
      </div>
      <FlowBox label="Central Registry" sub="Broadcasts to contributors" bg={C.green} icon={Shield} iconColor={C.greenText} />
    </Card>
  );
}

function PRSlopCard() {
  return (
    <Card minH={230}>
      <CardIcon bg={C.red}><GitPullRequest className="w-5 h-5" style={{ color: C.redText }} /></CardIcon>
      <div className="font-semibold text-[15px] text-[#1A1A1A] mb-1">PR Slop Detection</div>
      <div className="text-xs text-[#6B6A67] mb-3">AI-generated code & off-topic PRs flagged</div>
      <p className="text-xs leading-[1.6] mb-4 text-[#6B6A67]">
        LLaMA evaluates PR diffs against title, description, and linked issues — flagging AI-generated "slop", off-topic changes, and unresolved issues.
      </p>
      <CodeBlock lines={[
        ['{', C.textMuted],
        ['  "is_slop": true,', C.redText],
        ['  "severity": "high",', C.textSecondary],
        ['  "labels": ["ai-generated"]', C.purpleText],
        ['}', C.textMuted],
      ]} />
    </Card>
  );
}

function GroqLlamaCard() {
  return (
    <Card minH={230}>
      <CardIcon bg={C.purple}><Brain className="w-5 h-5" style={{ color: C.purpleText }} /></CardIcon>
      <div className="font-semibold text-[15px] text-[#1A1A1A] mb-1">LLaMA 3.3 70B</div>
      <div className="text-xs text-[#6B6A67] mb-4">llama-3.3-70b-specdec · Groq Cloud</div>
      <CodeBlock lines={[
        ['{', C.textMuted],
        ['  "model": "llama-3.3-70b-specdec",', C.textSecondary],
        ['  "temperature": 0.1,', C.purpleText],
        ['  "response_format": "json_object"', C.blueText],
        ['}', C.textMuted],
      ]} />
      <p className="text-xs leading-[1.6] mt-3 text-[#6B6A67]">
        Near-deterministic JSON output. Understands issue <em>meaning</em> — not just keywords — via Groq's blazing-fast speculative decoding inference.
      </p>
    </Card>
  );
}

function DraftCheckerCard() {
  return (
    <Card minH={230}>
      <CardIcon bg={C.green}><Eye className="w-5 h-5" style={{ color: C.greenText }} /></CardIcon>
      <div className="font-semibold text-[15px] text-[#1A1A1A] mb-1">Real-Time Draft Checker</div>
      <div className="text-xs text-[#6B6A67] mb-3">Duplicate warning before you submit</div>
      <p className="text-xs leading-[1.6] mb-4 text-[#6B6A67]">
        As contributors type a new issue, RepoOwl silently queries the last 50 open issues and injects a red warning banner in the GitHub UI — before the issue is even filed.
      </p>
      <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 flex gap-2 items-start">
        <AlertTriangle className="w-3.5 h-3.5 text-[#DA3633] mt-0.5 flex-shrink-0" />
        <div className="text-[11px] text-[#DA3633] font-medium leading-relaxed">
          Similar open issue detected: <span className="font-mono">#142</span> — "Auth token refresh loop"
        </div>
      </div>
    </Card>
  );
}

function SupabaseRLSCard() {
  return (
    <Card minH={230}>
      <CardIcon bg={C.green}><Zap className="w-5 h-5" style={{ color: C.greenText }} /></CardIcon>
      <div className="font-semibold text-[15px] text-[#1A1A1A] mb-3">Secure RLS & Schema</div>
      <p className="text-xs leading-[1.6] mb-4 text-[#6B6A67]">
        Idempotent SQL schema with robust Row-Level Security across Maintainer Hub and Contributor Sandbox Supabase projects. Handles both roles seamlessly.
      </p>
      <CodeBlock lines={[
        ['-- Idempotent RLS Policy', C.textMuted],
        ['CREATE POLICY "secure_read_write"', C.textSecondary],
        ['  ON issues FOR ALL', C.textSecondary],
        ['  USING (role = current_role);', C.greenText],
      ]} />
    </Card>
  );
}

function AutomationCard() {
  return (
    <Card minH={140} className="col-span-1 md:col-span-2">
      <div className="flex flex-wrap gap-3 items-start justify-between">
        <div>
          <CardIcon bg={C.purple}><Repeat2 className="w-5 h-5" style={{ color: C.purpleText }} /></CardIcon>
          <div className="font-semibold text-[15px] text-[#1A1A1A] mb-1">7 GitHub Actions Workflows</div>
          <p className="text-xs leading-[1.6] text-[#6B6A67] max-w-[500px]">
            Auto-install via the extension UI. Covers issue analysis, PR slop detection, auto-labeling, contributor assignment, stale management, welcome messages, and post-merge status updates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {['issue-analyze', 'repoowl-analyze', 'auto-label', 'issue-assignment', 'pr-merged', 'welcome', 'stale'].map(w => (
            <span key={w} className="font-mono text-[10px] px-2 py-1 rounded-md bg-[#F5F3FF] text-[#8B5CF6] border border-[#EDE9FE]">{w}.yml</span>
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
  { icon: Brain, label: 'LLaMA 3.3 Scans Issues', bg: C.yellow, iconColor: C.yellowText },
  { label: '→', arrow: true },
  { icon: CheckCircle, label: 'Duplicates Flagged', bg: C.green, iconColor: C.greenText },
];

function HowItWorksCard() {
  return (
    <Card minH={140}>
      <div className="mb-5">
        <Tag text="How It Works" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {HOW_STEPS.map((step, i) =>
          step.arrow ? (
            <ChevronRight key={i} className="w-4 h-4 text-[#C8C5C0]" />
          ) : (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className="w-11 h-11 flex items-center justify-center rounded-xl"
                style={{ background: step.bg }}
              >
                <step.icon className="w-5 h-5" style={{ color: step.iconColor }} />
              </div>
              <span className="font-mono text-[10px] font-semibold text-[#6B6A67] uppercase tracking-tight text-center max-w-[80px]">{step.label}</span>
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
      className="w-full px-5 md:px-12 py-16 md:py-24 relative overflow-hidden"
      style={{ borderTop: '1px solid #E0DDD8' }}
    >
      <AsciiArtBackground color="#1A1A1A" opacity={0.12} />
      <div className="max-w-[1100px] mx-auto relative z-10">
        {/* Section heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-[44px] font-bold tracking-[-1px] text-[#1A1A1A] mb-4">
            Everything you need.
            <br className="hidden md:block" />
            <span className="text-[#9A9896]"> Nothing you don't.</span>
          </h2>
          <p className="text-[15px] max-w-[480px] mx-auto leading-relaxed text-[#6B6A67]">
            Client-side AI that runs inside your browser. No servers, no data leaving your machine.
          </p>
        </div>

        {/* How it works — full width */}
        <div className="mb-5">
          <HowItWorksCard />
        </div>

        {/* 2-col bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <MediatorCard />
          <LiveSyncCard />
        </div>

        {/* 2-col bento grid row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <DraftCheckerCard />
          <PRSlopCard />
        </div>

        {/* 2-col bento grid row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <SupabaseRLSCard />
          <GroqLlamaCard />
        </div>

        {/* Full-width automation card */}
        <div className="grid grid-cols-1 gap-4">
          <AutomationCard />
        </div>
      </div>
    </div>
  );
}
