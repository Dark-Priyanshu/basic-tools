'use client';

import { useState } from 'react';

import { shortenUrlAction } from './actions';
import BackButton from '../../components/BackButton';

export default function UrlShortenerPage() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleShorten = async () => {
    setError('');
    setShortUrl('');
    setCopied(false);

    if (!longUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(longUrl)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setLoading(true);
    
    try {
      // Use Server Action instead of fetch API
      const result = await shortenUrlAction(longUrl);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.shortUrl) {
        setShortUrl(result.shortUrl);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const clear = () => {
    setLongUrl('');
    setShortUrl('');
    setError('');
    setCopied(false);
  };

  return (
    <div>
      <BackButton />
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        URL Shortener
      </h1>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
        Shorten long URLs into compact, shareable links instantly
      </p>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>


          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Paste Long URL
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="url"
              placeholder="https://example.com/very/long/url..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              style={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleShorten();
              }}
            />
          </div>
          {error && (
            <p style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {error}
            </p>
          )}
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleShorten}
          disabled={loading || !longUrl}
          style={{ width: '100%', marginBottom: '1.5rem' }}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              Shortening...
            </div>
          ) : 'Shorten URL'}
        </button>

        {shortUrl && (
          <div style={{ 
            marginTop: '1.5rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid var(--border)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--primary)' }}>
              Your Short URL
            </label>
            
            <div style={{ 
              display: 'flex', 
              marginBottom: '1rem',
              background: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }}>
              <input
                type="text"
                readOnly
                value={shortUrl}
                style={{ 
                  flex: 1, 
                  border: 'none', 
                  background: 'transparent',
                  padding: '0.75rem',
                  outline: 'none',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleCopy}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <span>{copied ? '✅' : '📋'}</span>
                {copied ? 'Copied!' : 'Copy'}
              </button>
              
              <a 
                href={shortUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}
              >
                <span>🔗</span> Open Link
              </a>

              <button 
                className="btn btn-secondary" 
                onClick={clear}
                style={{ width: 'auto' }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', opacity: 0.6, fontSize: '0.85rem', textAlign: 'center' }}>
          <p>⚠️ Note: This tool uses a public URL shortening service.</p>
          <p>Avoid shortening sensitive or private URLs.</p>
        </div>
      </div>
    </div>
  );
}
