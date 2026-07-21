(function(){var e=`repoowl-sidebar-card`;async function t(){let e=`https://sdgazpgnenkammrlhjel.supabase.co`,t=`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2F6cGduZW5rYW1tcmxoamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Njc0NjksImV4cCI6MjA5OTI0MzQ2OX0.BLL0bYxbYH8-hIe1BFErCvpWbdirjvAWh9t3sw7od3I`;if(typeof chrome<`u`&&chrome.storage){let n=await new Promise(e=>chrome.storage.local.get([`repoOwlConfig`],e));n.repoOwlConfig?.supabaseUrl&&n.repoOwlConfig?.supabaseAnonKey&&(e=n.repoOwlConfig.supabaseUrl,t=n.repoOwlConfig.supabaseAnonKey)}return{supabaseUrl:e,supabaseAnonKey:t}}function n(){let e=window.location.pathname.match(/^\/([^/]+)\/([^/]+)\/?$/);return!e||[`login`,`signup`,`explore`,`topics`,`trending`,`marketplace`,`settings`,`notifications`,`dashboard`].includes(e[1].toLowerCase())||[`orgs`,`apps`,`marketplace`].includes(e[2].toLowerCase())?null:`${e[1]}/${e[2]}`}async function r(e,t){if(!t.supabaseUrl||!t.supabaseAnonKey)return null;let n=`${t.supabaseUrl}/rest/v1/public_ecosystem_registry?select=total_issues_analyzed,duplicates_found&repo_name=eq.${encodeURIComponent(e)}&limit=1`;try{let e=await fetch(n,{headers:{apikey:t.supabaseAnonKey,Authorization:`Bearer ${t.supabaseAnonKey}`}});if(!e.ok)return null;let r=await e.json();if(!r||r.length===0)return{total:0,processed:0,duplicates:0};let i=r[0].total_issues_analyzed||0;return{total:i,processed:i,duplicates:r[0].duplicates_found||0}}catch{return null}}function i(){let e=Array.from(document.querySelectorAll(`h2`)).find(e=>e?.textContent?.trim()===`About`);if(e){let t=e.closest(`.BorderGrid-row`);if(t&&t.parentElement)return{grid:t.parentElement,firstRow:t};if(e.parentElement&&e.parentElement.parentElement)return{grid:e.parentElement.parentElement,firstRow:e.parentElement}}let t=document.querySelector(`[data-component="PageLayout.Pane"]`);if(t){let e=t.querySelector(`.BorderGrid`);if(e&&e.firstElementChild)return{grid:e,firstRow:e.firstElementChild}}let n=document.querySelector(`.Layout-sidebar .BorderGrid`);return n&&n.firstElementChild?{grid:n,firstRow:n.firstElementChild}:null}function a(t,n,r){let i=!!(r.supabaseUrl&&r.supabaseAnonKey),a;a=!i||t===null?`<div class="ro-sc-empty">${i?`Connecting to RepoOwl…`:`Configure RepoOwl to see insights.`}</div>`:t.total===0?`<div class="ro-sc-empty">No issues tracked yet. Run the worker to begin.</div>`:`
      <div class="ro-sc-stats">
        <div class="ro-sc-stat">
          <span class="ro-sc-stat-num">${t.processed}</span>
          <span class="ro-sc-stat-label">Analysed</span>
        </div>
        <div class="ro-sc-stat">
          <span class="ro-sc-stat-num">${t.duplicates}</span>
          <span class="ro-sc-stat-label">Duplicates</span>
        </div>
        <div class="ro-sc-stat">
          <span class="ro-sc-stat-num">${t.total}</span>
          <span class="ro-sc-stat-label">Total</span>
        </div>
      </div>
      <div class="ro-sc-meta">
        <span class="ro-sc-dot"></span>
        Groq LLaMA 3.3 · ${n}
      </div>
    `;let o=t!==null&&i?`<span class="ro-sc-badge-active">Active</span>`:`<span class="ro-sc-badge-pending">Setup needed</span>`,s=document.createElement(`div`);s.id=e,s.innerHTML=`
    <style>
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
</style>
    <div class="ro-sc-header">
      <div class="ro-sc-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
        </svg>
        RepoOwl
      </div>
      ${o}
    </div>
    ${a}
    <a href="#" class="ro-sc-link ro-sc-settings-btn">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.429 1.525a6.593 6.593 0 0 1 1.142 0c.036.003.108.036.137.146l.289 1.105c.147.56.55.967.997 1.189.174.086.341.18.502.28.433.268.97.268 1.392.008l.938-.538c.098-.056.171-.06.207-.038a6.673 6.673 0 0 1 .57.498c.02.017.168.14.068.278l-.642.87a1.576 1.576 0 0 0-.173 1.463c.13.414.13.866 0 1.28a1.576 1.576 0 0 0 .173 1.463l.642.87c.1.138-.048.26-.068.278a6.662 6.662 0 0 1-.57.498.207.207 0 0 1-.207-.038l-.938-.538c-.422-.26-.959-.26-1.392.008a5.073 5.073 0 0 1-.502.28c-.447.222-.85.629-.997 1.189l-.289 1.105c-.029.11-.101.143-.137.146a6.593 6.593 0 0 1-1.142 0c-.036-.003-.108-.036-.137-.146l-.289-1.105c-.147-.56-.55-.967-.997-1.189a5.082 5.082 0 0 1-.502-.28c-.433-.268-.97-.268-1.392-.008l-.938.538a.207.207 0 0 1-.207.038 6.679 6.679 0 0 1-.57-.498c-.02-.018-.168-.14-.068-.278l.642-.87a1.576 1.576 0 0 0 .173-1.463 4.575 4.575 0 0 1 0-1.28 1.576 1.576 0 0 0-.173-1.463l-.642-.87c-.1-.138.048-.26.068-.278.185-.163.374-.315.57-.498a.207.207 0 0 1 .207.038l.938.538c.422.26.959.26 1.392-.008.161-.1.328-.194.502-.28.447-.222.85-.629.997-1.189l.289-1.105c.029-.11.101-.143.137-.146zM8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>
      </svg>
      Settings &amp; Insights &rarr;
    </a>
  `;let c=s.querySelector(`.ro-sc-settings-btn`);return c&&typeof chrome<`u`&&chrome.runtime&&c.addEventListener(`click`,e=>{e.preventDefault(),chrome.runtime.sendMessage({action:`open_settings`})}),s}async function o(t,n,r){if(document.getElementById(e))return;let o=i();if(!o)return;let s=a(n,t,r),c=document.createElement(`div`);c.className=`BorderGrid-row`,c.style.cssText=`border-top: none !important;`;let l=document.createElement(`div`);l.className=`BorderGrid-cell`,l.appendChild(s),c.appendChild(l),o.grid.insertBefore(c,o.firstRow)}var s=0;async function c(t,n,r){if(!document.getElementById(e)&&!(s>=20)){if(s++,!i()){setTimeout(()=>c(t,n,r),250);return}await o(t,n,r)}}async function l(){let i=n();if(!i)return;let a=await t();s=0,c(i,null,a);let o=await r(i,a),l=document.getElementById(e);l&&l.closest(`.BorderGrid-row`)?.remove(),s=0,c(i,o,a)}var u=window.location.pathname;new MutationObserver(()=>{let t=window.location.pathname;if(t!==u){u=t;let n=document.getElementById(e);n&&n.closest(`.BorderGrid-row`)?.remove(),l()}}).observe(document.body,{childList:!0,subtree:!0}),l()})();