import React, { ReactNode } from 'react';
import { AlertTriangle, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-red-500/20 rounded-xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-full p-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h1>

              <p className="text-slate-300 mb-4">
                We encountered an unexpected error. The issue has been logged and our team will look into it.
              </p>

              {this.state.error && (
                <div className="bg-slate-900/50 border border-slate-700 rounded p-3 mb-6 text-left">
                  <p className="text-xs text-slate-400 font-mono break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={this.resetError}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Try Again
                </button>
                <a
                  href="/"
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </a>
              </div>

              <p className="text-xs text-slate-500 mt-6">
                Error ID: {Date.now()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
