import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Class component is required here — React error boundaries have no hook
 * equivalent as of React 19. Catches render-phase errors anywhere below it
 * in the tree and shows a recoverable fallback instead of an unrecoverable
 * blank screen. Does not catch errors in event handlers or async code
 * (those are handled per-page via try/catch + toast, as already done
 * throughout the app's mutations). */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="grid min-h-dvh place-items-center bg-neutral-50 p-6">
        <div className="flex max-w-sm flex-col items-center gap-3 rounded-[var(--radius-xl)] bg-neutral-0 p-8 text-center shadow-sm">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-danger-subtle text-danger">
            <AlertTriangle size={26} />
          </div>
          <h2 className="m-0 text-lg font-bold text-neutral-900">Something went wrong</h2>
          <p className="m-0 text-sm text-neutral-500">
            The app hit an unexpected error. Reloading usually fixes this.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-2 rounded-[var(--radius-md)] bg-brand px-5 py-2.5 text-sm font-bold text-white active:scale-95 transition-transform"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }
}
