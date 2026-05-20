// @ts-nocheck
import React from 'react';

/**
 * M-4 FIX: Global Error Boundary to catch rendering crashes
 * and show a recovery UI instead of a white screen.
 * 
 * Note: @ts-nocheck is used because React 19's built-in types
 * have inconsistencies with class component generics in some TS configs.
 * Error boundaries MUST be class components per React spec.
 */
export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'Inter, system-ui, sans-serif',
          background: '#0f0f17',
          color: '#e2e8f0',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ef4444, #f97316)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            fontSize: '2rem'
          }}>
            ⚠️
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '400px', marginBottom: '1.5rem' }}>
            An unexpected error occurred. Your data is safe. Please reload to continue.
          </p>
          <p style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '1.5rem', maxWidth: '500px', wordBreak: 'break-word' }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
