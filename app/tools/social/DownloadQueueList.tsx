import React from 'react';

type Platform = 'youtube' | 'facebook' | 'instagram' | 'spotify';

interface QueueItem {
  id: string;
  url: string;
  platform: Platform;
  format: string;
  quality: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  filename?: string;
  error?: string;
  carouselIndex?: number;
}

interface DownloadQueueListProps {
  queue: QueueItem[];
  isProcessingQueue: boolean;
  onClearQueue: () => void;
  onRemoveItem: (id: string) => void;
  platforms: { id: Platform; label: string; icon: string }[];
}

export default function DownloadQueueList({
  queue,
  isProcessingQueue,
  onClearQueue,
  onRemoveItem,
  platforms
}: DownloadQueueListProps) {
  if (queue.length === 0 && !isProcessingQueue) return null;

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                Downloads
                {isProcessingQueue && <span style={{ marginLeft: '10px', fontSize: '0.8rem', opacity: 0.7 }}>(Processing...)</span>}
            </h3>
            <button
                onClick={onClearQueue}
                style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.85rem',
                    color: 'var(--foreground)',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '0.4rem',
                    cursor: 'pointer',
                    opacity: 0.8
                }}
                onMouseOver={(e) => (e.target as HTMLButtonElement).style.opacity = '1'}
                onMouseOut={(e) => (e.target as HTMLButtonElement).style.opacity = '0.8'}
            >
                Clear Queue
            </button>
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
                         {item.format.toUpperCase()} • {item.quality} {item.carouselIndex !== undefined && item.carouselIndex >= 0 ? `• Item #${item.carouselIndex + 1}` : ''}
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
                        onClick={() => onRemoveItem(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '1.2rem', padding: '0 0.5rem' }}
                        title="Remove from queue"
                      >×</button>
                  )}
              </div>
            ))}
         </div>
    </div>
  );
}
