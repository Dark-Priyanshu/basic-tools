'use client';

import { useState } from 'react';
import BackButton from '@/app/components/BackButton';

type Platform = 'youtube' | 'facebook' | 'instagram' | 'spotify';

export default function SocialToolsClient() {
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('video'); // video, audio
  const [quality, setQuality] = useState('best');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  // Reset/Configure defaults when platform changes
  const handlePlatformChange = (newPlatform: Platform) => {
    setPlatform(newPlatform);
    if (newPlatform === 'spotify') {
      setFormat('audio');
      setQuality('192k');
    } else {
      setFormat('video');
      setQuality('best');
    }
    setResult(null);
    setError('');
  };

  const platforms: { id: Platform; label: string; icon: string }[] = [
    { id: 'youtube', label: 'YouTube', icon: '📺' },
    { id: 'facebook', label: 'Facebook', icon: '📘' },
    { id: 'instagram', label: 'Instagram', icon: '📷' },
    { id: 'spotify', label: 'Spotify', icon: '🎵' },
  ];

  const handleDownload = async () => {
    setError('');
    setResult(null);

    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/download/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          format_type: format,
          quality,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Download failed' }));
        throw new Error(errData.detail || 'Download failed');
      }

      // Handle Blob Response
      const blob = await response.blob();
      
      // Extract filename from header
      const disposition = response.headers.get('content-disposition');
      let filename = `download.${format === 'audio' ? 'mp3' : 'mp4'}`;
      
      if (disposition) {
          // Check for filename* (UTF-8 encoded)
          // Example: filename*=utf-8''Video%20name.mp4
          if (disposition.includes("filename*=")) {
              const split = disposition.split("filename*=");
              if (split.length > 1) {
                  let rawName = split[1].split(";")[0].trim();
                  // Remove quotes if present
                  if (rawName.startsWith('"') && rawName.endsWith('"')) {
                      rawName = rawName.slice(1, -1);
                  }
                  // Remove utf-8'' prefix if present (common in Starlette/FastAPI)
                  if (rawName.toLowerCase().startsWith("utf-8''")) {
                      rawName = rawName.substring(7);
                  }
                  try {
                      filename = decodeURIComponent(rawName);
                  } catch (e) {
                      console.error("Filename decode error:", e);
                      filename = rawName;
                  }
              }
          } 
          // Check for standard filename
          else if (disposition.includes("filename=")) {
              const split = disposition.split("filename=");
              if (split.length > 1) {
                  let rawName = split[1].split(";")[0].trim();
                  if (rawName.startsWith('"') && rawName.endsWith('"')) {
                      rawName = rawName.slice(1, -1);
                  }
                  filename = rawName;
              }
          }
      }

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setResult({ 
        title: filename, 
        file_path: "Your Browser Downloads Folder" 
      });

    } catch (err: any) {
      // console.error(err); // Silenced console error
      setError(err.message || 'Failed to connect to the local downloader service. Make sure the Python script is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <BackButton />
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Social Media Downloader
      </h1>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
        Download videos and audio from your favorite social platforms.
      </p>

      {/* Platform Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => handlePlatformChange(p.id)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: platform === p.id ? 'var(--primary)' : 'var(--card-bg)',
              color: platform === p.id ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: platform === p.id ? '0 4px 12px rgba(var(--primary-rgb), 0.3)' : 'none',
            }}
          >
            <span>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            {platforms.find(p => p.id === platform)?.label} URL
          </label>
          <input
            type="url"
            placeholder={`Paste ${platforms.find(p => p.id === platform)?.label} link here...`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              disabled={platform === 'spotify'} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', opacity: platform === 'spotify' ? 0.7 : 1 }}
            >
              <option value="video">Video (MP4)</option>
              <option value="audio">Audio (MP3)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Quality</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
            >
              {platform === 'spotify' ? (
                <>
                  <option value="192k">192 kbps (Standard)</option>
                  <option value="320k">320 kbps (High)</option>
                  <option value="128k">128 kbps (Low)</option>
                </>
              ) : format === 'audio' ? (
                 <>
                  <option value="best">Best Available</option>
                  <option value="320k">320 kbps</option>
                  <option value="256k">256 kbps</option>
                  <option value="192k">192 kbps</option>
                  <option value="128k">128 kbps</option>
                 </>
              ) : (
                <>
                  <option value="best">Best Available</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </>
              )}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(255, 68, 68, 0.1)', 
            border: '1px solid #ff4444', 
            borderRadius: '0.5rem', 
            color: '#ff4444', 
            marginBottom: '1.5rem' 
          }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleDownload}
          disabled={loading || !url}
          style={{ width: '100%', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  Processing...
               </div>
               
               {/* Progress Bar Container */}
               <div style={{ 
                  width: '100%', 
                  height: '4px', 
                  background: 'rgba(255,255,255,0.2)', 
                  borderRadius: '2px',
                  marginTop: '0.5rem',
                  overflow: 'hidden'
               }}>
                  {/* Progress Bar Animation */}
                  <div style={{
                    height: '100%',
                    background: '#fff',
                    maxWidth: '100%',
                    borderRadius: '2px',
                    animation: 'progressIndeterminate 2s infinite linear',
                    width: '30%' // Base width for animation
                  }}></div>
                  <style jsx>{`
                    @keyframes progressIndeterminate {
                      0% { transform: translateX(-100%); width: 20%; }
                      50% { width: 50%; }
                      100% { transform: translateX(400%); width: 20%; }
                    }
                  `}</style>
               </div>
            </div>
          ) : 'Download Media'}
        </button>

        {result && (
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00C851', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              <span>✅</span> Download Complete!
            </div>
            <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
              <strong>Title:</strong> {result.title}
            </p>
            <div style={{
              background: 'var(--background)',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}>
              Saved to: {result.file_path}
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', opacity: 0.6, fontSize: '0.85rem', textAlign: 'center' }}>
          <p>⚠️ Disclaimer: Download only content you own or have permission to use.</p>
        </div>
      </div>
    </div>
  );
}
