import React from 'react';
import { Folder, Bug, Sparkles, TriangleAlert } from 'lucide-react';

export default function TriageDemo() {
  return (
    <div className="w-full max-w-[920px] mx-auto bg-white rounded-xl shadow-lg border border-[#E5E5E5] overflow-hidden flex flex-col text-left">
      
      {/* Window Header */}
      <div className="flex items-center px-4 h-12 border-b border-[#E5E5E5] bg-white">
        {/* macOS Dots */}
        <div className="flex gap-2 items-center">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        
        {/* Tab */}
        <div className="ml-6 flex items-center gap-2 px-3 py-1.5 border border-[#E5E5E5] rounded-md bg-[#FBFBFB] text-[#6B6A67] text-xs font-medium font-mono">
          <Folder className="w-3.5 h-3.5" />
          <span>repoowl / triage.ts</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col md:flex-row bg-white relative z-10">
        
        {/* Left Pane: New Issue */}
        <div className="w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#E5E5E5] flex flex-col">
          
          <div className="flex items-center gap-2 mb-5">
            <Bug className="w-4 h-4 text-[#8C8B89]" />
            <span className="text-[11px] font-bold text-[#8C8B89] tracking-widest uppercase">New Issue</span>
          </div>

          <div className="px-4 py-3 border border-[#E5E5E5] rounded-lg mb-3 shadow-sm bg-white">
            <span className="text-[15px] font-semibold text-[#1A1A1A]">App crashes on login</span>
          </div>

          <div className="px-4 py-3 border border-[#E5E5E5] rounded-lg mb-4 bg-[#F9F8F6] min-h-[120px]">
            <p className="text-[14px] text-[#1A1A1A] font-mono leading-relaxed">
              App crashes on login when
              <br/>
              offline mode is enabled...<span className="animate-pulse font-light">|</span>
            </p>
          </div>

          <div className="flex gap-2 mb-10">
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#FCE8E8] text-[#D93A3A]">bug</span>
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#EBE5FF] text-[#6B44FF]">mobile</span>
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#FFF3CD] text-[#D99F26]">auth</span>
          </div>

          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#8C8B89]" />
              <span className="text-[12px] font-medium text-[#8C8B89] font-mono">Analyzing... 100%</span>
            </div>
            <div className="w-full h-1.5 bg-black rounded-full" />
          </div>

        </div>

        {/* Right Pane: RepoOwl Insight */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-[#FAFAFA]">
          
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" />
            <span className="text-[11px] font-bold text-[#8C8B89] tracking-widest uppercase">RepoOwl Insight</span>
          </div>

          <div className="bg-[#FFF5F5] border border-[#FCD6D6] rounded-xl p-1 mb-8 shadow-sm">
            <div className="px-3 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TriangleAlert className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-[14px] font-bold text-[#1A1A1A]">Duplicate Detected</span>
              </div>
              <div className="bg-[#1A1A1A] text-white text-[11px] font-bold px-2 py-0.5 rounded-md">92%</div>
            </div>
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-4 mx-1 mb-1">
              <p className="text-[13px] font-mono text-[#8C8B89] mb-2">Matches Issue <span className="text-[#0366D6] font-semibold">#42</span></p>
              <p className="text-[13px] font-mono text-[#8C8B89]">"Login fatal error on offline mode"</p>
            </div>
          </div>

          <div className="space-y-5 mb-10">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] text-[#6B6A67]">Semantic similarity</span>
                <span className="text-[12px] font-bold text-[#1A1A1A]">92%</span>
              </div>
              <div className="w-full h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                <div className="h-full bg-black rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] text-[#6B6A67]">Title match</span>
                <span className="text-[12px] font-bold text-[#1A1A1A]">78%</span>
              </div>
              <div className="w-full h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                <div className="h-full bg-[#52C41A] rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] text-[#6B6A67]">Label overlap</span>
                <span className="text-[12px] font-bold text-[#1A1A1A]">67%</span>
              </div>
              <div className="w-full h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                <div className="h-full bg-[#52C41A] rounded-full" style={{ width: '67%' }} />
              </div>
            </div>
          </div>

          <div className="mt-auto flex gap-3">
            <button className="px-4 py-2 bg-[#1A1A1A] text-white text-[13px] font-semibold rounded-lg hover:bg-black transition-colors shadow-sm">
              Mark Duplicate
            </button>
            <button className="px-4 py-2 bg-white border border-[#E5E5E5] text-[#1A1A1A] text-[13px] font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              View #42
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
