import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@components/ui/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Page Navigation Error Boundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
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
