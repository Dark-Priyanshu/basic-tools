'use client';

import { useState, useEffect } from 'react';
import BackButton from '@/app/components/BackButton';
import CarouselSelectionModal from './CarouselSelectionModal';
import DownloadQueueList from './DownloadQueueList';

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
  carouselIndex?: number;
  directDownloadUrl?: string; // Opt-in for direct proxy download
};

export default function SocialToolsClient() {
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('video'); // video, audio
  const [quality, setQuality] = useState('best');
  
  // Note: 'loading' here generally refers to the initial "add to queue" validation.
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState('');
  // const [result, setResult] = useState<any>(null); // Unused variable removed
  
  // Queue State
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Carousel Selection State
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  // Re-use the interface we defined in CarouselSelectionModal (or defining here to avoid circular dep if we exported it)
  // Ideally, types should be in a shared file, but for now defining locally or importing if exported.
  // Let's define it here to be safe and consistent.
  type SelectionItem = {
      index: number;
      is_video: boolean;
      url: string;
      download_url?: string;
      type: string;
  };
  
  const [selectionItems, setSelectionItems] = useState<SelectionItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

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
    setError('');
    setShowSelectionModal(false);
  };

  const platforms: { id: Platform; label: string; icon: string }[] = [
    { id: 'youtube', label: 'YouTube', icon: '📺' },
    { id: 'facebook', label: 'Facebook', icon: '📘' },
    { id: 'instagram', label: 'Instagram', icon: '📷' },
    { id: 'spotify', label: 'Spotify', icon: '🎵' },
  ];

  const downloadSingleItem = async (item: { url: string; platform: Platform; format: string; quality: string; carouselIndex?: number; directDownloadUrl?: string }) => {
     let response;
     let filename = "";

     // 1. Smart Download Strategy
     if (item.directDownloadUrl) {
         let ext = item.format === 'photo' ? 'jpg' : 'mp4';
         filename = `Instagram_${item.carouselIndex ?? 0}_${Date.now()}.${ext}`;

         // Strategy A: PHOTOS - Blob (Instant Save from Cache)
         if (item.format === 'photo') {
             // We use the same proxy URL as the preview image. Browser should cache hit this.
             const proxyImageUrl = `/api/py/proxy_image?url=${encodeURIComponent(item.directDownloadUrl)}`;
             
             try {
                 const res = await fetch(proxyImageUrl);
                 if (!res.ok) throw new Error('Failed to fetch image');
                 const blob = await res.blob();
                 
                 const downloadUrl = window.URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = downloadUrl;
                 a.download = filename;
                 document.body.appendChild(a);
                 a.click();
                 document.body.removeChild(a);
                 window.URL.revokeObjectURL(downloadUrl);
                 return filename;
             } catch (e) {
                 console.error("Blob save failed, falling back to proxy download", e);
                 // Fallback to Strategy B if blob fails
             }
         }

         // Strategy B: VIDEOS (or Photo Fallback) - Direct Stream (Browser Native)
         const proxyUrl = `/api/py/proxy_download?url=${encodeURIComponent(item.directDownloadUrl)}&filename=${encodeURIComponent(filename)}`;
         const a = document.createElement('a');
         a.href = proxyUrl;
         a.style.display = 'none';
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);

         // Artificial delay to allow browser to start download before we mark "Completed" in UI
         await new Promise(r => setTimeout(r, 2000)); 
         return filename;

     } else {
         // 2. Fallback / Standard Download (Expensive API Call)
         response = await fetch(`/api/py/download/${item.platform}`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            url: item.url,
            format_type: item.format,
            quality: item.quality,
            carousel_index: item.carouselIndex ?? -1
            }),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({ detail: 'Download failed' }));
            throw new Error(errData.detail || 'Download failed');
        }

        // Check Content-Type for JSON (Carousel Manifest)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json(); 
        }
     }

      const blob = await response.blob();
      const disposition = response.headers.get('content-disposition');
      
      let ext = 'mp4';
      if (item.format === 'audio') ext = 'mp3';
      if (item.format === 'photo') ext = 'jpg';
      
      if (!filename) filename = `download.${ext}`;
      
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

  const handleSmartDownload = async () => {
    setError('');
    // Basic validation
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // Special Logic for Instagram: Check for Carousel first
    if (platform === 'instagram') {
        // Probe
        setLoading(true); // Show local loading on button
        try {
            const res = await fetch(`/api/py/download/instagram`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ url, format_type: format, quality, carousel_index: -1 })
            });

            if (!res.ok) throw new Error('Failed to fetch post info');
            
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.type === 'carousel') {
                    setSelectionItems(data.items);
                    setSelectedIndices(new Set());
                    setShowSelectionModal(true);
                    setLoading(false);
                    return; // Stop here, wait for selection
                }
            }
            // Fallback for single stream response if API changed? 
            // Current API ALWAYS returns JSON manifest for Instagram Discovery (index -1)
            // So we should expect JSON. If Blob, it means API didn't follow plan.
            
            // Just in case:
            const blob = await res.blob();
            // ... (Fallback handling, likely won't hit if API is correct)
             
             setUrl('');
             setLoading(false);
             return;

        } catch (err: unknown) {
             const message = err instanceof Error ? err.message : "Error checking URL";
             setError(message);
             setLoading(false);
             return;
        }
    }

    // Default behavior for other platforms (or if logic flow falls through)
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
    setUrl(''); // Clear input
  };
  
  const confirmSelectionDownload = () => {
      // Create a queue item for EACH selected index
      const newItems: QueueItem[] = Array.from(selectedIndices).map(idx => {
          // Find original item to get download_url
          const originalItem = selectionItems.find(i => i.index === idx);
          const isVideo = originalItem?.is_video;
          // IMPORTANT: Fallback to 'url' (display_url) for photos if download_url is missing. 
          // For videos, 'url' is just a thumbnail, so we really need download_url or we fallback to full process.
          const directUrl = (originalItem?.download_url) || (isVideo ? undefined : originalItem?.url);
          
          return {
            id: Date.now().toString() + '-' + idx,
            url, // Same URL
            platform: 'instagram',
            format: isVideo ? 'video' : 'photo', // Auto-detect format from item type
            quality,
            status: 'pending',
            carouselIndex: idx,
            directDownloadUrl: directUrl // PASS THE URL!
        };
      });
      
      setQueue(prev => [...prev, ...newItems]);
      setShowSelectionModal(false);
      setSelectionItems([]);
      setUrl('');
      setLoading(false);
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearQueue = () => {
      // Keep only items that are currently downloading to prevent state issues
      setQueue(prev => prev.filter(item => item.status === 'downloading'));
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
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Download failed";
            setQueue(prev => prev.map(q => q.id === nextItem.id ? { ...q, status: 'error', error: message } : q));
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
            opacity: !url || loading ? 0.7 : 1, // Dim if disabled
            cursor: !url || loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? (
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: '#fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span>Fetching Info...</span>
             </div>
          ) : (
             isProcessingQueue ? 'Add to Queue' : 'Download'
          )}
        </button>

        {/* Queue Section */}
        <DownloadQueueList 
          queue={queue} 
          isProcessingQueue={isProcessingQueue} 
          onClearQueue={clearQueue} 
          onRemoveItem={removeFromQueue} 
          platforms={platforms}
        />

        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', opacity: 0.6, fontSize: '0.85rem', textAlign: 'center' }}>
          <p>⚠️ Disclaimer: Download only content you own or have permission to use.</p>
        </div>
      </div>
      
      {/* Carousel Selection Modal */}
      {showSelectionModal && (
        <CarouselSelectionModal 
           items={selectionItems}
           selectedIndices={selectedIndices}
           onToggleSelect={(index) => {
                const newSelected = new Set(selectedIndices);
                if (newSelected.has(index)) newSelected.delete(index);
                else newSelected.add(index);
                setSelectedIndices(newSelected);
           }}
           onCancel={() => { setShowSelectionModal(false); setSelectionItems([]); setLoading(false); }}
           onDownload={confirmSelectionDownload}
        />
      )}




    </div>
  );
}
