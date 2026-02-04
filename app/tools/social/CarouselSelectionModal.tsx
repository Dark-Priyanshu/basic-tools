import React from 'react';

interface SelectionItem {
  index: number;
  is_video: boolean;
  url: string;
  download_url?: string;
  type: string;
}

interface CarouselSelectionModalProps {
  items: SelectionItem[];
  selectedIndices: Set<number>;
  onToggleSelect: (index: number) => void;
  onCancel: () => void;
  onDownload: () => void;
}

export default function CarouselSelectionModal({
  items,
  selectedIndices,
  onToggleSelect,
  onCancel,
  onDownload
}: CarouselSelectionModalProps) {
  return (
    <div style={{
       position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
       background: 'rgba(0,0,0,0.8)', zIndex: 1000,
       display: 'flex', alignItems: 'center', justifyContent: 'center',
       padding: '1rem'
    }}>
       <div style={{
           background: 'var(--card-bg)', 
           padding: '1.5rem', 
           borderRadius: '1rem', 
           maxWidth: '600px', 
           width: '100%',
           maxHeight: '80vh',
           display: 'flex', flexDirection: 'column'
       }}>
           <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Select items to download</h3>
           <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
               {items.map((item) => (
                   <div 
                     key={item.index} 
                     onClick={() => onToggleSelect(item.index)}
                     style={{ 
                       position: 'relative', 
                       aspectRatio: '1', 
                       borderRadius: '0.5rem', 
                       overflow: 'hidden', 
                       cursor: 'pointer',
                       border: selectedIndices.has(item.index) ? '3px solid var(--primary)' : '1px solid var(--border)' 
                     }}
                   >
                   
                       <img 
                           src={`/api/py/proxy_image?url=${encodeURIComponent(item.url)}`} 
                           alt={`Item ${item.index}`} 
                           style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                           onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                       />
                       <div style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                           {selectedIndices.has(item.index) ? '✓' : (item.index + 1)}
                       </div>
                       {item.is_video && <div style={{ position: 'absolute', bottom: 5, right: 5, background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>VIDEO</div>}
                   </div>
               ))}
           </div>
           
           <div style={{ display: 'flex', gap: '1rem' }}>
               <button 
                 onClick={onCancel}
                 style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}
               >Cancel</button>
               <button 
                 onClick={onDownload}
                 disabled={selectedIndices.size === 0}
                 className="btn btn-primary"
                 style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', opacity: selectedIndices.size === 0 ? 0.5 : 1 }}
               >Download ({selectedIndices.size})</button>
           </div>
       </div>
    </div>
  );
}
