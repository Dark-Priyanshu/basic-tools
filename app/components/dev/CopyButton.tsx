'use client';

import { useState } from 'react';

interface CopyButtonProps {
  content: string;
  label?: string;
  className?: string;
}

export default function CopyButton({ content, label = 'Copy', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`btn btn-secondary ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        fontSize: '0.9rem',
        ...(copied ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {})
      }}
      disabled={!content}
    >
      <span>{copied ? '✓' : '📋'}</span>
      {copied ? 'Copied!' : label}
    </button>
  );
}
