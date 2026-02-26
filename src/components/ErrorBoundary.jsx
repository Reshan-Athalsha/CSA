import { Component } from 'react';

/**
 * Catches rendering errors from lazy-loaded pages and shows a
 * user-friendly recovery screen instead of a blank white page.
 * Especially important on 3G where chunk loads can fail mid-flight.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[CSA] Page error:', error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.message?.includes('Loading chunk') ||
        this.state.error?.message?.includes('Failed to fetch') ||
        this.state.error?.message?.includes('dynamically imported module');

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="h-14 w-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#fef2f2' }}>
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-header)' }}>
            {isChunkError ? 'Network Error' : 'Something went wrong'}
          </h2>
          <p className="text-sm text-gray-500 mb-5 max-w-sm">
            {isChunkError
              ? 'The page failed to load — this can happen on slow connections. Please try again.'
              : 'An unexpected error occurred. Try refreshing the page.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition hover:opacity-90"
              style={{ backgroundColor: '#0096c7' }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl border text-sm font-semibold transition"
              style={{ borderColor: '#ade8f4', color: 'var(--color-text-main)' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
