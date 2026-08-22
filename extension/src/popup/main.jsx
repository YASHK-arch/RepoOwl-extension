import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';

import { PopupApp } from './PopupApp.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true, error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', wordBreak: 'break-all' }}>
          <h3>Something went wrong.</h3>
          <p>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ fontSize: '10px' }}>{this.state.info && this.state.info.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <PopupApp />
    </ErrorBoundary>
  </StrictMode>
);
