'use client';

import { useState, useRef } from 'react';
import BackButton from '../../components/BackButton';

type Mode = 'encode' | 'decode';

export default function SteganographyPage() {
  const [mode, setMode] = useState<Mode>('encode');
  const [loading, setLoading] = useState(false);
  
  // Encode state
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [secretText, setSecretText] = useState('');
  const [password, setPassword] = useState('');
  const [encodedImageUrl, setEncodedImageUrl] = useState('');
  const [capacity, setCapacity] = useState(0);
  
  // Decode state
  const [encodedImage, setEncodedImage] = useState<File | null>(null);
  const [decodePassword, setDecodePassword] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const decodeInputRef = useRef<HTMLInputElement>(null);

  // Crypto utilities
  const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const encryptText = async (text: string, password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(text)
    );
    
    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    return btoa(String.fromCharCode(...combined));
  };

  const decryptText = async (encryptedData: string, password: string): Promise<string> => {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);
    
    const key = await deriveKey(password, salt);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  };

  // LSB Steganography
  const stringToBinary = (str: string): string => {
    return str.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  };

  const binaryToString = (binary: string): string => {
    const bytes = binary.match(/.{8}/g) || [];
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
  };

  const calculateCapacity = (img: HTMLImageElement): number => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    const totalPixels = img.width * img.height;
    const bitsAvailable = totalPixels * 3; // 3 bits per pixel (R, G, B)
    const bytesAvailable = Math.floor(bitsAvailable / 8);
    
    // Reserve 32 bits (4 bytes) for message length
    return bytesAvailable - 4;
  };

  const handleSourceImageSelect = async (file: File) => {
    setSourceImage(file);
    setEncodedImageUrl('');
    setError('');
    
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => { img.onload = resolve; });
    
    const cap = calculateCapacity(img);
    setCapacity(cap);
    URL.revokeObjectURL(img.src);
  };

  const encodeMessage = async () => {
    if (!sourceImage || !secretText) {
      setError('Please select an image and enter text to hide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Encrypt if password provided
      const textToEncode = password ? await encryptText(secretText, password) : secretText;
      
      // Check capacity
      if (textToEncode.length > capacity) {
        throw new Error(`Text too long! Maximum ${capacity} characters for this image.`);
      }

      const img = new Image();
      img.src = URL.createObjectURL(sourceImage);
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert message to binary
      const messageBinary = stringToBinary(textToEncode);
      const lengthBinary = textToEncode.length.toString(2).padStart(32, '0');
      const fullBinary = lengthBinary + messageBinary;

      // Embed into LSB
      let binaryIndex = 0;
      for (let i = 0; i < data.length && binaryIndex < fullBinary.length; i += 4) {
        // Skip alpha channel, use R, G, B
        for (let j = 0; j < 3 && binaryIndex < fullBinary.length; j++) {
          const bit = parseInt(fullBinary[binaryIndex]);
          data[i + j] = (data[i + j] & 0xFE) | bit; // Clear LSB and set new bit
          binaryIndex++;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      setEncodedImageUrl(URL.createObjectURL(blob));
      URL.revokeObjectURL(img.src);
    } catch (err: any) {
      setError(err.message || 'Failed to encode message');
    } finally {
      setLoading(false);
    }
  };

  const decodeMessage = async () => {
    if (!encodedImage) {
      setError('Please select an encoded image');
      return;
    }

    setLoading(true);
    setError('');
    setExtractedText('');

    try {
      const img = new Image();
      img.src = URL.createObjectURL(encodedImage);
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Extract length (first 32 bits)
      let lengthBinary = '';
      for (let i = 0; i < 32; i++) {
        const pixelIndex = Math.floor(i / 3) * 4;
        const channelIndex = i % 3;
        lengthBinary += (data[pixelIndex + channelIndex] & 1).toString();
      }
      
      const messageLength = parseInt(lengthBinary, 2);
      
      if (messageLength <= 0 || messageLength > 1000000) {
        throw new Error('No hidden message found or image is corrupted');
      }

      // Extract message
      let messageBinary = '';
      const totalBits = messageLength * 8;
      for (let i = 32; i < 32 + totalBits; i++) {
        const pixelIndex = Math.floor(i / 3) * 4;
        const channelIndex = i % 3;
        messageBinary += (data[pixelIndex + channelIndex] & 1).toString();
      }

      let extractedMessage = binaryToString(messageBinary);

      // Decrypt if password provided
      if (decodePassword) {
        try {
          extractedMessage = await decryptText(extractedMessage, decodePassword);
        } catch {
          throw new Error('Failed to decrypt. Wrong password?');
        }
      }

      setExtractedText(extractedMessage);
      URL.revokeObjectURL(img.src);
    } catch (err: any) {
      setError(err.message || 'Failed to decode message');
    } finally {
      setLoading(false);
    }
  };

  const downloadEncodedImage = () => {
    if (!encodedImageUrl) return;
    const link = document.createElement('a');
    link.download = 'encoded_image.png';
    link.href = encodedImageUrl;
    link.click();
  };

  const copyExtractedText = async () => {
    await navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <BackButton />
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Hide Text in Image
      </h1>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
        Hide secret messages inside images using steganography
      </p>

      {/* Mode Toggle */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('encode')}
            style={{ flex: 1 }}
          >
            🔒 Encode (Hide Text)
          </button>
          <button
            className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('decode')}
            style={{ flex: 1 }}
          >
            🔓 Decode (Extract Text)
          </button>
        </div>
      </div>

      {/* Encode Mode */}
      {mode === 'encode' && (
        <>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Select Image
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleSourceImageSelect(e.target.files[0])}
              style={{ marginBottom: '1rem' }}
            />
            {sourceImage && (
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                ✓ Image loaded. Capacity: {capacity} characters
              </p>
            )}
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Secret Message
            </h3>
            <textarea
              placeholder="Enter your secret message here..."
              value={secretText}
              onChange={(e) => setSecretText(e.target.value)}
              rows={6}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              {secretText.length} / {capacity} characters
            </p>
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Password (Optional)
            </h3>
            <input
              type="password"
              placeholder="Enter password to encrypt message"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.5rem' }}>
              If set, the message will be encrypted before hiding
            </p>
          </div>

          {error && (
            <div style={{ padding: '1rem', background: '#ff444420', border: '1px solid #ff4444', borderRadius: '0.5rem', marginBottom: '2rem', color: '#ff4444' }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={encodeMessage}
            disabled={loading || !sourceImage || !secretText}
            style={{ width: '100%', marginBottom: '2rem' }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                Encoding...
              </div>
            ) : 'Encode Message'}
          </button>

          {encodedImageUrl && (
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Encoded Image
              </h3>
              <img src={encodedImageUrl} alt="Encoded" style={{ maxWidth: '100%', marginBottom: '1rem', borderRadius: '0.5rem' }} />
              <button className="btn btn-primary" onClick={downloadEncodedImage} style={{ width: '100%' }}>
                Download Encoded Image
              </button>
            </div>
          )}
        </>
      )}

      {/* Decode Mode */}
      {mode === 'decode' && (
        <>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Select Encoded Image
            </h3>
            <input
              ref={decodeInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setEncodedImage(e.target.files?.[0] || null)}
            />
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Password (If Encrypted)
            </h3>
            <input
              type="password"
              placeholder="Enter password if message was encrypted"
              value={decodePassword}
              onChange={(e) => setDecodePassword(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {error && (
            <div style={{ padding: '1rem', background: '#ff444420', border: '1px solid #ff4444', borderRadius: '0.5rem', marginBottom: '2rem', color: '#ff4444' }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={decodeMessage}
            disabled={loading || !encodedImage}
            style={{ width: '100%', marginBottom: '2rem' }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                Decoding...
              </div>
            ) : 'Decode Message'}
          </button>

          {extractedText && (
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Extracted Message
              </h3>
              <div style={{ 
                background: 'var(--background)', 
                padding: '1rem', 
                borderRadius: '0.5rem', 
                marginBottom: '1rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {extractedText}
              </div>
              <button className="btn btn-secondary" onClick={copyExtractedText} style={{ width: '100%' }}>
                {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Disclaimer */}
      <div style={{ 
        marginTop: '3rem', 
        padding: '1rem', 
        background: 'var(--border)', 
        borderRadius: '0.5rem', 
        fontSize: '0.85rem', 
        opacity: 0.7,
        textAlign: 'center'
      }}>
        ⚠️ Disclaimer: This tool is for privacy and learning purposes only. Do not use for illegal activities.
      </div>
    </div>
  );
}
