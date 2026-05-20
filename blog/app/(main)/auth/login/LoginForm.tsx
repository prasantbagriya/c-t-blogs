'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleAdminLogin } from '@/lib/actions';

export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError('');
    
    try {
      const result = await handleAdminLogin(password);
      
      if (result.success) {
        // Force a hard refresh to ensure the new cookie is recognized by the layout
        window.location.href = '/admin';
      } else {
        setError(result.error || 'Invalid master password');
        setIsPending(false);
      }
    } catch (err) {
      setError('Connection error. Please try again later.');
      setIsPending(false);
    }
  };

  return (
    <div 
      className="glass-panel animate-fade-in" 
      style={{ 
        padding: '3rem 2.5rem', 
        width: '90%', 
        maxWidth: '420px', 
        boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(16px)',
        borderRadius: '1.25rem',
        background: 'rgba(255, 255, 255, 0.85)',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Brand & Icon */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '56px', 
          height: '56px', 
          borderRadius: '16px', 
          background: 'linear-gradient(135deg, var(--primary), #4f46e5)', 
          color: '#fff', 
          boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
          marginBottom: '1rem'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 0.5rem 0', color: '#0f172a' }}>
          Chat<span style={{ color: 'var(--primary)' }}>Wizs</span> Admin
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0 }}>
          Enter master password to access administrative panel
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
            Master Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: '#ffffff',
              fontSize: '1rem',
              color: '#0f172a',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              outline: 'none',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
            }}
            required
            disabled={isPending}
          />
        </div>

        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: '#dc2626', 
            background: '#fef2f2', 
            border: '1px solid #fee2e2',
            padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius)',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={isPending}
          style={{ 
            width: '100%', 
            padding: '0.875rem', 
            borderRadius: 'var(--radius)',
            opacity: isPending ? 0.7 : 1,
            cursor: isPending ? 'not-allowed' : 'pointer',
            fontSize: '0.9375rem',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}
        >
          {isPending ? 'Verifying Session...' : 'Access Dashboard'}
        </button>
      </form>
    </div>
  );
}
