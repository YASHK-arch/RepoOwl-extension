import React from 'react';
import { Database, Cpu, X, Check, RefreshCw, Settings, AlertTriangle } from 'lucide-react';

const GithubIcon = ({ size = 24, className = "", color = "currentColor" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const SupabaseIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M11.9997 22L3.5 12.0003H9.5V2L17.9997 12.0003H12V22Z" fill="currentColor"/>
  </svg>
);

export const Step1Visual = () => {
  return (
    <div className="w-full min-h-[400px] bg-[#1C1C1C] flex flex-col font-sans overflow-hidden text-left">
      <div className="flex-1 p-3 sm:p-5 flex flex-col gap-4 scale-[0.85] origin-top-left w-[120%]">
        
        {/* Top Header */}
        <div className="mb-2">
          <h1 className="text-white text-[18px] sm:text-[22px] font-semibold mb-1 tracking-tight">Sign In / Providers</h1>
          <p className="text-[#A1A1AA] text-[11px] sm:text-[13px]">Configure authentication providers and login methods for your users</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-[#2D2D2D] pb-[1px]">
          <div className="text-white text-[12px] sm:text-[14px] font-medium border-b-2 border-white pb-2 px-1">Supabase Auth</div>
          <div className="text-[#A1A1AA] text-[12px] sm:text-[14px] font-medium pb-2 px-1">Third-Party Auth</div>
        </div>

        {/* Section Title */}
        <h2 className="text-white text-[15px] sm:text-[17px] font-semibold mt-2">User Signups</h2>

        {/* Settings List */}
        <div className="border border-[#2D2D2D] rounded-lg overflow-hidden flex flex-col">
          
          {/* Item 1 */}
          <div className="flex justify-between items-center p-3 sm:p-4 border-b border-[#2D2D2D]">
            <div>
              <div className="text-white text-[12px] sm:text-[14px] font-medium mb-0.5">Allow new users to sign up</div>
              <div className="text-[#A1A1AA] text-[11px] sm:text-[13px]">If this is disabled, new users will not be able to sign up to your application</div>
            </div>
            <div className="w-8 h-4 bg-[#24B47E] rounded-full relative flex items-center shrink-0">
              <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 shadow-sm"></div>
            </div>
          </div>

          {/* Item 2 */}
          <div id="manual-linking-step" className="flex justify-between items-center p-3 sm:p-4 border-b border-[#2D2D2D]">
            <div>
              <div className="text-white text-[12px] sm:text-[14px] font-medium mb-0.5">Allow manual linking</div>
              <div className="text-[#A1A1AA] text-[11px] sm:text-[13px]">Enable <span className="underline decoration-[#A1A1AA]">manual linking APIs</span> for your project</div>
            </div>
            <div className="w-8 h-4 bg-[#3E3E3E] rounded-full relative flex items-center shrink-0">
              <div className="w-3 h-3 bg-[#1C1C1C] rounded-full absolute left-0.5 shadow-sm"></div>
            </div>
          </div>

          {/* Item 3 (Red Bordered) */}
          <div className="p-3 sm:p-4 border-[2px] border-[#E53935] bg-[#1C1C1C] flex flex-col gap-3 relative">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white text-[12px] sm:text-[14px] font-medium mb-0.5">Allow anonymous sign-ins</div>
                <div className="text-[#A1A1AA] text-[11px] sm:text-[13px]">Enable <span className="underline decoration-[#A1A1AA]">anonymous sign-ins</span> for your project</div>
              </div>
              <div className="w-8 h-4 bg-[#24B47E] rounded-full relative flex items-center shrink-0">
                <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 shadow-sm"></div>
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-[#2A2111] border border-[#4D3A1B] rounded-md p-3 sm:p-4 flex gap-3 mt-1">
              <div className="bg-[#F5A623] w-5 h-5 rounded flex items-center justify-center text-black font-bold text-[10px] shrink-0 mt-0.5">!</div>
              <div>
                <div className="text-white text-[12px] sm:text-[13px] font-bold mb-1.5 flex flex-wrap items-center gap-1.5">
                  Anonymous users will use the <span className="bg-[#1C1C1C] border border-[#2D2D2D] px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-normal">authenticated</span> role when signing in
                </div>
                <div className="text-[#CCCCCC] text-[10.5px] sm:text-[12px] leading-relaxed max-w-[90%]">
                  As a result, anonymous users will be subjected to RLS policies that apply to the <span className="bg-[#1C1C1C] border border-[#2D2D2D] px-1 py-0.5 rounded text-[9px] font-mono">public</span> and <span className="bg-[#1C1C1C] border border-[#2D2D2D] px-1 py-0.5 rounded text-[9px] font-mono">authenticated</span> roles. We strongly advise <span className="underline text-white cursor-pointer hover:text-gray-200">reviewing your RLS policies</span> to ensure that access to your data is restricted where required.
                </div>
                <button className="mt-3 bg-[#2D2D2D] hover:bg-[#3E3E3E] text-white border border-[#3E3E3E] rounded px-3 py-1.5 text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  View access control docs
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export const Step2Visual = () => {
  return (
    <div className="w-full min-h-full bg-[#4C535A] flex items-center justify-center py-10 px-3 relative overflow-hidden">
      {/* Abstract browser/editor background elements seen in the original image */}
      <div className="absolute top-0 left-0 w-full h-6 bg-[#33373D] border-b border-[#2C3035]"></div>
      
      <div className="bg-white rounded-xl w-[95%] max-w-[320px] shadow-2xl overflow-hidden font-sans flex flex-col z-10 border border-gray-100 relative top-2">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-100">
          <div className="font-bold text-[12px] text-gray-800">Initial Setup</div>
          <X size={14} className="text-gray-400" />
        </div>

        {/* Stepper */}
        <div className="pt-4 pb-3 px-6 relative flex justify-between">
          <div className="absolute top-[26px] left-[15%] right-[15%] h-[2px] bg-gray-200 z-0"></div>
          
          <div className="flex flex-col items-center z-10 gap-1.5">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#2F81F7] text-white flex items-center justify-center border-[3px] border-white shadow-sm">
              <GithubIcon size={12} color="white" />
            </div>
            <div className="text-[7.5px] font-bold text-[#2F81F7] tracking-wider uppercase">GitHub</div>
          </div>
          
          <div className="flex flex-col items-center z-10 gap-1.5 opacity-60">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center border-[3px] border-white">
              <SupabaseIcon size={11} />
            </div>
            <div className="text-[7.5px] font-bold text-gray-500 tracking-wider uppercase">Supabase</div>
          </div>
          
          <div className="flex flex-col items-center z-10 gap-1.5 opacity-60">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center border-[3px] border-white">
              <Cpu size={12} />
            </div>
            <div className="text-[7.5px] font-bold text-gray-500 tracking-wider uppercase">Groq AI</div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 mt-2">
          <div className="flex items-start gap-2.5 mb-3">
            <div className="p-1.5 bg-[#1F2328] text-white rounded-md mt-0.5 shadow-sm">
              <GithubIcon size={16} color="white" />
            </div>
            <div>
              <div className="font-bold text-[12px] text-gray-800 mb-0.5">Connect GitHub</div>
              <div className="text-[9px] text-gray-500 leading-snug pr-2">
                Authorise RepoOwl to read Issues and PRs via GitHub OAuth. No write access is requested.
              </div>
            </div>
          </div>
          
          <button className="w-full bg-[#2F81F7] hover:bg-blue-600 text-white rounded-md py-2 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm">
            <GithubIcon size={12} color="white" />
            Connect GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export const Step3Visual = () => {
  return (
    <div className="w-full min-h-[400px] bg-white p-4 font-sans flex flex-col relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[14px] font-bold text-[#111827]">Tracked Repositories List</h2>
        <div className="flex items-center gap-1.5 cursor-pointer">
          <div className="w-3.5 h-3.5 border border-gray-400 rounded-sm"></div>
          <span className="text-[12px] text-[#374151]">Edit List</span>
        </div>
      </div>

      {/* List Container */}
      <div className="flex flex-col gap-3">
        
        {/* Item 1 */}
        <div className="border border-gray-200 rounded-lg p-3 flex flex-row items-center justify-between bg-white">
          <div className="flex flex-col min-w-0 mr-2">
            <div className="font-bold text-[12px] text-[#111827] mb-0.5 truncate">YASHK-arch/Triage-Sandbox</div>
            <div className="text-[10px] text-[#6B7280] flex items-center gap-1">
              Default Baseline Repository <Check size={10} className="text-[#10B981] ml-1" /> <span className="text-[#10B981]">Mediator Synced</span>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <div className="flex items-center gap-1 bg-[#ECFDF5] text-[#10B981] px-2 py-1 rounded-md border border-[#A7F3D0] text-[10px] font-medium whitespace-nowrap">
              <Check size={10} strokeWidth={2.5} /> Configured
            </div>
            <div className="flex items-center gap-1 bg-[#F9FAFB] text-[#374151] px-2 py-1 rounded-md border border-gray-200 text-[10px] font-medium shadow-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap">
              <RefreshCw size={10} className="text-[#3B82F6]" strokeWidth={2.5} /> Manual Sync
            </div>
            <div className="flex items-center gap-1 bg-[#6366F1] text-white px-2 py-1 rounded-md text-[10px] font-medium shadow-sm cursor-pointer hover:bg-[#4F46E5] whitespace-nowrap">
              <Settings size={10} strokeWidth={2.5} className="opacity-80" /> Re-configure
            </div>
          </div>
        </div>

        {/* Item 2 */}
        <div className="border border-gray-200 rounded-lg p-3 flex flex-row items-center justify-between bg-white">
          <div className="flex flex-col min-w-0 mr-2">
            <div className="font-bold text-[12px] text-[#111827] mb-0.5 truncate">YASHK-arch/RepoOwl-extension</div>
            <div className="text-[10px] text-[#10B981] flex items-center gap-1">
              <Check size={10} /> Mediator Synced
            </div>
          </div>
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <div className="flex items-center gap-1 bg-[#ECFDF5] text-[#10B981] px-2 py-1 rounded-md border border-[#A7F3D0] text-[10px] font-medium whitespace-nowrap">
              <Check size={10} strokeWidth={2.5} /> Configured
            </div>
            <div className="flex items-center gap-1 bg-[#F9FAFB] text-[#374151] px-2 py-1 rounded-md border border-gray-200 text-[10px] font-medium shadow-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap">
              <RefreshCw size={10} className="text-[#3B82F6]" strokeWidth={2.5} /> Manual Sync
            </div>
            <div className="flex items-center gap-1 bg-[#6366F1] text-white px-2 py-1 rounded-md text-[10px] font-medium shadow-sm cursor-pointer hover:bg-[#4F46E5] whitespace-nowrap">
              <Settings size={10} strokeWidth={2.5} className="opacity-80" /> Re-configure
            </div>
          </div>
        </div>

        {/* Item 3 */}
        <div className="border border-gray-200 rounded-lg p-3 flex flex-row items-center justify-between bg-white">
          <div className="flex flex-col min-w-0 mr-2">
            <div className="font-bold text-[12px] text-[#111827] mb-0.5 truncate">Tom-Halland/Vivid_visualization_matrix</div>
            <div className="text-[10px] text-[#10B981] flex items-center gap-1">
              <Check size={10} /> Mediator Synced
            </div>
          </div>
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <div className="flex items-center gap-1 bg-[#ECFDF5] text-[#10B981] px-2 py-1 rounded-md border border-[#A7F3D0] text-[10px] font-medium whitespace-nowrap">
              <Check size={10} strokeWidth={2.5} /> Configured
            </div>
          </div>
        </div>

        {/* Item 4 */}
        <div className="border border-gray-200 rounded-lg p-3 flex flex-row items-center justify-between bg-white">
          <div className="flex flex-col min-w-0 mr-2">
            <div className="font-bold text-[12px] text-[#111827] mb-0.5 truncate">YASHK-arch/AlgoGate</div>
            <div className="text-[10px] text-[#D97706] flex items-center gap-1">
              <AlertTriangle size={10} /> Not in Mediator
            </div>
          </div>
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <div className="flex items-center gap-1 bg-[#6366F1] text-white px-2 py-1 rounded-md text-[10px] font-medium shadow-sm cursor-pointer hover:bg-[#4F46E5] whitespace-nowrap">
              <Settings size={10} strokeWidth={2.5} className="opacity-80" /> Configure
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

