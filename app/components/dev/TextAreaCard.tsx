import { ReactNode } from 'react';
import CopyButton from './CopyButton';

interface TextAreaCardProps {
  title: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  actions?: ReactNode;
  height?: string;
  error?: string | null;
}

export default function TextAreaCard({ 
  title, 
  value, 
  onChange, 
  placeholder, 
  readOnly = false, 
  actions,
  height = '300px',
  error
}: TextAreaCardProps) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem' 
      }}>
        <h3 style={{ fontWeight: 600 }}>{title}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {readOnly && value && <CopyButton content={value} />}
          {actions}
        </div>
      </div>
      
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck={false}
          style={{
            flex: 1,
            minHeight: height,
            fontFamily: 'monospace',
            resize: 'vertical',
            borderColor: error ? '#ef4444' : undefined,
            backgroundColor: readOnly ? 'var(--background)' : undefined
          }}
        />
        {error && (
          <div style={{ 
            color: '#ef4444', 
            fontSize: '0.9rem', 
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}
