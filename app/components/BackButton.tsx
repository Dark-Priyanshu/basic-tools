'use client';

import Link from 'next/link';

export default function BackButton() {
  return (
    <Link 
      href="/" 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        marginBottom: '1.5rem', 
        color: 'var(--foreground)', 
        textDecoration: 'none', 
        opacity: 0.7,
        fontSize: '0.9rem',
        fontWeight: 500,
        transition: 'opacity 0.2s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
    >
      <span>←</span> Back to Home
    </Link>
  );
}
