import React, { useState } from 'react';
import {
  Key, Layers, Zap, Brain, Shield, GitBranch, CheckCircle, ArrowDown, ChevronRight,
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
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6A67',
  textMuted: '#9A9896',
};

// ─── Bento Card shell ───────────────────────────────────────────
function Card({ minH = 200, children }) {
  return (
    <div
      className="p-6 bg-white rounded-2xl border border-[#E8E5E0] hover:shadow-md transition-shadow duration-200"
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
        Contributors no longer paste manual API keys. The extension auto-discovers the maintainer's connection via a central registry.
      </p>
      <CodeBlock lines={[
        ['// Auto-resolve maintainer config', C.textMuted],
        ['const connection = await', C.textSecondary],
        ['  registry.discover(repoOwner);', C.blueText],
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
        Maintainers can force sync keys to the mediator and track real-time registration status directly from the UI.
      </p>
      <FlowBox label="Maintainer Node" sub="Pushes encrypted keys" bg={C.blue} icon={Layers} iconColor={C.blueText} />
      <div className="flex justify-center my-2">
        <ArrowDown className="w-3.5 h-3.5 text-[#C8C5C0]" />
      </div>
      <FlowBox label="Central Registry" sub="Broadcasts to contributors" bg={C.green} icon={Shield} iconColor={C.greenText} />
    </Card>
  );
}

function SupabaseRLSCard() {
  return (
    <Card minH={230}>
      <CardIcon bg={C.green}><Zap className="w-5 h-5" style={{ color: C.greenText }} /></CardIcon>
      <div className="font-semibold text-[15px] text-[#1A1A1A] mb-3">Secure RLS & Schema</div>
      <p className="text-xs leading-[1.6] mb-4 text-[#6B6A67]">
        Idempotent SQL schema with robust Row-Level Security ensuring seamless and secure read/write capabilities across roles.
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

function GroqLlamaCard() {
  return (
    <Card minH={230}>
      <CardIcon bg={C.purple}><Brain className="w-5 h-5" style={{ color: C.purpleText }} /></CardIcon>
      <div className="font-semibold text-[15px] text-[#1A1A1A] mb-1">Llama 3.3 Versatile</div>
      <div className="text-xs text-[#6B6A67] mb-4">Powered by Groq API</div>
      <CodeBlock lines={[
        ['{', C.textMuted],
        ['  "model": "llama3.3",', C.textSecondary],
        ['  "provider": "Groq",', C.textSecondary],
        ['  "speed": "instant",', C.purpleText],
        ['}', C.textMuted],
      ]} />
      <p className="text-xs leading-[1.6] mt-3 text-[#6B6A67]">
        Semantic analysis uses Llama 3 to understand the true meaning of issues, operating via blazing-fast Groq inference.
      </p>
    </Card>
  );
}

// How It Works steps
const HOW_STEPS = [
  { icon: GitBranch, label: 'Open a GitHub Repo', bg: C.blue, iconColor: C.blueText },
  { label: '→', arrow: true },
  { icon: Brain, label: 'AI Scans Issues', bg: C.yellow, iconColor: C.yellowText },
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
      <AsciiArtBackground color="#1A1A1A" opacity={0.04} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SupabaseRLSCard />
          <GroqLlamaCard />
        </div>
      </div>
    </div>
  );
}
