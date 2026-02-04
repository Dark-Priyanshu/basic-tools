'use client';

import { useState, useEffect } from 'react';
import BackButton from '@/app/components/BackButton';

type Platform = 'youtube' | 'facebook' | 'instagram' | 'spotify';

type QueueItem = {
  id: string;
  url: string;
  platform: Platform;
  format: string;
  quality: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  filename?: string;
  error?: string;
};

export default function SocialToolsClient() {
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('video'); // video, audio
  const [quality, setQuality] = useState('best');
  
  // Note: 'loading' here generally refers to the initial "add to queue" validation if we had any, 
  // but now we just rely on queue status. We'll keep it for UI disabling if needed.
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  
  // Queue State
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

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

  const downloadSingleItem = async (item: { url: string; platform: Platform; format: string; quality: string }) => {
     const response = await fetch(`/api/py/download/${item.platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: item.url,
          format_type: item.format,
          quality: item.quality,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Download failed' }));
        throw new Error(errData.detail || 'Download failed');
      }

      const blob = await response.blob();
      const disposition = response.headers.get('content-disposition');
      
      let ext = 'mp4';
      if (item.format === 'audio') ext = 'mp3';
      if (item.format === 'photo') ext = 'jpg';
      
      let filename = `download.${ext}`;
      
      if (disposition) {
          if (disposition.includes("filename*=")) {
              const split = disposition.split("filename*=");
              if (split.length > 1) {
                  let rawName = split[1].split(";")[0].trim();
                  if (rawName.startsWith('"') && rawName.endsWith('"')) rawName = rawName.slice(1, -1);
                  if (rawName.toLowerCase().startsWith("utf-8''")) rawName = rawName.substring(7);
                  try { filename = decodeURIComponent(rawName); } catch (e) { filename = rawName; }
              }
          } else if (disposition.includes("filename=")) {
              const split = disposition.split("filename=");
              if (split.length > 1) {
                  let rawName = split[1].split(";")[0].trim();
                  if (rawName.startsWith('"') && rawName.endsWith('"')) rawName = rawName.slice(1, -1);
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
      
      return filename;
  };

  const handleSmartDownload = () => {
    setError('');
    // Basic validation
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // Add to queue
    const newItem: QueueItem = {
      id: Date.now().toString(),
      url,
      platform,
      format,
      quality,
      status: 'pending'
    };

    setQueue(prev => [...prev, newItem]);
    
    // Clear input
    setUrl('');
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  // Queue Processing Effect
  useEffect(() => {
    const processNext = async () => {
        if (isProcessingQueue) return;

        // Find the first pending item
        // We use a functional update approach to ensure we get the latest queue, 
        // but for useEffect dependencies we rely on 'queue' changing.
        const nextItem = queue.find(item => item.status === 'pending');
        
        if (!nextItem) return;

        setIsProcessingQueue(true);

        // Update status to downloading
        setQueue(prev => prev.map(q => q.id === nextItem.id ? { ...q, status: 'downloading' } : q));

        try {
            const filename = await downloadSingleItem(nextItem);
            setQueue(prev => prev.map(q => q.id === nextItem.id ? { ...q, status: 'completed', filename } : q));
            
            // Show result for the just completed item if user is watching? 
            // Or maybe just let the queue list show "Done".
            // setResult({ title: filename, file_path: "Downloads Folder" });

            // Small delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err: any) {
            setQueue(prev => prev.map(q => q.id === nextItem.id ? { ...q, status: 'error', error: err.message } : q));
        } finally {
            setIsProcessingQueue(false); 
            // The state update above (completed/error) will trigger this effect again,
            // which will then pick up the NEXT pending item.
        }
    };

    processNext();
  }, [queue, isProcessingQueue]);


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
              {platform === 'instagram' && <option value="photo">Photo (JPG)</option>}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Quality</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', opacity: (platform === 'spotify' || format === 'photo') ? 0.7 : 1 }}
            >
              {platform === 'spotify' ? (
                <>
                  <option value="192k">192 kbps (Standard)</option>
                  <option value="320k">320 kbps (High)</option>
                  <option value="128k">128 kbps (Low)</option>
                </>
              ) : format === 'photo' ? (
                 <>
                  <option value="best">Best Quality</option>
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
          onClick={handleSmartDownload}
          disabled={!url}
          style={{ 
            width: '100%', 
            marginBottom: '1.5rem', 
            position: 'relative', 
            overflow: 'hidden',
            opacity: !url ? 0.5 : 1
          }}
        >
          {/* Dynamic Label based on state */}
          {isProcessingQueue ? 'Add to Queue' : 'Download'}
        </button>

        {/* Queue Section */}
        {(queue.length > 0 || isProcessingQueue) && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                    Downloads
                    {isProcessingQueue && <span style={{ marginLeft: '10px', fontSize: '0.8rem', opacity: 0.7 }}>(Processing...)</span>}
                </h3>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {queue.map((item) => (
                  <div key={item.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      background: 'var(--background)',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border)' 
                  }}>
                      <div style={{ fontSize: '1.2rem' }}>
                          {platforms.find(p => p.id === item.platform)?.icon}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.url}
                          </div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                             {item.format.toUpperCase()} • {item.quality}
                          </div>
                      </div>
                      <div>
                          {item.status === 'pending' && <span style={{ padding: '0.2rem 0.5rem', background: '#e0e0e0', color: '#555', borderRadius: '4px', fontSize: '0.75rem' }}>Pending</span>}
                          {item.status === 'downloading' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px', borderColor: '#3b82f6', borderTopColor: 'transparent' }}></div>
                                Downloading...
                              </div>
                          )}
                          {item.status === 'completed' && <span style={{ padding: '0.2rem 0.5rem', background: '#22c55e', color: '#fff', borderRadius: '4px', fontSize: '0.75rem' }}>Done</span>}
                          {item.status === 'error' && <span style={{ padding: '0.2rem 0.5rem', background: '#eff6ff', color: '#ef4444', borderRadius: '4px', fontSize: '0.75rem' }}>Error</span>}
                      </div>
                      
                      {/* Only allow deleting pending items */}
                      {item.status === 'pending' && (
                          <button 
                            onClick={() => removeFromQueue(item.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '1.2rem', padding: '0 0.5rem' }}
                            title="Remove from queue"
                          >×</button>
                      )}
                  </div>
                ))}
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
