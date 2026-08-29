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
    color: "#000",
    bg: "#50E3C2"
  },
  {
    number: "02",
    title: "Load the Extension",
    description: "Install the RepoOwl browser extension locally via Chrome Developer mode. It runs directly inside your browser.",
    Visual: Step2Visual,
    color: "#000",
    bg: "#F8E71C"
  },
  {
    number: "03",
    title: "Configure & Sync",
    description: "Plug your API keys into the extension settings. Maintainers and contributors instantly sync and merge their analysis.",
    Visual: Step3Visual,
    color: "#fff",
    bg: "#BD10E0"
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
      <div className="flex-1 w-full p-6 rounded-xl border-[3px] border-black bg-white shadow-[8px_8px_0px_#000] hover:shadow-[12px_12px_0px_#000] transition-all duration-300 transform hover:-translate-y-1 hover:-translate-x-1 flex flex-col">

        {/* Step header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-black text-base border-2 border-black shadow-[3px_3px_0px_#000]" style={{ backgroundColor: step.bg, color: step.color }}>
            {step.number}
          </div>
          <h3 className="text-[18px] font-black text-black tracking-tight leading-tight uppercase">{step.title}</h3>
        </div>

        {/* Description */}
        <p className="text-[14px] font-bold text-black mb-6 min-h-[60px]">
          {step.description}
        </p>

        {/* Image Card Wrapper */}
        <div className="relative group mt-auto">
          <div
            ref={scrollRef}
            className="rounded-xl overflow-y-auto border-[3px] border-black bg-[#F4F4F0] aspect-[4/3] relative custom-scrollbar"
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
          <ArrowRight className="w-10 h-10 text-black hidden lg:block" strokeWidth={3} />
          <ArrowDown className="w-10 h-10 text-black block lg:hidden" strokeWidth={3} />
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
        background: '#ffffff',
        borderTop: '4px solid #000'
      }}
    >
      <WebGLBackground style={{ opacity: 0.3 }} />

      {/* Setup Badge */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20 bg-[#F8E71C] px-3 py-1 border-[2px] border-black shadow-[4px_4px_0px_#000] text-[12px] font-black tracking-widest text-black uppercase transform -rotate-2">
        Setup
      </div>
      
      {/* Neutral overlay with dot-grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundColor: 'transparent',
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 2px, transparent 2px)',
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
