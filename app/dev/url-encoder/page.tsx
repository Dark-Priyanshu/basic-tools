'use client';

import { useState, useEffect } from 'react';
import DevToolLayout from '../../components/dev/DevToolLayout';
import TextAreaCard from '../../components/dev/TextAreaCard';
import Tabs from '../../components/dev/Tabs';

export default function UrlConverter() {
  const [activeTab, setActiveTab] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, [activeTab]);

  useEffect(() => {
    if (!input) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      if (activeTab === 'encode') {
        const encoded = encodeURIComponent(input);
        setOutput(encoded);
        setError(null);
      } else {
        const decoded = decodeURIComponent(input);
        setOutput(decoded);
        setError(null);
      }
    } catch (err) {
      setError('Malformed URL sequence');
    }
  }, [input, activeTab]);

  return (
    <DevToolLayout
      title="URL Encoder / Decoder"
      description="Encode (escape) or Decode (unescape) URL parameters and strings."
    >
      <Tabs
        tabs={[
          { id: 'encode', label: 'Encode' },
          { id: 'decode', label: 'Decode' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <TextAreaCard
          title={activeTab === 'encode' ? 'Text Input' : 'Encoded Input'}
          value={input}
          onChange={setInput}
          placeholder={activeTab === 'encode' ? 'Enter text to encode...' : 'Enter URL to decode...'}
          actions={<button onClick={() => setInput('')} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Clear</button>}
          error={error}
        />
        <TextAreaCard
          title={activeTab === 'encode' ? 'Encoded Output' : 'Decoded Output'}
          value={output}
          readOnly
          placeholder="Result..."
        />
      </div>
    </DevToolLayout>
  );
}
