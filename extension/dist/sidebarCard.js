(function(){"use strict";const c="repoowl-sidebar-card";async function g(){var o,s;let e="",t="";if(typeof chrome<"u"&&chrome.storage){const r=await new Promise(a=>chrome.storage.local.get(["repoOwlConfig"],a));(o=r.repoOwlConfig)!=null&&o.supabaseUrl&&((s=r.repoOwlConfig)!=null&&s.supabaseAnonKey)&&(e=r.repoOwlConfig.supabaseUrl,t=r.repoOwlConfig.supabaseAnonKey)}return{supabaseUrl:e,supabaseAnonKey:t}}const m=`
#repoowl-sidebar-card {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid var(--color-border-default, #d0d7de);
  border-radius: 6px;
  background: var(--color-canvas-default, #ffffff);
}
.ro-sc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.ro-sc-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-fg-default, #1f2328);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ro-sc-title svg {
  color: var(--color-accent-fg, #0969da);
  flex-shrink: 0;
}
.ro-sc-badge-active {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 20px;
  background: var(--color-success-subtle, #dafbe1);
  color: var(--color-success-fg, #1a7f37);
  border: 1px solid var(--color-success-muted, #a7d7b0);
}
.ro-sc-badge-pending {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 20px;
  background: var(--color-attention-subtle, #fff8c5);
  color: var(--color-attention-fg, #9a6700);
  border: 1px solid var(--color-attention-muted, #d4a72c);
}
.ro-sc-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.ro-sc-stat {
  flex: 1;
  background: var(--color-canvas-subtle, #f6f8fa);
  border: 1px solid var(--color-border-default, #d0d7de);
  border-radius: 6px;
  padding: 8px 6px;
  text-align: center;
}
.ro-sc-stat-num {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-fg-default, #1f2328);
  line-height: 1.2;
  display: block;
}
.ro-sc-stat-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-fg-muted, #656d76);
  margin-top: 2px;
  display: block;
}
.ro-sc-meta {
  font-size: 10px;
  color: var(--color-fg-muted, #656d76);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
}
.ro-sc-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success-fg, #1a7f37);
  flex-shrink: 0;
  display: inline-block;
  animation: ro-pulse 2s ease-in-out infinite;
}
@keyframes ro-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.ro-sc-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border-default, #d0d7de);
  background: var(--color-canvas-default, #ffffff);
  color: var(--color-fg-default, #1f2328);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  box-sizing: border-box;
  transition: background 0.12s;
}
.ro-sc-link:hover {
  background: var(--color-canvas-subtle, #f6f8fa);
  text-decoration: none;
  color: var(--color-fg-default, #1f2328);
}
.ro-sc-empty {
  font-size: 11px;
  color: var(--color-fg-muted, #656d76);
  text-align: center;
  padding: 6px 0 10px;
}
`;function b(){const e=window.location.pathname.match(/^\/([^/]+)\/([^/]+)\/?$/);return!e||["login","signup","explore","topics","trending","marketplace","settings","notifications","dashboard"].includes(e[1].toLowerCase())||["orgs","apps","marketplace"].includes(e[2].toLowerCase())?null:`${e[1]}/${e[2]}`}async function x(e,t){if(!t.supabaseUrl||!t.supabaseAnonKey)return null;const o=`${t.supabaseUrl}/rest/v1/public_ecosystem_registry?select=total_issues_analyzed,duplicates_found&repo_name=eq.${encodeURIComponent(e)}&limit=1`;try{const s=await fetch(o,{headers:{apikey:t.supabaseAnonKey,Authorization:`Bearer ${t.supabaseAnonKey}`}});if(!s.ok)return null;const r=await s.json();if(!r||r.length===0)return{total:0,processed:0,duplicates:0};const a=r[0].total_issues_analyzed||0,n=r[0].duplicates_found||0;return{total:a,processed:a,duplicates:n}}catch{return null}}function p(){const e=document.querySelector('[data-component="PageLayout.Pane"]');if(e){const o=e.querySelector(".BorderGrid");if(o&&o.firstElementChild)return{grid:o,firstRow:o.firstElementChild}}const t=document.querySelector(".Layout-sidebar .BorderGrid");return t&&t.firstElementChild?{grid:t,firstRow:t.firstElementChild}:null}function v(e,t,o){const s=typeof chrome<"u"&&chrome.runtime?chrome.runtime.getURL("src/options/index.html"):"#",r=!!(o.supabaseUrl&&o.supabaseAnonKey);let a;!r||e===null?a=`<div class="ro-sc-empty">${r?"Connecting to RepoOwl…":"Configure RepoOwl to see insights."}</div>`:e.total===0?a='<div class="ro-sc-empty">No issues tracked yet. Run the worker to begin.</div>':a=`
      <div class="ro-sc-stats">
        <div class="ro-sc-stat">
          <span class="ro-sc-stat-num">${e.processed}</span>
          <span class="ro-sc-stat-label">Analysed</span>
        </div>
        <div class="ro-sc-stat">
          <span class="ro-sc-stat-num">${e.duplicates}</span>
          <span class="ro-sc-stat-label">Duplicates</span>
        </div>
        <div class="ro-sc-stat">
          <span class="ro-sc-stat-num">${e.total}</span>
          <span class="ro-sc-stat-label">Total</span>
        </div>
      </div>
      <div class="ro-sc-meta">
        <span class="ro-sc-dot"></span>
        Groq LLaMA 3.3 · ${t}
      </div>
    `;const n=e!==null&&r?'<span class="ro-sc-badge-active">Active</span>':'<span class="ro-sc-badge-pending">Setup needed</span>',d=document.createElement("div");return d.id=c,d.innerHTML=`
    <style>${m}</style>
    <div class="ro-sc-header">
      <div class="ro-sc-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
        </svg>
        RepoOwl
      </div>
      ${n}
    </div>
    ${a}
    <a href="${s}" target="_blank" rel="noreferrer" class="ro-sc-link">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.429 1.525a6.593 6.593 0 0 1 1.142 0c.036.003.108.036.137.146l.289 1.105c.147.56.55.967.997 1.189.174.086.341.18.502.28.433.268.97.268 1.392.008l.938-.538c.098-.056.171-.06.207-.038a6.673 6.673 0 0 1 .57.498c.02.017.168.14.068.278l-.642.87a1.576 1.576 0 0 0-.173 1.463c.13.414.13.866 0 1.28a1.576 1.576 0 0 0 .173 1.463l.642.87c.1.138-.048.26-.068.278a6.662 6.662 0 0 1-.57.498.207.207 0 0 1-.207-.038l-.938-.538c-.422-.26-.959-.26-1.392.008a5.073 5.073 0 0 1-.502.28c-.447.222-.85.629-.997 1.189l-.289 1.105c-.029.11-.101.143-.137.146a6.593 6.593 0 0 1-1.142 0c-.036-.003-.108-.036-.137-.146l-.289-1.105c-.147-.56-.55-.967-.997-1.189a5.082 5.082 0 0 1-.502-.28c-.433-.268-.97-.268-1.392-.008l-.938.538a.207.207 0 0 1-.207.038 6.679 6.679 0 0 1-.57-.498c-.02-.018-.168-.14-.068-.278l.642-.87a1.576 1.576 0 0 0 .173-1.463 4.575 4.575 0 0 1 0-1.28 1.576 1.576 0 0 0-.173-1.463l-.642-.87c-.1-.138.048-.26.068-.278.185-.163.374-.315.57-.498a.207.207 0 0 1 .207.038l.938.538c.422.26.959.26 1.392-.008.161-.1.328-.194.502-.28.447-.222.85-.629.997-1.189l.289-1.105c.029-.11.101-.143.137-.146zM8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>
      </svg>
      Settings &amp; Insights →
    </a>
  `,d}async function h(e,t,o){if(document.getElementById(c))return;const s=p();if(!s)return;const r=v(t,e,o),a=document.createElement("div");a.className="BorderGrid-row",a.style.cssText="border-top: none !important;";const n=document.createElement("div");n.className="BorderGrid-cell",n.appendChild(r),a.appendChild(n),s.grid.insertBefore(a,s.firstRow)}let i=0;const y=20,w=250;async function l(e,t,o){if(document.getElementById(c)||i>=y)return;if(i++,!p()){setTimeout(()=>l(e,t,o),w);return}await h(e,t,o)}async function u(){var r;const e=b();if(!e)return;const t=await g();i=0,l(e,null,t);const o=await x(e,t),s=document.getElementById(c);s&&((r=s.closest(".BorderGrid-row"))==null||r.remove()),i=0,l(e,o,t)}let f=window.location.pathname;new MutationObserver(()=>{var t;const e=window.location.pathname;if(e!==f){f=e;const o=document.getElementById(c);o&&((t=o.closest(".BorderGrid-row"))==null||t.remove()),u()}}).observe(document.body,{childList:!0,subtree:!0}),u()})();
