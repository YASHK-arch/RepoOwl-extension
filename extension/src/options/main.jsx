import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ModelConfig } from '../settings/ModelConfig.jsx';
import { PromptSettings } from '../settings/PromptSettings.jsx';
import { AboutPanel } from '../settings/AboutPanel.jsx';
import { TrackedRepos } from '../settings/TrackedRepos.jsx';
import './styles.css';

const REPO_URL = 'https://github.com/YASHK-arch/RepoOwl-extension';

const NAV_ITEMS = [
  {
    id: 'model',
    title: 'Model Config',
    sub: 'Connect a provider, authorise its origin, and choose the model.',
  },
  {
    id: 'prompt',
    title: 'Summary Preferences',
    sub: 'Tune language, detail level, and prompt templates.',
  },
  {
    id: 'repos',
    title: 'Tracked Repositories',
    sub: 'Manage which repositories are actively analyzed.',
  },
  {
    id: 'about',
    title: 'About',
    sub: 'Review extension state and clear cached analysis data.',
  },
];

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function OwlIcon() {
  return (
    <img
      src={/* eslint-disable-next-line no-undef */ chrome?.runtime?.getURL('icons/logo48.png') ?? ''}
      width={28}
      height={28}
      style={{ borderRadius: 6, objectFit: 'cover' }}
      alt="RepoOwl"
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
}

function OptionsApp() {
  const [activeTab, setActiveTab] = useState('model');

  return (
    <div className="ro-layout">
      {/* ── Sidebar ── */}
      <aside className="ro-sidebar">
        {/* Identity */}
        <div className="ro-sidebar__identity">
          <div className="ro-sidebar__icon-row">
            <div className="ro-sidebar__icon" aria-hidden="true">
              <OwlIcon />
            </div>
            <span className="ro-sidebar__name">RepoOwl</span>
          </div>
          <p className="ro-sidebar__tagline">
            AI-powered repository explorer for deep insights and smart discovery.
          </p>
          <div className="ro-sidebar__pills">
            <div className="ro-sidebar__pill">
              <span className="ro-sidebar__pill-label">Provider</span>
              <span className="ro-sidebar__pill-value">Groq</span>
            </div>
            <div className="ro-sidebar__pill">
              <span className="ro-sidebar__pill-label">Language</span>
              <span className="ro-sidebar__pill-value">auto</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="ro-nav" aria-label="Settings navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`ro-nav__item${activeTab === item.id ? ' ro-nav__item--active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <span className="ro-nav__item-title">{item.title}</span>
              <span className="ro-nav__item-sub">{item.sub}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="ro-sidebar__footer">
          <span className="ro-sidebar__version">v0.1.0</span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="ro-sidebar__gh-link"
          >
            <GitHubIcon />
            GitHub ↗
          </a>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="ro-main">
        {activeTab === 'model' && <ModelConfig />}
        {activeTab === 'prompt' && <PromptSettings />}
        {activeTab === 'repos' && <TrackedRepos />}
        {activeTab === 'about' && <AboutPanel />}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OptionsApp />
  </StrictMode>
);
