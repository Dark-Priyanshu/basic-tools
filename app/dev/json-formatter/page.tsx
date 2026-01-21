'use client';

import { useState } from 'react';
import DevToolLayout from '../../components/dev/DevToolLayout';
import TextAreaCard from '../../components/dev/TextAreaCard';
import CopyButton from '../../components/dev/CopyButton';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const formatJson = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const minifyJson = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const validateJson = () => {
    try {
      if (!input.trim()) {
        setError('Please enter JSON to validate');
        return;
      }
      JSON.parse(input);
      setError(null);
      setOutput('Valid JSON ✅');
      setTimeout(() => setOutput(''), 2000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const loadExample = () => {
    const example = {
      project: "Developer Tools",
      active: true,
      features: ["JSON", "Base64", "UUID"],
      meta: {
        created: "2024",
        version: 1.0
      }
    };
    setInput(JSON.stringify(example, null, 2));
    setOutput('');
    setError(null);
  };

  return (
    <DevToolLayout
      title="JSON Formatter & Validator"
      description="Format, minify, and validate JSON data. Features syntax error highlighting and easy copy-paste."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={formatJson} className="btn btn-primary">Format (Prettify)</button>
          <button onClick={minifyJson} className="btn btn-secondary">Minify</button>
          <button onClick={validateJson} className="btn btn-secondary">Validate</button>
          <button onClick={loadExample} className="btn btn-secondary">Load Example</button>
          <button onClick={clear} className="btn btn-secondary" style={{ marginLeft: 'auto' }}>Clear</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <TextAreaCard
            title="Input JSON"
            value={input}
            onChange={setInput}
            placeholder="Paste your JSON here..."
            height="500px"
            error={error}
          />
          <TextAreaCard
            title="Output"
            value={output}
            readOnly
            height="500px"
            placeholder="Formatted JSON will appear here..."
          />
        </div>
      </div>
    </DevToolLayout>
  );
}
