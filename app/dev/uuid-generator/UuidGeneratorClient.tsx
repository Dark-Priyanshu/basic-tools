'use client';

import { useState } from 'react';
import DevToolLayout from '../../components/dev/DevToolLayout';
import TextAreaCard from '../../components/dev/TextAreaCard';

export default function UuidGeneratorClient() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string>('');
  
  const generateUuidV4 = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generate = () => {
    const newUuids = [];
    // Limit to 50
    const safeCount = Math.min(Math.max(1, count), 50);
    
    for (let i = 0; i < safeCount; i++) {
      newUuids.push(generateUuidV4());
    }
    setUuids(newUuids.join('\n'));
  };

  const download = () => {
    if (!uuids) return;
    const blob = new Blob([uuids], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DevToolLayout
      title="UUID Generator"
      description="Generate random UUIDs (version 4) instantly. Generate singles or bulk lists."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Controls */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label>Quantity (Max 50)</label>
            <input 
              type="number" 
              min="1" 
              max="50" 
              value={count} 
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            />
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={count} 
              onChange={(e) => setCount(parseInt(e.target.value))}
              style={{ marginTop: '0.5rem' }}
            />
          </div>
          
          <button onClick={generate} className="btn btn-primary" style={{ width: '100%' }}>
            Generate UUIDs
          </button>

          <button onClick={download} className="btn btn-secondary" disabled={!uuids} style={{ width: '100%' }}>
            Download .txt
          </button>
        </div>

        {/* Output */}
        <TextAreaCard
          title="Generated UUIDs"
          value={uuids}
          readOnly
          placeholder="Generated UUIDs will appear here..."
          height="500px"
        />

      </div>
    </DevToolLayout>
  );
}
