import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('LyricPost error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center gap-4">
          <p className="text-[15px] font-semibold text-white">Something went wrong</p>
          <p className="text-[13px] text-neutral-500 max-w-xs">
            The app hit an unexpected error. Reload to start fresh.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-neutral-100 transition-colors"
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
