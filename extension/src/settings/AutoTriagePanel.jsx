import { useState, useEffect, useCallback } from 'react';

const DEFAULT_CONFIG = {
  repo_context: '',
  needs_triage_threshold: 50,
  auto_close_threshold: 90,
  prompt_injection_guard: true,
  possible_duplicate_threshold: 60,
  close_duplicate_threshold: 90,
};

const STORAGE_KEY = 'repoOwlTriageConfig';

export function AutoTriagePanel() {
  const [activeSubTab, setActiveSubTab] = useState('triage'); // 'triage' | 'labels'
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [targetRepo, setTargetRepo] = useState('');
  const [repos, setRepos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // --- Label Rules State ---
  const [pathLabels, setPathLabels] = useState({});
  const [expandedRules, setExpandedRules] = useState({});
  const [savingLabels, setSavingLabels] = useState(null);
  const [labelSaveStatus, setLabelSaveStatus] = useState({});
  const [newRuleDraft, setNewRuleDraft] = useState({});

  const fetchPathLabels = useCallback(async (repo) => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    const storage = await new Promise(res => chrome.storage.local.get(['repoOwlConfig'], res));
    const pat = storage.repoOwlConfig?.githubToken;
    if (!pat) return;

    try {
      const res = await fetch(
        `https://api.github.com/repos/${repo}/contents/repoowl.json?ref=main&t=${Date.now()}`,
        { headers: { 'Authorization': `Bearer ${pat}`, 'Accept': 'application/vnd.github+json' } }
      );
      if (!res.ok) return;
      const fileData = await res.json();
      const configData = JSON.parse(atob(fileData.content.replace(/\n/g, '')));
      
      const rules = [];
      if (configData.path_labels) {
        for (const [path, val] of Object.entries(configData.path_labels)) {
          if (typeof val === 'string') {
            rules.push({ path, label: val, color: '#0969da' });
          } else {
            rules.push({ path, label: val.label, color: val.color || '#0969da' });
          }
        }
      }
      setPathLabels(prev => ({ ...prev, [repo]: rules }));
    } catch (e) {
      setPathLabels(prev => ({ ...prev, [repo]: prev[repo] ?? [] }));
    }
  }, []);

  // Load tracked repos for the target selector
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['trackedRepositories', STORAGE_KEY], (result) => {
        const tracked = result.trackedRepositories || [];
        setRepos(tracked);
        if (tracked.length > 0) {
          setTargetRepo(tracked[0]);
          tracked.forEach(fetchPathLabels);
        }

        // Restore saved config
        if (result[STORAGE_KEY]) {
          setConfig(prev => ({ ...prev, ...result[STORAGE_KEY] }));
        }
      });
    }
  }, [fetchPathLabels]);

  const updateField = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!targetRepo) {
      setStatus({ type: 'error', message: 'Please select a target repository.' });
      return;
    }
    setSaving(true);
    setStatus({ type: '', message: '' });

    // Persist locally
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [STORAGE_KEY]: config });
    }

    // Push to repoowl.json on GitHub
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage(
        { action: 'save_triage_config', repoName: targetRepo, triageConfig: config },
        (response) => {
          setSaving(false);
          if (response && response.success) {
            setStatus({ type: 'success', message: `Triage config saved to ${targetRepo}/repoowl.json ✓` });
          } else {
            setStatus({ type: 'error', message: response?.error || 'Failed to save config.' });
          }
        }
      );
    } else {
      setSaving(false);
      setStatus({ type: 'success', message: 'Config saved locally (not in extension environment).' });
    }
  };

  // --- Label Rules Handlers ---
  const handleAddRule = (repo) => {
    const draft = newRuleDraft[repo] || { path: '', label: '', color: '#0969da' };
    if (!draft.path.trim() || !draft.label.trim()) return;
    setPathLabels(prev => ({
      ...prev,
      [repo]: [...(prev[repo] || []), { path: draft.path.trim(), label: draft.label.trim(), color: draft.color }]
    }));
    setNewRuleDraft(prev => ({ ...prev, [repo]: { path: '', label: '', color: '#0969da' } }));
  };

  const handleRemoveRule = (repo, index) => {
    setPathLabels(prev => ({
      ...prev,
      [repo]: (prev[repo] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSaveRules = (repo) => {
    setSavingLabels(repo);
    setLabelSaveStatus(prev => ({ ...prev, [repo]: null }));
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage(
        { action: 'save_path_labels', repoName: repo, pathLabels: pathLabels[repo] || [] },
        (response) => {
          setSavingLabels(null);
          if (response && response.success) {
            setLabelSaveStatus(prev => ({ ...prev, [repo]: { type: 'success', message: 'Rules saved to repoowl.json ✓' } }));
          } else {
            setLabelSaveStatus(prev => ({ ...prev, [repo]: { type: 'error', message: response?.error || 'Failed to save rules.' } }));
          }
        }
      );
    } else {
      setSavingLabels(null);
      setLabelSaveStatus(prev => ({ ...prev, [repo]: { type: 'error', message: 'Not in extension environment.' } }));
    }
  };

  // ── Shared styles ────────────────────────────────────────────────────────
  const cardStyle = {
    border: '1px solid #d0d7de',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: '#ffffff'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#24292f',
    marginBottom: '6px'
  };

  const descStyle = {
    fontSize: '12px',
    color: '#57606a',
    marginBottom: '10px',
    lineHeight: '1.5'
  };

  const sliderRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  };

  const badgeStyle = (color) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '2em',
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: color === 'red' ? '#ffebe9' : color === 'yellow' ? '#fff8c5' : '#dafbe1',
    color: color === 'red' ? '#cf222e' : color === 'yellow' ? '#9a6700' : '#1a7f37',
    border: `1px solid ${color === 'red' ? '#ffc1c0' : color === 'yellow' ? '#e3b341' : '#82e298'}`
  });

  return (
    <>
      <div className="ro-panel-badge">Smart Routing</div>
      <h1 className="ro-panel-title">Triage & Label Rules</h1>
      
      {/* ── Sub-navigation ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #d0d7de',
        marginBottom: '20px',
        gap: '20px'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('triage')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeSubTab === 'triage' ? '2px solid #0969da' : '2px solid transparent',
            padding: '8px 4px',
            fontSize: '14px',
            fontWeight: activeSubTab === 'triage' ? 600 : 400,
            color: activeSubTab === 'triage' ? '#24292f' : '#57606a',
            cursor: 'pointer'
          }}
        >
          Smart Triage Config
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('labels')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeSubTab === 'labels' ? '2px solid #0969da' : '2px solid transparent',
            padding: '8px 4px',
            fontSize: '14px',
            fontWeight: activeSubTab === 'labels' ? 600 : 400,
            color: activeSubTab === 'labels' ? '#24292f' : '#57606a',
            cursor: 'pointer'
          }}
        >
          Label Rules
        </button>
      </div>

      {activeSubTab === 'triage' && (
        <div style={{ position: 'relative' }}>
          {/* ── Under Development overlay ───────────────────────────────────── */}
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            background: '#fff8e1',
            color: '#b45309',
            border: '1px solid #f59e0b',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            zIndex: 10,
            userSelect: 'none',
            pointerEvents: 'none',
          }}>
            🚧 Under Development
          </span>

          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            cursor: 'not-allowed',
            borderRadius: '6px',
          }} aria-hidden="true" />

          <div style={{
            opacity: 0.45,
            pointerEvents: 'none',
            userSelect: 'none',
            filter: 'grayscale(40%)',
          }}>
          <p className="ro-panel-desc">
            <strong>Maintainers Only:</strong> Configure RepoOwl's automated PR triage engine. These settings control when PRs are
            auto-closed as spam, flagged for review, or detected as duplicates.
          </p>

          {/* ── Card 1: Repository Context ─────────────────────────────────── */}
          <div style={cardStyle}>
            <h2 className="ro-section-title" style={{ marginBottom: '4px' }}>
              📋 Repository Context
            </h2>
            <p style={descStyle}>
              Define your repo's core purpose. This is injected directly into the LLM prompt as
              ground truth, preventing hallucinated context and improving spam detection accuracy.
            </p>
            <label style={labelStyle} htmlFor="repo-context">Repository Purpose</label>
            <textarea
              id="repo-context"
              className="ro-input"
              rows={4}
              placeholder="e.g. This is a Chrome extension for AI-powered GitHub repository analysis. It uses Qwen 3.6 27B (via Groq) to triage PRs, sync issues, and provide code review automation."
              value={config.repo_context}
              onChange={e => updateField('repo_context', e.target.value)}
              style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '13px' }}
            />
          </div>

          {/* ── Card 2: Spam & Slop Thresholds ────────────────────────────── */}
          <div style={cardStyle}>
            <h2 className="ro-section-title" style={{ marginBottom: '4px' }}>
              🚨 Spam & AI Slop Engine
            </h2>
            <p style={descStyle}>
              Set the slop score thresholds that control when RepoOwl flags or auto-closes PRs.
              The auto-close threshold is hard-floored at 90% to prevent false positives.
            </p>

            {/* Needs Triage slider */}
            <div style={sliderRowStyle}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  <span style={badgeStyle('yellow')}>needs-triage</span>
                  {' '}Threshold — {config.needs_triage_threshold}%
                </label>
                <p style={{ ...descStyle, marginBottom: '6px' }}>
                  PRs with a slop score at or above this value get the <code>needs-triage</code> label and are flagged for manual review.
                </p>
                <input
                  type="range"
                  min={10}
                  max={89}
                  value={config.needs_triage_threshold}
                  onChange={e => updateField('needs_triage_threshold', Number(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8c959f' }}>
                  <span>10% (sensitive)</span>
                  <span>89% (lenient)</span>
                </div>
              </div>
            </div>

            {/* Auto-close slider */}
            <div style={sliderRowStyle}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  <span style={badgeStyle('red')}>auto-close</span>
                  {' '}Threshold — {config.auto_close_threshold}%
                </label>
                <p style={{ ...descStyle, marginBottom: '6px' }}>
                  PRs with a slop/spam score at or above this value are <strong>automatically closed</strong>.
                  Hard-floored at 90% — cannot be set lower.
                </p>
                <input
                  type="range"
                  min={90}
                  max={100}
                  value={config.auto_close_threshold}
                  onChange={e => updateField('auto_close_threshold', Number(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8c959f' }}>
                  <span>90% (hard floor)</span>
                  <span>100% (strictest)</span>
                </div>
              </div>
            </div>

            {/* Prompt injection toggle */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', paddingTop: '8px', borderTop: '1px solid #eaeef2' }}>
              <input
                type="checkbox"
                id="prompt-injection-guard"
                checked={config.prompt_injection_guard}
                onChange={e => updateField('prompt_injection_guard', e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer', width: '14px', height: '14px' }}
              />
              <div>
                <label htmlFor="prompt-injection-guard" style={{ ...labelStyle, marginBottom: '2px', cursor: 'pointer' }}>
                  🛡️ Prompt Injection Guard
                </label>
                <p style={{ ...descStyle, marginBottom: 0 }}>
                  Sanitizes PR titles and descriptions before sending to the LLM, and instructs the
                  model to detect manipulation attempts (e.g., "ignore all previous instructions").
                  PRs flagged as prompt injection are <strong>immediately closed</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* ── Card 3: Duplicate Detection ────────────────────────────────── */}
          <div style={cardStyle}>
            <h2 className="ro-section-title" style={{ marginBottom: '4px' }}>
              🔁 Duplicate Confidence Rules
            </h2>
            <p style={descStyle}>
              Configure the confidence thresholds for duplicate PR/issue detection.
            </p>

            {/* Possible duplicate slider */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>
                <span style={badgeStyle('yellow')}>possible-duplicate</span>
                {' '}Threshold — {config.possible_duplicate_threshold}%
              </label>
              <p style={{ ...descStyle, marginBottom: '6px' }}>
                At or above this confidence, a PR is flagged as a possible duplicate and kept open for maintainer review.
              </p>
              <input
                type="range"
                min={40}
                max={89}
                value={config.possible_duplicate_threshold}
                onChange={e => updateField('possible_duplicate_threshold', Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8c959f' }}>
                <span>40%</span>
                <span>89%</span>
              </div>
            </div>

            {/* Close duplicate slider */}
            <div>
              <label style={labelStyle}>
                <span style={badgeStyle('red')}>auto-close duplicate</span>
                {' '}Threshold — {config.close_duplicate_threshold}%
              </label>
              <p style={{ ...descStyle, marginBottom: '6px' }}>
                At or above this confidence, the PR is <strong>automatically closed</strong> as a duplicate.
                Hard-floored at 90%.
              </p>
              <input
                type="range"
                min={90}
                max={100}
                value={config.close_duplicate_threshold}
                onChange={e => updateField('close_duplicate_threshold', Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8c959f' }}>
                <span>90% (hard floor)</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* ── Save Section ───────────────────────────────────────────────── */}
          <div style={{ ...cardStyle, backgroundColor: '#f6f8fa' }}>
            <h2 className="ro-section-title" style={{ marginBottom: '8px' }}>
              💾 Save Configuration
            </h2>
            <p style={descStyle}>
              Select which repository's <code>repoowl.json</code> to update with these settings.
              The GitHub Action reads this file at runtime to apply your thresholds.
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={targetRepo}
                onChange={e => setTargetRepo(e.target.value)}
                className="ro-input"
                style={{ flex: '1 1 200px', fontSize: '13px', padding: '6px 8px' }}
              >
                {repos.length === 0 && <option value="">No tracked repositories</option>}
                {repos.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button
                type="button"
                className="ro-btn ro-btn--primary"
                onClick={handleSave}
                disabled={saving || repos.length === 0}
              >
                {saving ? 'Saving...' : '🚀 Save to repoowl.json'}
              </button>
            </div>
            {status.message && (
              <p
                className={`ro-status ro-status--${status.type}`}
                style={{ marginTop: '10px' }}
              >
                {status.message}
              </p>
            )}
          </div>

          {/* ── Decision Matrix Reference ─────────────────────────────────── */}
          <div style={{ ...cardStyle, backgroundColor: '#f6f8fa' }}>
            <h2 className="ro-section-title" style={{ marginBottom: '8px' }}>
              🚦 Triage Decision Matrix
            </h2>
            <p style={{ ...descStyle, marginBottom: '10px' }}>
              How RepoOwl handles each PR category based on your current settings:
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#eaeef2' }}>
                  {['Category', 'Condition', 'Labels', 'Action'].map(h => (
                    <th key={h} style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #d0d7de' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    cat: '🔴 AI Spam',
                    cond: `slop ≥ ${config.auto_close_threshold}%`,
                    labels: 'spam, invalid',
                    action: 'Auto-close'
                  },
                  {
                    cat: '🔴 Prompt Injection',
                    cond: 'Any (if guard enabled)',
                    labels: 'invalid, security',
                    action: 'Auto-close'
                  },
                  {
                    cat: '🔴 Duplicate',
                    cond: `confidence ≥ ${config.close_duplicate_threshold}%`,
                    labels: 'duplicate',
                    action: 'Auto-close'
                  },
                  {
                    cat: '🟡 Ambiguous',
                    cond: `${config.needs_triage_threshold}% – ${config.auto_close_threshold - 1}%`,
                    labels: 'needs-triage',
                    action: 'Flag only'
                  },
                  {
                    cat: '🟡 Possible Dup.',
                    cond: `${config.possible_duplicate_threshold}% – ${config.close_duplicate_threshold - 1}%`,
                    labels: 'possible-duplicate',
                    action: 'Flag only'
                  },
                  {
                    cat: '🟢 Valid PR',
                    cond: `slop < ${config.needs_triage_threshold}%`,
                    labels: 'verified + domain',
                    action: 'Keep open'
                  },
                ].map((row, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f6f8fa' }}>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #eaeef2', fontWeight: 500 }}>{row.cat}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #eaeef2', fontFamily: 'ui-monospace, monospace', fontSize: '11px' }}>{row.cond}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #eaeef2', color: '#57606a' }}>{row.labels}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #eaeef2', fontWeight: 600 }}>{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {activeSubTab === 'labels' && (
        <>
          <p className="ro-panel-desc">
            <strong>Maintainers Only:</strong> Map folder paths to GitHub labels. When a PR touches a matching file, the label is applied automatically with the specified hex color.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {repos.length === 0 && (
              <div style={cardStyle}>
                <p style={{ ...descStyle, margin: 0, fontStyle: 'italic' }}>
                  No tracked repositories found. Please add repositories in the "Tracked Repositories" tab first.
                </p>
              </div>
            )}
            
            {repos.map(repo => {
              const rules = pathLabels[repo] || [];
              const draft = newRuleDraft[repo] || { path: '', label: '', color: '#0969da' };
              const isExpanded = !!expandedRules[repo];
              const saveStatus = labelSaveStatus[repo];

              return (
                <div key={repo} style={{
                  border: '1px solid #d0d7de',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? '#f6f8fa' : 'transparent'
                  }} onClick={() => setExpandedRules(prev => ({ ...prev, [repo]: !prev[repo] }))}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px' }}>{repo}</strong>
                      <div style={{ fontSize: '12px', color: '#57606a', marginTop: '4px' }}>
                        {rules.length} rule{rules.length !== 1 && 's'} defined
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#57606a' }}>
                        {isExpanded ? '▼ Collapse' : '▶ Expand'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{
                      borderTop: '1px solid #d0d7de',
                      padding: '12px',
                      backgroundColor: '#f6f8fa'
                    }}>
                      
                      {rules.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                          {rules.map((rule, i) => {
                            // Calculate a light background version for the badge (rudimentary approach using opacity via RGBA could be done, but we'll just show the hex color)
                            return (
                              <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 8px',
                                background: '#ffffff',
                                border: '1px solid #d0d7de',
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}>
                                <code style={{ flex: 1, color: '#24292f', fontFamily: 'ui-monospace, monospace' }}>{rule.path}</code>
                                <span style={{ color: '#57606a' }}>→</span>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  border: '1px solid #d0d7de',
                                  borderRadius: '2em',
                                  padding: '2px 8px',
                                  background: '#ffffff'
                                }}>
                                  <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: rule.color
                                  }}></div>
                                  <span style={{ fontWeight: 600, color: '#24292f' }}>{rule.label}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveRule(repo, i); }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#cf222e',
                                    fontSize: '14px',
                                    marginLeft: '4px'
                                  }}
                                  title="Remove rule"
                                >×</button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ fontSize: '12px', color: '#8c959f', marginBottom: '16px', fontStyle: 'italic' }}>
                          No rules defined yet.
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          className="ro-input"
                          placeholder="Path (e.g. src/)"
                          value={draft.path}
                          onChange={e => setNewRuleDraft(prev => ({ ...prev, [repo]: { ...draft, path: e.target.value } }))}
                          style={{ flex: '1 1 120px', fontSize: '12px', padding: '5px 8px' }}
                        />
                        <input
                          type="text"
                          className="ro-input"
                          placeholder="Label name"
                          value={draft.label}
                          onChange={e => setNewRuleDraft(prev => ({ ...prev, [repo]: { ...draft, label: e.target.value } }))}
                          style={{ flex: '1 1 100px', fontSize: '12px', padding: '5px 8px' }}
                        />
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: '1px solid #d0d7de',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          backgroundColor: '#ffffff',
                          height: '28px'
                        }}>
                          <label style={{ fontSize: '11px', color: '#57606a', fontWeight: 600, cursor: 'pointer' }}>
                            Color
                            <input
                              type="color"
                              value={draft.color}
                              onChange={e => setNewRuleDraft(prev => ({ ...prev, [repo]: { ...draft, color: e.target.value } }))}
                              style={{ marginLeft: '6px', cursor: 'pointer', width: '20px', height: '20px', border: 'none', padding: 0, background: 'transparent' }}
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          className="ro-btn ro-btn--secondary"
                          onClick={() => handleAddRule(repo)}
                          style={{ fontSize: '12px', padding: '5px 10px', height: '28px' }}
                        >
                          + Add
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
                        <button
                          type="button"
                          className="ro-btn ro-btn--primary"
                          onClick={() => handleSaveRules(repo)}
                          disabled={savingLabels === repo}
                          style={{ fontSize: '12px', padding: '5px 12px' }}
                        >
                          {savingLabels === repo ? 'Saving...' : '💾 Save Label Rules'}
                        </button>
                        {saveStatus && (
                          <span style={{ fontSize: '12px', color: saveStatus.type === 'success' ? '#2da44e' : '#cf222e' }}>
                            {saveStatus.message}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
