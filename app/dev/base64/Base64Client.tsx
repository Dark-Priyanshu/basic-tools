'use client';

import { useState, useEffect } from 'react';
import DevToolLayout from '../../components/dev/DevToolLayout';
import TextAreaCard from '../../components/dev/TextAreaCard';
import Tabs from '../../components/dev/Tabs';

export default function Base64Client() {
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
        // UTF-8 friendly encoding
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
        setError(null);
      } else {
        // Decode
        const decoded = decodeURIComponent(escape(atob(input)));
        setOutput(decoded);
        setError(null);
      }
    } catch (err) {
      if (activeTab === 'decode') {
        setError('Invalid Base64 string');
      } else {
        setError('Unable to encode text');
      }
    }
  }, [input, activeTab]);

  return (
    <DevToolLayout
      title="Base64 Encoder / Decoder"
      description="Encode text to Base64 or decode Base64 strings back to text. Supports UTF-8 characters."
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
          title={activeTab === 'encode' ? 'Text Input' : 'Base64 Input'}
          value={input}
          onChange={setInput}
          placeholder={activeTab === 'encode' ? 'Type text to encode...' : 'Paste Base64 to decode...'}
          actions={<button onClick={() => setInput('')} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Clear</button>}
          error={error}
        />
        <TextAreaCard
          title={activeTab === 'encode' ? 'Base64 Output' : 'Text Output'}
          value={output}
          readOnly
          placeholder="Result..."
        />
      </div>
    </DevToolLayout>
  );
}
