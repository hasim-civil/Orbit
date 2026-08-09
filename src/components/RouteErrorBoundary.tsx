import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Changing this (e.g. the route pathname) remounts the boundary, so
   * navigating away from a broken page and back gives it a fresh render
   * instead of staying stuck on the fallback forever. */
  resetKey: string;
}

interface State {
  hasError: boolean;
}

/** Scoped to a single route's content, inside AppLayout — a crash here
 * shows an in-context fallback but leaves the bottom nav and aurora shell
 * intact, so the person can still navigate elsewhere instead of losing the
 * whole app to the root-level ErrorBoundary's full-screen reload prompt. */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error in route content:', error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-xl)] bg-neutral-0 px-6 py-12 text-center shadow-sm">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-danger-subtle text-danger">
          <AlertTriangle size={22} />
        </div>
        <p className="m-0 font-semibold text-neutral-900">This page hit a problem</p>
        <p className="m-0 text-sm text-muted-text">Try again, or use the tabs below to go elsewhere.</p>
        <button
          type="button"
          onClick={this.handleRetry}
          className="mt-1 flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white active:scale-95 transition-transform"
        >
          <RotateCcw size={13} /> Try Again
        </button>
      </div>
    );
  }
}
