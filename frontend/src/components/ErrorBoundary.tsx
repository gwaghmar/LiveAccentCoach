/**
 * ErrorBoundary — catches render errors in child component trees.
 * Shows a minimal fallback UI so one broken section doesn't crash the whole app.
 */
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional label shown in the fallback to identify which section crashed */
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.section ? ` – ${this.props.section}` : ''}]`, error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="error-boundary">
        <span className="material-symbols-outlined">error</span>
        <div className="error-boundary__title">
          {this.props.section ? `${this.props.section} failed to load` : 'Something went wrong'}
        </div>
        <div className="error-boundary__msg">{this.state.error?.message}</div>
        <button className="error-boundary__retry" onClick={this.handleReset}>
          Retry
        </button>
      </div>
    );
  }
}
