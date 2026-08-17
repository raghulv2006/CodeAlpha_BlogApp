'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log unexpected client-side errors to console/monitoring service
    console.error('BotBlogs Client Error Boundary caught an exception:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        gap: '1.5rem',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
        }}
      >
        ⚠️
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Something went wrong</h1>
      <p style={{ maxWidth: '480px', color: 'var(--softTextColor, #888)', margin: 0, lineHeight: 1.6 }}>
        An unexpected error occurred while rendering this page. Our team has been notified.
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            backgroundColor: '#0070f3',
            color: '#ffffff',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          Try Again
        </button>
        <Link
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
            color: 'inherit',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
