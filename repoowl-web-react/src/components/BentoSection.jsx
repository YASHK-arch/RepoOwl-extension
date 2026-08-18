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

function MediatorCard() {
  return (
    <Card accent={C.accent} minH={230}>
      <div className="flex items-center gap-3 mb-3.5">
        <CardIcon color={C.accent}><Key className="w-5 h-5" style={{ color: C.accent }} /></CardIcon>
        <div>
          <div className="font-bold text-[15px]" style={{ color: C.textPrimary }}>3-Layer Mediator</div>
          <div className="text-xs" style={{ color: C.textSecondary }}>Zero-config contributor discovery</div>
        </div>
      </div>
      <p className="text-xs leading-[1.55] mb-4" style={{ color: C.textSecondary }}>
        Contributors no longer paste manual API keys. The extension auto-discovers the maintainer's connection via a central registry.
      </p>
      <CodeBlock lines={[
        ['// Auto-resolve maintainer config', C.textSecondary],
        ['const connection = await', C.textPrimary],
        ['  registry.discover(repoOwner);', C.accent],
      ]} />
    </Card>
  );
}

function LiveSyncCard() {
  return (
    <Card accent={C.blue} minH={230}>
      <CardIcon color={C.blue}><Layers className="w-5 h-5" style={{ color: C.blue }} /></CardIcon>
      <div className="mt-3.5 mb-1.5 font-bold text-[15px]" style={{ color: C.textPrimary }}>Live Sync Tracking</div>
      <p className="text-xs leading-[1.5] mb-4" style={{ color: C.textSecondary }}>
        Maintainers can force sync keys to the mediator and track real-time registration status directly from the UI.
      </p>
      <FlowBox label="Maintainer Node" sub="Pushes encrypted keys" color={C.blue} icon={Layers} />
      <div className="flex justify-center my-1.5">
        <ArrowDown className="w-3.5 h-3.5" style={{ color: C.border }} />
      </div>
      <FlowBox label="Central Registry" sub="Broadcasts to contributors" color={C.green} icon={Shield} />
    </Card>
  );
}

function SupabaseRLSCard() {
  return (
    <Card accent={C.green} minH={230}>
      <div className="flex items-center gap-3 mb-3.5">
        <CardIcon color={C.green}><Zap className="w-5 h-5" style={{ color: C.green }} /></CardIcon>
        <span className="font-bold text-[15px]" style={{ color: C.textPrimary }}>Secure RLS & Schema</span>
      </div>
      <p className="text-xs leading-[1.55] mb-4" style={{ color: C.textSecondary }}>
        Idempotent SQL schema with robust Row-Level Security ensuring seamless and secure read/write capabilities across roles.
      </p>
      <CodeBlock lines={[
        ['-- Idempotent RLS Policy', C.textSecondary],
        ['CREATE POLICY "secure_read_write"', C.textPrimary],
        ['  ON issues FOR ALL', C.textPrimary],
        ['  USING (role = current_role);', C.green],
      ]} />
    </Card>
  );
}

function GroqLlamaCard() {
  return (
    <Card accent={C.purple} minH={230}>
      <div className="flex items-center gap-3 mb-4">
        <CardIcon color={C.purple}><Brain className="w-5 h-5" style={{ color: C.purple }} /></CardIcon>
        <div>
          <div className="font-bold text-[15px]" style={{ color: C.textPrimary }}>Llama 3.3 Versatile</div>
          <div className="text-xs" style={{ color: C.textSecondary }}>Powered by Groq API</div>
        </div>
      </div>
      <CodeBlock lines={[
        ['{', C.border],
        ['  "model": "llama3.3",', C.textPrimary],
        ['  "provider": "Groq",', C.textPrimary],
        ['  "speed": "instant",', C.accent],
        ['}', C.border],
      ]} />
      <p className="text-xs leading-[1.55] mt-3.5" style={{ color: C.textSecondary }}>
        Semantic analysis uses Llama 3 to understand the true meaning of issues, operating seamlessly via blazing-fast Groq inference.
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
          <MediatorCard />
          <LiveSyncCard />
        </div>

        {/* 2-col bento grid row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SupabaseRLSCard />
          <GroqLlamaCard />
        </div>
      </div>
    </section>
  );
}
