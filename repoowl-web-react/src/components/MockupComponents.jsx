import React from 'react';
import { Bot, GitMerge, FileText, CheckCircle2, ChevronRight, Check, CheckCircle, Tag, Clock, Settings, Settings2 } from 'lucide-react';

export function PRAnalysisMockup() {
  return (
    <div className="w-full h-full min-w-[700px] shrink-0 bg-[#0d1117] text-[#c9d1d9] text-[13px] font-sans overflow-hidden flex flex-col p-6 md:p-8 origin-center transition-transform duration-700 ease-out scale-[0.95] group-hover:scale-[0.98]">
      {/* GitHub Comment Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-[#238636] flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="font-semibold text-white text-[14px]">github-actions <span className="bg-[#1f6feb] text-white px-1.5 py-0.5 rounded text-[11px] ml-1 opacity-80 border border-[#1f6feb]">bot</span></div>
        <div className="text-[#8b949e] text-[13px]">commented 38 minutes ago</div>
      </div>
      
      {/* GitHub Comment Body */}
      <div className="border border-[#30363d] rounded-lg p-5 bg-[#0d1117] flex-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-[18px] font-bold text-white tracking-tight flex items-center gap-2">
            <span className="bg-[#21262d] p-1 rounded"><Bot className="w-5 h-5 text-white"/></span>
            ### RepoOwl PR Analysis
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-5 bg-[#21262d] p-1.5 px-3 rounded-md text-[13px] w-fit border border-[#30363d]">
          <span className="font-semibold text-white">Slop Badge:</span>
          <span className="bg-[#238636]/10 text-[#3fb950] border border-[#238636]/30 px-2 py-0.5 rounded-full flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Code Matches Description
          </span>
        </div>

        <p className="mb-4 text-[#c9d1d9] leading-[1.6]">
          <strong className="text-white">AI Slop Detection:</strong> The PR description precisely matches the code changes, providing a clear technical explanation of the z-index stacking fix and the duplicate filtering logic, resulting in a high-quality submission with a slop score of 5/100.
        </p>

        <p className="mb-4 text-[#c9d1d9] leading-[1.6]">
          <strong className="text-white">Issue Resolution:</strong> Yes, the code fully resolves the linked issue by correcting the z-index to enable smooth crossfade transitions and filtering the movie list to ensure unique backdrops.
        </p>

        <div className="mb-4">
          <strong className="text-white block mb-2">Domain Impact:</strong>
          <ul className="list-disc pl-5 space-y-2">
            <li className="leading-[1.6]"><code className="bg-[#6e768166] px-1.5 py-0.5 rounded text-[12px] text-white">src/components/Banner.jsx</code> : Modifies slide z-index from <code className="bg-[#6e768166] px-1.5 py-0.5 rounded text-[12px]">-z-10</code> to <code className="bg-[#6e768166] px-1.5 py-0.5 rounded text-[12px]">z-0</code> to fix transition rendering and implements a <code className="bg-[#6e768166] px-1.5 py-0.5 rounded text-[12px]">Set</code> to deduplicate backdrop URLs in the trending movies array.</li>
          </ul>
        </div>

        <p className="mb-4 text-[#c9d1d9] leading-[1.6]">
          <strong className="text-white">Breaking Changes:</strong> No. This is a visual bug fix and data deduplication that improves user experience without altering component interfaces or introducing regressions.
        </p>

        <p className="mb-5 text-[#c9d1d9] leading-[1.6]">
          <strong className="text-white">Final Verdict: Approve</strong> — The changes are minimal, targeted, and directly address the reported issues with smooth transitions and duplicate images, validated by build checks and manual verification.
        </p>

        <p className="text-[#8b949e] italic text-[12px]">
          Analyzed automatically via GitHub Actions
        </p>
      </div>

      {/* Timeline Event */}
      <div className="flex items-center gap-2 mt-5 ml-2 text-[13px]">
        <Tag className="w-4 h-4 text-[#8b949e]" />
        <span className="font-semibold text-[#c9d1d9]">github-actions</span>
        <span className="text-[#8b949e] ml-1 mr-1">bot added</span>
        <span className="bg-[#d73a4a] text-white px-2.5 py-1 rounded-full text-[11px] font-semibold">bugfix</span>
        <span className="bg-[#bfd4f2] text-black px-2.5 py-1 rounded-full text-[11px] font-semibold ml-1">repoowl-analyzed</span>
        <span className="bg-[#fbca04] text-black px-2.5 py-1 rounded-full text-[11px] font-semibold ml-1">ui</span>
        <span className="text-[#8b949e] ml-1">labels 38 minutes ago</span>
      </div>
    </div>
  );
}

export function IssueAnalysisMockup() {
  return (
    <div className="w-full h-full min-w-[750px] shrink-0 bg-[#0d1117] text-[#c9d1d9] text-[13px] font-sans flex overflow-hidden origin-center transition-transform duration-700 ease-out scale-[0.92] group-hover:scale-[0.95]">
      <div className="flex-1 p-6 border-r border-[#30363d] flex flex-col overflow-hidden">
        
        {/* Issue Title */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#238636] text-white px-3.5 py-1.5 rounded-full text-[14px] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Open
            </span>
            <h1 className="text-[22px] text-white font-medium leading-tight">bug: Issue auto-analysis pipeline silently fails — 5 root causes in analyze-issue.js + installer sync <span className="text-[#8b949e] font-normal">#125</span></h1>
          </div>
        </div>

        {/* Timeline Events */}
        <div className="flex items-center gap-2 text-[13px] mb-2 ml-5">
          <div className="w-4 h-4 border border-[#30363d] rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-[#8b949e] rounded-full" /></div>
          <span className="font-semibold text-[#c9d1d9]">github-actions</span>
          <span className="text-[#8b949e]">assigned</span>
          <span className="font-semibold text-[#c9d1d9]">YASHK-arch</span>
          <span className="text-[#8b949e]">1h ago</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] mb-6 ml-5">
          <Tag className="w-4 h-4 text-[#8b949e]" />
          <span className="font-semibold text-[#c9d1d9]">github-actions</span>
          <span className="text-[#8b949e]">added</span>
          <span className="bg-[#d73a4a] text-white px-2 py-0.5 rounded-full text-[11px] font-semibold border border-[#d73a4a]">bug</span>
          <span className="bg-[#1d76db] text-white px-2 py-0.5 rounded-full text-[11px] font-semibold ml-1 border border-[#1d76db]">github-actions</span>
          <span className="bg-[#5319e7] text-white px-2 py-0.5 rounded-full text-[11px] font-semibold ml-1 border border-[#5319e7]">installer-sync</span>
          <span className="bg-[#b60205] text-white px-2 py-0.5 rounded-full text-[11px] font-semibold ml-1 border border-[#b60205]">pipeline-reliability</span>
          <span className="text-[#8b949e]">1h ago</span>
        </div>

        {/* Comment */}
        <div className="border border-[#30363d] rounded-lg bg-[#0d1117] flex-1 overflow-hidden flex flex-col relative before:absolute before:-left-[17px] before:top-4 before:w-3 before:h-3 before:bg-[#0d1117] before:border-l before:border-b before:border-[#30363d] before:rotate-45 ml-8">
           {/* Avatar outside */}
           <div className="absolute -left-12 top-2 w-8 h-8 rounded-full bg-[#238636] border-[2px] border-[#0d1117] flex items-center justify-center z-10">
              <Bot className="w-5 h-5 text-white" />
           </div>

          <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex items-center gap-2">
            <span className="font-semibold text-white">github-actions</span>
            <span className="bg-[#1f6feb] text-white px-1.5 py-0.5 rounded text-[10px] ml-1 opacity-80 border border-[#1f6feb]">bot</span>
            <span className="text-[#8b949e] text-[13px] ml-1">1h ago • with <span className="text-[#58a6ff]">GitHub Actions</span></span>
          </div>
          <div className="p-5 flex-1">
            <h3 className="text-white text-[16px] font-bold mb-4 flex items-center gap-2">
              <span className="bg-[#30363d] p-1 rounded"><Bot className="w-4 h-4 text-white"/></span> RepoOwl Issue Analysis
            </h3>
            <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-4 font-mono text-[13px] text-[#e6edf3] leading-[1.6]">
<pre className="whitespace-pre-wrap">
<span className="text-[#79c0ff]">is_duplicate:</span> <span className="text-[#ff7b72]">false</span>
<span className="text-[#79c0ff]">analysis_summary:</span> |
  This issue documents and resolves a silent failure in the issue auto analysis pipeline caused by prompt corruption, unhandled Groq API rate limits, and missing installer sync triggers.
<span className="text-[#79c0ff]">contextual_labels:</span>
  - pipeline-reliability
  - github-actions
  - installer-sync
<span className="text-[#79c0ff]">affected_files:</span>
  - .github/scripts/analyze-issue.js
  - extension/src/background/githubInstaller.js
  - .github/workflows/issue-analyze.yml
  - .github/workflows/repoowl-analyze.yml
</pre>
            </div>
          </div>
        </div>

      </div>
      
      {/* Sidebar */}
      <div className="w-[240px] bg-[#0d1117] p-5 text-[13px] flex flex-col gap-5">
        <div>
          <div className="font-semibold text-[#8b949e] mb-3 flex items-center justify-between">Labels <Settings2 className="w-4 h-4 hover:text-[#58a6ff] cursor-pointer transition-colors" /></div>
          <div className="flex flex-col gap-2">
            <span className="bg-[#d73a4a] text-white px-2.5 py-1 rounded-full text-[12px] font-medium w-fit border border-[#d73a4a]">bug</span>
            <span className="bg-[#1d76db] text-white px-2.5 py-1 rounded-full text-[12px] font-medium w-fit border border-[#1d76db]">github-actions</span>
            <span className="bg-[#5319e7] text-white px-2.5 py-1 rounded-full text-[12px] font-medium w-fit border border-[#5319e7]">installer-sync</span>
            <span className="bg-[#b60205] text-white px-2.5 py-1 rounded-full text-[12px] font-medium w-fit border border-[#b60205]">pipeline-reliability</span>
          </div>
        </div>
        <div className="pt-4 border-t border-[#30363d]">
          <div className="font-semibold text-[#8b949e] mb-2 flex items-center justify-between">Projects <Settings2 className="w-4 h-4 hover:text-[#58a6ff] cursor-pointer transition-colors" /></div>
          <div className="text-[#c9d1d9]">No projects</div>
        </div>
        <div className="pt-4 border-t border-[#30363d]">
          <div className="font-semibold text-[#8b949e] mb-2 flex items-center justify-between">Milestone <Settings2 className="w-4 h-4 hover:text-[#58a6ff] cursor-pointer transition-colors" /></div>
          <div className="text-[#c9d1d9]">No milestone</div>
        </div>
        <div className="pt-4 border-t border-[#30363d]">
          <div className="font-semibold text-[#8b949e] mb-2 flex items-center justify-between">Development <Settings2 className="w-4 h-4 hover:text-[#58a6ff] cursor-pointer transition-colors" /></div>
          <div className="text-[#58a6ff] font-medium cursor-pointer hover:underline">Create a branch</div>
          <div className="text-[#8b949e] text-[12px] mt-1">for this issue or link a pull request.</div>
        </div>
      </div>
    </div>
  );
}

export function LiveSyncMockup() {
  return (
    <div className="w-full min-w-[750px] shrink-0 bg-[#0d1117] text-[#c9d1d9] text-[14px] font-sans flex overflow-hidden rounded-t-xl origin-top transition-transform duration-700 ease-out scale-[0.90] group-hover:scale-[0.93]">
      <div className="w-[220px] bg-[#010409] border-r border-[#30363d] p-4 flex flex-col gap-2">
        <div className="p-2.5 rounded-lg hover:bg-[#161b22] cursor-pointer transition-colors">
          <div className="font-semibold text-[13px] mb-0.5 text-[#c9d1d9]">Summary Preferences</div>
          <div className="text-[12px] text-[#8b949e] leading-tight">Tune language, detail level, and prompt templates.</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#1f6feb]/10 border-l-[3px] border-[#58a6ff] cursor-pointer">
          <div className="font-semibold text-[13px] text-[#58a6ff] mb-0.5 -ml-0.5">Tracked Repositories</div>
          <div className="text-[12px] text-[#8b949e] leading-tight">Manage which repositories are actively analyzed.</div>
        </div>
        <div className="p-2.5 rounded-lg hover:bg-[#161b22] cursor-pointer transition-colors">
          <div className="font-semibold text-[13px] mb-0.5 text-[#c9d1d9]">Auto-Triage Rules</div>
          <div className="text-[12px] text-[#8b949e] leading-tight">Configure spam thresholds, duplicate detection...</div>
        </div>
      </div>
      <div className="flex-1 bg-[#0d1117] p-5">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3 mb-4">
          <h2 className="text-[18px] font-semibold text-[#e6edf3]">Tracked Repositories List</h2>
          <button className="text-[13px] border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] px-3 py-1.5 rounded-md font-medium text-[#c9d1d9] transition-colors">
             <div className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5"/> Edit List</div>
          </button>
        </div>
        
        <div className="border border-[#30363d] rounded-lg p-4 mb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-[#161b22] transition-colors bg-[#0d1117]">
          <div className="flex-1 min-w-0 pr-2">
            <div className="font-semibold text-[15px] mb-1 text-[#e6edf3] break-all">YASHK-arch/Triage-Sandbox</div>
            <div className="text-[12px] text-[#8b949e] flex items-center gap-1.5 mt-1 flex-wrap">
              Default Baseline Repository <Check className="w-3.5 h-3.5 text-[#3fb950]" /> Mediator Synced
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-start md:justify-end shrink-0">
             <span className="bg-[#238636]/10 text-[#3fb950] border border-[#238636]/30 px-2.5 py-1 rounded-md text-[13px] flex items-center gap-1.5 font-medium"><Check className="w-3.5 h-3.5"/> Configured</span>
             <button className="bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] px-2.5 py-1 rounded-md text-[13px] flex items-center gap-1.5 font-medium shadow-sm transition-colors text-[#c9d1d9]"><Clock className="w-3.5 h-3.5"/> Manual Sync</button>
             <button className="bg-[#8250df]/90 text-white hover:bg-[#6e40c9] px-2.5 py-1 rounded-md text-[13px] flex items-center gap-1.5 font-medium shadow-sm transition-colors border border-[#8250df]/50"><Settings className="w-3.5 h-3.5"/> Re-configure</button>
          </div>
        </div>

        <div className="border border-[#30363d] rounded-lg p-4 mb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-[#161b22] transition-colors bg-[#0d1117]">
          <div className="flex-1 min-w-0 pr-2">
            <div className="font-semibold text-[15px] mb-1 text-[#e6edf3] break-all">YASHK-arch/RepoOwl-extension</div>
            <div className="text-[12px] text-[#8b949e] flex items-center gap-1.5 mt-1 flex-wrap">
              <Check className="w-3.5 h-3.5 text-[#3fb950]" /> Mediator Synced
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-start md:justify-end shrink-0">
             <span className="bg-[#238636]/10 text-[#3fb950] border border-[#238636]/30 px-2.5 py-1 rounded-md text-[13px] flex items-center gap-1.5 font-medium"><Check className="w-3.5 h-3.5"/> Configured</span>
             <button className="bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] px-2.5 py-1 rounded-md text-[13px] flex items-center gap-1.5 font-medium shadow-sm transition-colors text-[#c9d1d9]"><Clock className="w-3.5 h-3.5"/> Manual Sync</button>
             <button className="bg-[#8250df]/90 text-white hover:bg-[#6e40c9] px-2.5 py-1 rounded-md text-[13px] flex items-center gap-1.5 font-medium shadow-sm transition-colors border border-[#8250df]/50"><Settings className="w-3.5 h-3.5"/> Re-configure</button>
          </div>
        </div>

        <div className="border border-[#30363d] rounded-lg p-4 mb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-colors bg-[#0d1117] opacity-60">
          <div className="flex-1 min-w-0 pr-2">
            <div className="font-semibold text-[15px] mb-1 text-[#e6edf3] break-all">Tom-Halland/Vivid_visualization_matrix</div>
            <div className="text-[12px] text-[#8b949e] flex items-center gap-1.5 mt-1 flex-wrap">
              <Check className="w-3.5 h-3.5 text-[#3fb950]" /> Mediator Synced
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-start md:justify-end shrink-0">
             <span className="bg-[#238636]/10 text-[#3fb950] border border-[#238636]/30 px-2.5 py-1 rounded-md text-[13px] flex items-center gap-1.5 font-medium opacity-70"><Check className="w-3.5 h-3.5"/> Configured</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export function PathLabelingMockup() {
  const rules = [
    { path: 'src/backend/uitls/', label: 'bknd-utils', color: 'bg-[#4F46E5]', textCol: 'text-white' },
    { path: 'src/backend/scripts/', label: 'bknd-scripts', color: 'bg-[#22C55E]', textCol: 'text-white' },
    { path: 'app.jsx', label: 'main', color: 'bg-[#C2410C]', textCol: 'text-white' },
    { path: 'docs/', label: 'documentation', color: 'bg-black', textCol: 'text-white' },
    { path: 'settings/', label: 'settings', color: 'bg-[#BFDBFE]', textCol: 'text-black' },
    { path: 'extension/', label: 'extension', color: 'bg-[#3B82F6]', textCol: 'text-white' },
    { path: 'repowl-web-react/', label: 'landing-page', color: 'bg-[#2563EB]', textCol: 'text-white' },
  ];

  return (
    <div className="w-full h-full min-w-[750px] shrink-0 bg-[#0d1117] text-[#c9d1d9] text-[14px] font-sans flex flex-col p-5 md:p-6">
      {/* Top Label & Title */}
      <div className="mb-3">
        <span className="bg-[#1f6feb]/10 text-[#58a6ff] px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-1 inline-block">Smart Routing</span>
        <h2 className="text-[24px] font-bold text-[#e6edf3] mt-0.5">Triage & Label Rules</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-5 border-b border-[#30363d] mb-4">
        <div className="pb-1.5 text-[#8b949e] text-[14px] font-medium cursor-pointer">Smart Triage Config</div>
        <div className="pb-1.5 text-[#e6edf3] text-[14px] font-bold border-b-[3px] border-[#58a6ff] cursor-pointer">Label Rules</div>
      </div>

      {/* Description */}
      <p className="text-[13px] text-[#8b949e] mb-4 leading-relaxed max-w-4xl">
        <strong className="text-[#e6edf3]">Maintainers Only:</strong> Map folder paths to GitHub labels. When a PR touches a matching file, the label is applied automatically with the specified hex color.
      </p>

      {/* Main Box */}
      <div className="border border-[#30363d] rounded-lg bg-[#0d1117] overflow-hidden mb-4">
        {/* Header */}
        <div className="px-4 py-2.5 flex items-start justify-between bg-[#161b22] border-b border-[#30363d]">
          <div>
            <div className="font-bold text-[14px] text-[#e6edf3]">YASHK-arch/Triage-Sandbox</div>
            <div className="text-[12px] text-[#8b949e] mt-0.5">7 rules defined</div>
          </div>
          <div className="text-[12px] text-[#8b949e] flex items-center gap-1 cursor-pointer font-medium mt-1 hover:text-[#c9d1d9]">
            ▼ Collapse
          </div>
        </div>

        {/* Rows */}
        <div className="flex flex-col bg-[#0d1117]">
          {rules.map((rule, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-1.5 border-b border-[#30363d] last:border-b-0 hover:bg-[#161b22] transition-colors">
              <div className="font-mono text-[12px] text-[#c9d1d9]">{rule.path}</div>
              <div className="flex items-center gap-3">
                <span className="text-[#8b949e] text-[11px]">→</span>
                <div className="flex items-center gap-2 border border-[#30363d] rounded-full pl-1.5 pr-2.5 py-0.5 bg-[#0d1117] shadow-sm h-6">
                  <div className={`w-3 h-3 rounded-full ${rule.color}`}></div>
                  <span className="text-[11px] font-bold text-[#e6edf3]">{rule.label}</span>
                </div>
                <span className="text-[#f85149] text-[15px] font-medium cursor-pointer hover:text-[#ff7b72] px-1 -mt-0.5">×</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Input Area */}
        <div className="p-2.5 bg-[#161b22] border-t border-[#30363d] flex items-center gap-2">
          <input type="text" placeholder="Path (e.g. src/)" className="flex-1 text-[12px] px-2.5 py-1.5 border border-[#30363d] rounded focus:outline-none focus:border-[#58a6ff] bg-[#0d1117] text-[#e6edf3] placeholder-[#8b949e]" />
          <input type="text" placeholder="Label name" className="flex-1 text-[12px] px-2.5 py-1.5 border border-[#30363d] rounded focus:outline-none focus:border-[#58a6ff] bg-[#0d1117] text-[#e6edf3] placeholder-[#8b949e]" />
          <div className="flex items-center gap-2 border border-[#30363d] rounded px-2 py-1.5 bg-[#0d1117] shrink-0">
            <span className="text-[12px] text-[#8b949e] font-medium">Color</span>
            <div className="w-4 h-3 bg-[#3B82F6] rounded-sm ml-0.5"></div>
          </div>
          <button className="bg-[#21262d] border border-[#30363d] rounded px-3 py-1.5 text-[12px] font-bold text-[#c9d1d9] hover:bg-[#30363d] shrink-0">+ Add</button>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-auto flex">
        <button className="bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded-md shadow-sm text-[13px] font-bold flex items-center gap-1.5 transition-colors border border-[#238636]">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          Save Label Rules
        </button>
      </div>
    </div>
  );
}
