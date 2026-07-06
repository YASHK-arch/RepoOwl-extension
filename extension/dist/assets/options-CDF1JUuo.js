import{r as a,i as b,g as v,j as s,e as E,c as I}from"./client-B9wLRWKH.js";(function(){const u=document.createElement("link").relList;if(u&&u.supports&&u.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const n of e.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&o(n)}).observe(document,{childList:!0,subtree:!0});function d(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function o(t){if(t.ep)return;t.ep=!0;const e=d(t);fetch(t.href,e)}})();const p=`You are an expert open-source repository maintainer, systems triage engineer, and technical analyst. Your sole responsibility is to analyze an incoming GitHub issue, extract its core technical context, and cross-reference it against existing historical context to identify duplicate or overlapping problems.

### INCOMING ISSUE DATA
The following fields have been extracted from the newly submitted issue template:
- **Title:** {{issue.title}}
- **Bug Description:** {{issue.bug_description}}
- **Steps to Reproduce:** {{issue.steps_to_reproduce}}
- **Expected Behavior:** {{issue.expected_behavior}}

### HISTORICAL REPOSITORY CONTEXT
The following is an array of existing active or resolved issue IDs along with their previously computed summaries to check against for duplicates:
{{repository.historical_context_log}}

### ANALYSIS GUIDELINES
1. **Isolate Root Causes:** Look past superficial title similarities. Analyze underlying failure vectors like specific stack traces, rendering bottlenecks (e.g., shaders, lightmaps, textures), state machines, or edge cases in lifecycle methods.
2. **Handle Incomplete Templates:** If fields like \`steps_to_reproduce\` are empty or vague, rely strictly on the \`bug_description\` and code snippets. Do not invent missing facts; summarize only what is explicitly provided.
3. **Trace Structural Links:** Classify an issue as a duplicate ONLY if it shares the identical root execution failure or code-path break as a historical issue. If it targets a similar UI element but stems from a different underlying state failure, treat it as unique.

### OUTPUT COMPLIANCE CONTRACT
You MUST respond using a single, valid JSON object.
- Do NOT wrap the JSON inside markdown code blocks (such as \`\`\`json ... \`\`\`).
- Do NOT include any conversational introduction, sign-offs, or explanatory prose outside of the JSON keys.
- Ensure all quotes inside text strings are properly escaped to prevent parsing failures.

Your response must strictly conform to the following schema structure:
{
  "context": "Provide a crisp, 2-3 sentence highly technical summary of the core error vector, specific logs, or state failures highlighted in this incoming issue.",
  "duplicate_data": {
    "original_issue_ids": [Include integers of matching historical issue IDs here if a duplicate is confirmed. If the issue is entirely unique, leave this array completely empty.],
    "explanation": "Provide a thorough technical breakdown explaining why these issues are structurally linked or, if unique, a justification of how its technical root cause differs from existing logs."
  }
}
`;function N(){const[c,u]=a.useState(""),[d,o]=a.useState(p),[t,e]=a.useState({type:"",message:""}),[n,f]=a.useState(!1),[g,h]=a.useState(!1),y=a.useCallback(async()=>{var m;const r=c.trim();if(!r){o(p);return}if(!b()){e({type:"error",message:"Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."});return}const l=v();f(!0),e({type:"",message:""});try{const{data:i,error:S}=await l.from("repository_prompts").select("custom_prompt").eq("repository_full_name",r).maybeSingle();if(S)throw S;const T=(m=i==null?void 0:i.custom_prompt)==null?void 0:m.trim();o(T||p)}catch(i){e({type:"error",message:i.message??"Failed to load saved prompt."}),o(p)}finally{f(!1)}},[c]);a.useEffect(()=>{const r=setTimeout(()=>{y()},400);return()=>clearTimeout(r)},[y]);function x(){o(p),e({type:"success",message:"Restored the default prompt template."})}async function _(){const r=c.trim();if(!r){e({type:"error",message:"Enter a repository (owner/repo) before saving."});return}if(!b()){e({type:"error",message:"Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."});return}h(!0),e({type:"",message:""});try{const l=await E();if(l.error)throw new Error(l.error);const m=v(),{error:i}=await m.from("repository_prompts").upsert({repository_full_name:r,custom_prompt:d},{onConflict:"repository_full_name"});if(i)throw i;e({type:"success",message:`Saved prompt for ${r}.`})}catch(l){e({type:"error",message:l.message??"Failed to save prompt."})}finally{h(!1)}}return s.jsxs("div",{className:"prompt-settings",children:[s.jsx("h1",{children:"RepoOwl Prompt Settings"}),s.jsx("p",{children:"Configure repository-specific LLM analysis instructions. The background worker uses this prompt when processing issues; if none is saved, it falls back to the default template below."}),s.jsx("label",{htmlFor:"repository",children:"Repository (owner/repo)"}),s.jsx("input",{id:"repository",className:"repo-input",type:"text",placeholder:"e.g. octocat/Hello-World",value:c,onChange:r=>u(r.target.value)}),s.jsx("label",{htmlFor:"prompt-template",children:"Analysis Prompt Template"}),s.jsx("textarea",{id:"prompt-template",value:d,onChange:r=>o(r.target.value),disabled:n,spellCheck:!1}),s.jsxs("div",{className:"actions",children:[s.jsx("button",{type:"button",className:"primary",onClick:_,disabled:g||n,children:g?"Saving...":"Save Prompt"}),s.jsx("button",{type:"button",onClick:x,disabled:n,children:"Reset to Default"})]}),t.message?s.jsx("p",{className:`status ${t.type}`,children:t.message}):null]})}I.createRoot(document.getElementById("root")).render(s.jsx(a.StrictMode,{children:s.jsx(N,{})}));
