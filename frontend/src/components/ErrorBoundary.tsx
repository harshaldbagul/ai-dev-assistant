import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-100">
          <div className="flex flex-col items-center gap-2 text-center max-w-md px-4">
            <p className="text-xl font-semibold">Something went wrong</p>
            <p className="text-sm text-zinc-400">
              An unexpected error occurred. Try again or reload the page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-2 max-h-40 w-full overflow-auto rounded-md bg-zinc-900 p-3 text-left text-xs text-red-400">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={this.handleReset}>
              Try again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload app
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
