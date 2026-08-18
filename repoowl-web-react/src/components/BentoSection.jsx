import React, { useState } from 'react';
import {
  Key, Layers, Zap, Brain, Shield, GitBranch, CheckCircle, ArrowDown, ChevronRight,
} from 'lucide-react';
import AsciiArtBackground from './AsciiArtBackground';

// ─── Color constants ────────────────────────────────────────────
const C = {
  bg: '#0D1117',
  surface: '#161B22',
  border: '#30363D',
  accent: '#FF5722',
  blue: '#2F81F7',
  green: '#3FB950',
  yellow: '#D29922',
  red: '#DA3633',
  purple: '#8B5CF6',
  textPrimary: '#F0F6FC',
  textSecondary: '#8B949E',
};

// ─── Bento Card shell ───────────────────────────────────────────
function Card({ accent = C.border, minH = 200, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="rounded-[14px] p-6 transition-all duration-220"
      style={{
        minHeight: minH,
        border: `1px solid ${hovered ? `${accent}73` : C.border}`,
        background: hovered
          ? `linear-gradient(135deg, ${accent}0D 0%, #1A2030E6 100%)`
          : `${C.surface}E6`,
        boxShadow: hovered ? `0 0 20px ${accent}1F` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

function CardIcon({ color, children }) {
  return (
    <div
      className="inline-flex items-center justify-center w-10 h-10 rounded-[9px]"
      style={{
        background: `${color}1F`,
        border: `1px solid ${color}4D`,
      }}
    >
      {children}
    </div>
  );
}

function Label({ text }) {
  return (
    <span
      className="inline-block px-2.5 py-1 rounded text-[11px] font-bold tracking-[1.2px] uppercase"
      style={{ color: C.blue, background: `${C.blue}1A`, border: `1px solid ${C.blue}4D` }}
    >
      {text}
    </span>
  );
}

function CodeBlock({ lines }) {
  return (
    <div
      className="w-full p-3 rounded-[7px] font-mono text-[11px] leading-[1.65]"
      style={{ background: C.bg, border: `1px solid ${C.border}` }}
    >
      {lines.map(([text, color], i) => (
        <div key={i} style={{ color }}>{text}</div>
      ))}
    </div>
  );
}

function FlowBox({ label, sub, color, icon: Icon }) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-[7px]"
      style={{ background: `${color}12`, border: `1px solid ${color}4D` }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
      <div>
        <div className="font-mono text-[10px] font-semibold" style={{ color }}>{label}</div>
        <div className="text-[9px]" style={{ color: C.textSecondary }}>{sub}</div>
      </div>
    </div>
  );
}

// ─── Individual feature cards ────────────────────────────────────

function BYOKCard() {
  return (
    <Card accent={C.accent} minH={230}>
      <div className="flex items-center gap-3 mb-3.5">
        <CardIcon color={C.accent}><Key className="w-5 h-5" style={{ color: C.accent }} /></CardIcon>
        <div>
          <div className="font-bold text-[15px]" style={{ color: C.textPrimary }}>BYOK Architecture</div>
          <div className="text-xs" style={{ color: C.textSecondary }}>Your key, your control</div>
        </div>
      </div>
      <p className="text-xs leading-[1.55] mb-4" style={{ color: C.textSecondary }}>
        Bring your own API key. RepoOwl never proxies your credentials — they stay encrypted in your browser.
      </p>
      <CodeBlock lines={[
        ['// Key stored in chrome.storage.local', C.textSecondary],
        ['await chrome.storage.local.set({', C.textPrimary],
        ['  apiKey: encrypt(key)', C.accent],
        ['});', C.textPrimary],
      ]} />
    </Card>
  );
}

function DualLayerCard() {
  return (
    <Card accent={C.blue} minH={230}>
      <CardIcon color={C.blue}><Layers className="w-5 h-5" style={{ color: C.blue }} /></CardIcon>
      <div className="mt-3.5 mb-1.5 font-bold text-[15px]" style={{ color: C.textPrimary }}>Dual-Layer Sync</div>
      <p className="text-xs leading-[1.5] mb-4" style={{ color: C.textSecondary }}>
        Issues indexed in your Hub, analyzed in the Sandbox.
      </p>
      <FlowBox label="Hub (IndexedDB)" sub="Persistent issue store" color={C.blue} icon={Layers} />
      <div className="flex justify-center my-1.5">
        <ArrowDown className="w-3.5 h-3.5" style={{ color: C.border }} />
      </div>
      <FlowBox label="Sandbox (Worker)" sub="Isolated AI runtime" color={C.green} icon={Shield} />
    </Card>
  );
}

function SupabaseCard() {
  return (
    <Card accent={C.green} minH={230}>
      <div className="flex items-center gap-3 mb-3.5">
        <CardIcon color={C.green}><Zap className="w-5 h-5" style={{ color: C.green }} /></CardIcon>
        <span className="font-bold text-[15px]" style={{ color: C.textPrimary }}>Supabase Native</span>
      </div>
      <p className="text-xs leading-[1.55] mb-4" style={{ color: C.textSecondary }}>
        Serverless RLS policies and real-time sync — no backend code to maintain.
      </p>
      <CodeBlock lines={[
        ['-- Row Level Security', C.textSecondary],
        ['CREATE POLICY "user_owns_data"', C.textPrimary],
        ['  ON issues FOR ALL', C.textPrimary],
        ['  USING (auth.uid() = user_id);', C.green],
      ]} />
    </Card>
  );
}

function OmniPromptCard() {
  return (
    <Card accent={C.purple} minH={230}>
      <div className="flex items-center gap-3 mb-4">
        <CardIcon color={C.purple}><Brain className="w-5 h-5" style={{ color: C.purple }} /></CardIcon>
        <div>
          <div className="font-bold text-[15px]" style={{ color: C.textPrimary }}>Omni-Prompt Engine</div>
          <div className="text-xs" style={{ color: C.textSecondary }}>Structured JSON schema</div>
        </div>
      </div>
      <CodeBlock lines={[
        ['{', C.border],
        ['  "model": "llama3.3",', C.textPrimary],
        ['  "task": "duplicate_detect",', C.textPrimary],
        ['  "threshold": 0.85,', C.accent],
        ['  "privacy_mode": true', C.green],
        ['}', C.border],
      ]} />
      <p className="text-xs leading-[1.55] mt-3.5" style={{ color: C.textSecondary }}>
        Plug in any OpenAI-compatible API. The prompt schema adapts automatically to your model's context window.
      </p>
    </Card>
  );
}

// How It Works steps
const HOW_STEPS = [
  { icon: GitBranch, label: 'Open a GitHub Repo', color: C.blue },
  { label: '→', color: C.border, arrow: true },
  { icon: Brain, label: 'AI Scans Issues', color: C.accent },
  { label: '→', color: C.border, arrow: true },
  { icon: CheckCircle, label: 'Duplicates Flagged', color: C.green },
];

function HowItWorksCard() {
  return (
    <Card accent={C.accent} minH={140}>
      <div className="mb-4">
        <Label text="How It Works" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {HOW_STEPS.map((step, i) =>
          step.arrow ? (
            <ChevronRight key={i} className="w-3 h-3" style={{ color: C.border }} />
          ) : (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 rounded-[8px] flex items-center justify-center"
                style={{ background: `${step.color}1F`, border: `1px solid ${step.color}59` }}
              >
                <step.icon className="w-5 h-5" style={{ color: step.color }} />
              </div>
              <span className="font-mono text-[9px]" style={{ color: C.textSecondary }}>{step.label}</span>
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
    <section
      id="features"
      className="w-full px-5 md:px-12 py-16 md:py-24 relative overflow-hidden"
    >
      {/* ASCII art background — full-bleed, exactly as in Flutter BentoSection */}
      <AsciiArtBackground color="#8B949E" opacity={0.20} />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Section heading */}
        <div className="text-center mb-12">
          <Label text="Features" />
          <h2
            className="text-3xl md:text-[44px] font-extrabold tracking-tight mt-4 mb-4 leading-[1.15]"
            style={{ color: C.textPrimary }}
          >
            Everything you need.<br className="hidden md:block" /> Nothing you don't.
          </h2>
          <p className="text-[15px] max-w-[520px] mx-auto leading-relaxed" style={{ color: C.textSecondary }}>
            Client-side AI that runs inside your browser. No servers, no data leaving your machine.
          </p>
        </div>

        {/* How it works — full width */}
        <div className="mb-4">
          <HowItWorksCard />
        </div>

        {/* 2-col bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <BYOKCard />
          <DualLayerCard />
        </div>

        {/* 2-col bento grid row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SupabaseCard />
          <OmniPromptCard />
        </div>
      </div>
    </section>
  );
}
