'use client';

import { useState, useEffect } from 'react';
import DevToolLayout from '../../components/dev/DevToolLayout';
import CopyButton from '../../components/dev/CopyButton';

export default function ColorConverterClient() {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState('rgb(59, 130, 246)');
  const [hsl, setHsl] = useState('hsl(217, 91%, 60%)');
  const [error, setError] = useState<string | null>(null);

  // Helper functions
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  // Update all from HEX input
  const handleHexChange = (value: string) => {
    setHex(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      const rgbVal = hexToRgb(value);
      if (rgbVal) {
        setRgb(`rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`);
        const hslVal = rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b);
        setHsl(`hsl(${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%)`);
        setError(null);
      }
    }
  };

  // Update all from RGB input
  const handleRgbChange = (value: string) => {
    setRgb(value);
    // Simple parsing for rgb(r, g, b)
    const match = value.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      
      const toHex = (c: number) => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      setHex(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
      
      const hslVal = rgbToHsl(r, g, b);
      setHsl(`hsl(${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%)`);
      setError(null);
    }
  };

  return (
    <DevToolLayout
      title="Color Converter"
      description="Convert colors between HEX, RGB, and HSL formats with a live preview."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Preview Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ 
            width: '150px', 
            height: '150px', 
            backgroundColor: hex, 
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '4px solid var(--border)',
            marginBottom: '1.5rem'
          }} />
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{hex}</h3>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* HEX Input */}
          <div className="card">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>HEX</span>
              <CopyButton content={hex} label="" className="" />
            </label>
            <input 
              type="text" 
              value={hex} 
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#000000"
              style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}
            />
          </div>

          {/* RGB Input */}
          <div className="card">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>RGB</span>
              <CopyButton content={rgb} label="" className="" />
            </label>
            <input 
              type="text" 
              value={rgb} 
              onChange={(e) => handleRgbChange(e.target.value)}
              placeholder="rgb(0, 0, 0)"
              style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}
            />
          </div>

          {/* HSL Readonly */}
          <div className="card">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>HSL</span>
              <CopyButton content={hsl} label="" className="" />
            </label>
            <input 
              type="text" 
              value={hsl} 
              readOnly
              style={{ fontFamily: 'monospace', fontSize: '1.1rem', backgroundColor: 'var(--background)' }}
            />
          </div>

        </div>
      </div>
    </DevToolLayout>
  );
}
