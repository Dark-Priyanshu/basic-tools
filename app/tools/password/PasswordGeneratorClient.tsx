'use client';

import { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton';

export default function PasswordGeneratorClient() {
  const [password, setPassword] = useState<string>('');
  const [length, setLength] = useState<number>(16);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [lowercase, setLowercase] = useState<boolean>(true);
  const [numbers, setNumbers] = useState<boolean>(true);
  const [symbols, setSymbols] = useState<boolean>(true);
  const [excludeSimilar, setExcludeSimilar] = useState<boolean>(false);
  const [strength, setStrength] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generatePassword = () => {
    let charset = '';
    let pwd = '';

    if (uppercase) charset += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) charset += excludeSimilar ? '23456789' : '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      alert('Please select at least one character type');
      return;
    }

    for (let i = 0; i < length; i++) {
        pwd += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setPassword(pwd);
    calculateStrength(pwd);
    setCopied(false);
  };

  const calculateStrength = (pwd: string) => {
    let score = 0;
    
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 3) setStrength('Weak');
    else if (score <= 5) setStrength('Medium');
    else setStrength('Strong');
  };

  const copyToClipboard = () => {
    if (!password) {
      alert('Please generate a password first');
      return;
    }

    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    generatePassword();
  }, []);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <BackButton />
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Password Generator
      </h1>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
        Create strong, secure passwords with customizable options
      </p>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{
          background: 'var(--border)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          fontFamily: 'monospace',
          fontSize: '1.25rem',
          wordBreak: 'break-all',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {password || 'Click generate to create a password'}
        </div>

        {password && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div>
              <span style={{ fontWeight: '500' }}>Strength: </span>
              <span style={{
                color: strength === 'Weak' ? '#ef4444' : strength === 'Medium' ? '#f59e0b' : '#10b981',
                fontWeight: '600'
              }}>
                {strength}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-primary"
            onClick={generatePassword}
            style={{ flex: 1 }}
          >
            Regenerate
          </button>
          <button
            className="btn btn-secondary"
            onClick={copyToClipboard}
            style={{ flex: 1 }}
          >
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Password Options
        </h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>Length: {length}</label>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', opacity: 0.6 }}>
            <span>8</span>
            <span>64</span>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
            />
            Uppercase Letters (A-Z)
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
            />
            Lowercase Letters (a-z)
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={numbers}
              onChange={(e) => setNumbers(e.target.checked)}
            />
            Numbers (0-9)
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={symbols}
              onChange={(e) => setSymbols(e.target.checked)}
            />
            Symbols (!@#$%^&*)
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={excludeSimilar}
              onChange={(e) => setExcludeSimilar(e.target.checked)}
            />
            Exclude Similar Characters (O/0, l/1, I/i)
          </label>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Password Tips
        </h3>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Use at least 12 characters for better security</li>
          <li>Include a mix of uppercase, lowercase, numbers, and symbols</li>
          <li>Never reuse passwords across different accounts</li>
          <li>Consider using a password manager to store your passwords securely</li>
          <li>Change passwords regularly, especially for sensitive accounts</li>
        </ul>
      </div>

      {copied && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: '#10b981',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          animation: 'fadeIn 0.3s'
        }}>
          ✓ Password copied to clipboard!
        </div>
      )}
    </div>
  );
}
