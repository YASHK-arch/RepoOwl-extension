import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { PromptSettings } from '../settings/PromptSettings.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PromptSettings />
  </StrictMode>
);
