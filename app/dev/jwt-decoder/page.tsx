'use client';

import { useState, useEffect } from 'react';
import DevToolLayout from '../../components/dev/DevToolLayout';
import TextAreaCard from '../../components/dev/TextAreaCard';

export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [meta, setMeta] = useState<{ exp?: string; active?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token.trim()) {
      setHeader('');
      setPayload('');
      setMeta(null);
      setError(null);
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT: Token must have 3 parts');
      }

      // Decode Header
      const decodedHeader = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      setHeader(JSON.stringify(decodedHeader, null, 2));

      // Decode Payload
      const decodedPayload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      setPayload(JSON.stringify(decodedPayload, null, 2));

      // Meta info
      if (decodedPayload.exp) {
        const expDate = new Date(decodedPayload.exp * 1000);
        setMeta({
          exp: expDate.toLocaleString(),
          active: expDate > new Date()
        });
      } else {
        setMeta(null);
      }

      setError(null);
    } catch (err) {
      setError('Invalid JWT format');
      setHeader('');
      setPayload('');
      setMeta(null);
    }
  }, [token]);

  return (
    <DevToolLayout
      title="JWT Decoder"
      description="Decode JSON Web Tokens onto their Header and Payload components. Debug your tokens easily."
    >
      <div style={{ display: 'grid', gap: '2rem' }}>
        <TextAreaCard
          title="Encoded Token"
          value={token}
          onChange={setToken}
          placeholder="Paste JWT here (e.g. eyJhbGci...)"
          height="120px"
          actions={<button onClick={() => setToken('')} className="btn btn-secondary">Clear</button>}
          error={error}
        />

        {meta && (
          <div className="card" style={{ 
            borderColor: meta.active ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
            background: meta.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
          }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Token Status</h3>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <span style={{ opacity: 0.7 }}>State:</span> 
                <span style={{ fontWeight: bold, color: meta.active ? 'green' : 'red', marginLeft: '0.5rem' }}>
                  {meta.active ? 'Valid (Not Expired)' : 'Expired'}
                </span>
              </div>
              <div>
                <span style={{ opacity: 0.7 }}>Expires:</span>
                <span style={{ marginLeft: '0.5rem' }}>{meta.exp}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <TextAreaCard
            title="Header"
            value={header}
            readOnly
            height="300px"
          />
          <TextAreaCard
            title="Payload"
            value={payload}
            readOnly
            height="300px"
          />
        </div>
      </div>
    </DevToolLayout>
  );
}

const bold = 600;
