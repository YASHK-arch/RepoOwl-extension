import React from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import AsciiArtBackground from './AsciiArtBackground';
import WebGLBackground from './WebGLBackground';

import { Step1Visual, Step2Visual, Step3Visual } from './SetupStepVisuals';

const steps = [
  {
    number: "01",
    title: "Database Initialization",
    description: "Set up your personal Supabase project (the Sandbox) and run the SQL schema to initialize your database securely.",
    Visual: Step1Visual,
    color: "#2F81F7",
    bg: "#EFF6FF"
  },
  {
    number: "02",
    title: "Load the Extension",
    description: "Install the RepoOwl browser extension locally via Chrome Developer mode. It runs directly inside your browser.",
    Visual: Step2Visual,
    color: "#3FB950",
    bg: "#F0FDF4"
  },
  {
    number: "03",
    title: "Configure & Sync",
    description: "Plug your API keys into the extension settings. Maintainers and contributors instantly sync and merge their analysis.",
    Visual: Step3Visual,
    color: "#8B5CF6",
    bg: "#F5F3FF"
  }
];

const SetupCard = ({ step, idx, isLast }) => {
  const scrollRef = React.useRef(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  React.useEffect(() => {
    if (idx === 0 && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          const target = scrollRef.current.querySelector('#manual-linking-step');
          if (target) {
            // Scroll to the top of the manual linking element
            scrollRef.current.scrollTo({
              top: target.offsetTop,
              behavior: 'auto'
            });
          }
        }
      }, 50);
    }
  }, [idx]);

  return (
    <React.Fragment>
      <div className="flex-1 w-full p-6 rounded-2xl border border-[#E8E5E0] bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col">

        {/* Step header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-base shadow-sm" style={{ backgroundColor: step.bg, color: step.color }}>
            {step.number}
          </div>
          <h3 className="text-[17px] font-bold text-[#1A1A1A] tracking-tight leading-tight">{step.title}</h3>
        </div>

        {/* Description */}
        <p className="text-[13.5px] text-[#6B6A67] mb-6 min-h-[60px]">
          {step.description}
        </p>

        {/* Image Card Wrapper */}
        <div className="relative group mt-auto">
          <div
            ref={scrollRef}
            className="rounded-xl overflow-y-auto border border-[#E8E5E0] bg-[#F9F8F6] aspect-[4/3] shadow-inner relative custom-scrollbar"
          >
            <div className="w-full min-h-full">
              <step.Visual />
            </div>
          </div>


        </div>
      </div>

      {/* Arrow */}
      {!isLast && (
        <div className="flex-shrink-0 flex items-center justify-center p-2">
          <ArrowRight className="w-8 h-8 text-[#1A1A1A] hidden lg:block" strokeWidth={1.5} />
          <ArrowDown className="w-8 h-8 text-[#1A1A1A] block lg:hidden" strokeWidth={1.5} />
        </div>
      )}
    </React.Fragment>
  );
};

export default function SetupSection() {
  return (
    <div 
      id="setup" 
      className="w-full px-5 md:px-12 py-10 md:py-12 relative overflow-hidden" 
      style={{ 
        background: '#F0EDE8',
        borderTop: '1px solid rgba(0,0,0,0.08)'
      }}
    >
      <WebGLBackground style={{ opacity: 0.6 }} />

      {/* Setup Badge */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20 bg-white px-3 py-1 rounded-full shadow-sm border border-black/5 text-[10px] font-bold tracking-widest text-[#1A1A1A] uppercase">
        Setup
      </div>
      
      {/* Neutral overlay with dot-grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundColor: 'rgba(245, 235, 215, 0.65)', /* Pale wheatish/warm cream overlay */
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4">
          {steps.map((step, idx) => (
            <SetupCard key={idx} step={step} idx={idx} isLast={idx === steps.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
