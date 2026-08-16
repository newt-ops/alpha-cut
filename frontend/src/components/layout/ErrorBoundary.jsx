import React from 'react';
import { Button } from '@components/ui/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Page Navigation Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
          <h2 className="font-display" style={{ fontSize: '28px', marginBottom: '12px' }}>
            Page Navigation Interrupted
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '24px', lineHeight: 1.6 }}>
            A network update occurred while switching pages. Please reload to load the latest version.
          </p>
          <Button variant="primary" onClick={this.handleReload}>
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
