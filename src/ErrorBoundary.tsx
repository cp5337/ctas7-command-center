import React from 'react';

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CTAS App Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h1>🚨 CTAS Command Center Error</h1>
          <div style={{ background: '#fee', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
            <h2>Something went wrong:</h2>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
              {this.state.error?.message}
            </pre>
            <details style={{ marginTop: '10px' }}>
              <summary>Stack trace</summary>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#007acc',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}