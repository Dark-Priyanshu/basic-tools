import Link from 'next/link';
import { ReactNode } from 'react';

interface DevToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function DevToolLayout({ title, description, children }: DevToolLayoutProps) {
  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          href="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            textDecoration: 'none',
            color: 'var(--primary)',
            fontWeight: 500,
            marginBottom: '1rem'
          }}
        >
          ← Back to Tools
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {title}
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '800px' }}>
          {description}
        </p>
      </div>
      
      <div className="tool-content">
        {children}
      </div>
    </div>
  );
}
