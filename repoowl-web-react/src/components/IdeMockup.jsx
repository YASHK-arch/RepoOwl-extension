import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder } from 'lucide-react';
import img1 from '../assets/1.png';
import img1_1 from '../assets/1.1.png';
import img2 from '../assets/2.png';
import img2_1 from '../assets/2.1.png';

/* ─── Sequence Configuration ────────────────────────── */
// We have 4 steps in the sequence
const STEPS = [
  { id: '1', title: 'Issue Triage: Analysis', image: img1, duration: 4000 },
  { id: '1.1', title: 'Issue Triage: Insights', image: img1_1, duration: 5000 },
  { id: '2', title: 'PR Triage: Context', image: img2, duration: 4000 },
  { id: '2.1', title: 'PR Triage: Auto-Labeller', image: img2_1, duration: 5000 },
];

export default function IdeMockup() {
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef(null);

  const goToNext = () => {
    setStepIndex((prev) => (prev + 1) % STEPS.length);
  };

  const goTo = (i) => {
    setStepIndex(i);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(goToNext, STEPS[i].duration);
  };

  useEffect(() => {
    timerRef.current = setTimeout(goToNext, STEPS[stepIndex].duration);
    return () => clearTimeout(timerRef.current);
  }, [stepIndex]);

  const currentStep = STEPS[stepIndex];

  return (
    <div
      className="w-full max-w-[1000px] mx-auto text-left rounded-2xl overflow-hidden"
      style={{
        boxShadow: '0 24px 80px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.07)',
        border: '1px solid #E8E5E0',
        background: '#0D1117', // Dark background for the images
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
          <span className="font-mono text-[11px] text-[#8B949E]">repoowl / ai-triage</span>
        </div>

        {/* Scene indicators */}
        <div className="ml-auto flex gap-1">
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              onClick={() => goTo(i)}
              className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all duration-200 ${
                stepIndex === i
                  ? 'bg-[#388BFD] text-white'
                  : 'text-[#8B949E] hover:bg-[#21262D]'
              }`}
            >
              {step.title}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-[#21262D] relative overflow-hidden">
        <motion.div
          key={stepIndex}
          className="h-full bg-[#388BFD] absolute left-0 top-0"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: currentStep.duration / 1000, ease: 'linear' }}
        />
      </div>

      {/* Image viewport */}
      <div className="relative w-full flex items-center justify-center p-4 md:p-8 overflow-hidden min-h-[400px] md:min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-full flex items-center justify-center"
          >
            <img 
              src={currentStep.image} 
              alt={currentStep.title} 
              className="w-full h-auto object-contain rounded-lg shadow-2xl border border-[#30363D]"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
