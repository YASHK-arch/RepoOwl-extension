import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { fetchIssueInsight } from '../content/fetchIssueInsights.js';
import { InsightsOverlay } from './InsightsOverlay.jsx';
import overlayCss from '../overlay/overlay.css?inline';

let hostElement = null;
let reactRoot = null;
let shadowRoot = null;

function ensureHost() {
  if (hostElement) {
    return shadowRoot;
  }

  hostElement = document.createElement('div');
  hostElement.id = 'repoowl-overlay-host';
  document.body.appendChild(hostElement);

  shadowRoot = hostElement.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = overlayCss;
  shadowRoot.appendChild(style);

  const mountPoint = document.createElement('div');
  shadowRoot.appendChild(mountPoint);
  reactRoot = createRoot(mountPoint);

  return shadowRoot;
}

function OverlayController({
  repositoryFullName,
  issueNumber,
  initialInsight,
  insightsById,
  onClose,
}) {
  const [insight, setInsight] = useState(initialInsight ?? null);
  const [loading, setLoading] = useState(!initialInsight);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInsight() {
      if (initialInsight) {
        setInsight(initialInsight);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const result = await fetchIssueInsight(repositoryFullName, issueNumber);
      if (cancelled) {
        return;
      }

      setInsight(result.data);
      setError(result.error);
      setLoading(false);
    }

    loadInsight();

    return () => {
      cancelled = true;
    };
  }, [repositoryFullName, issueNumber, initialInsight]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <InsightsOverlay
      repositoryFullName={repositoryFullName}
      issueNumber={issueNumber}
      insight={insight}
      insightsById={insightsById}
      loading={loading}
      error={error}
      onClose={onClose}
    />
  );
}

export function openInsightsOverlay({
  repositoryFullName,
  issueNumber,
  initialInsight,
  insightsById,
}) {
  ensureHost();

  const handleClose = () => {
    reactRoot.render(null);
  };

  reactRoot.render(
    <OverlayController
      repositoryFullName={repositoryFullName}
      issueNumber={issueNumber}
      initialInsight={initialInsight}
      insightsById={insightsById}
      onClose={handleClose}
    />
  );
}
