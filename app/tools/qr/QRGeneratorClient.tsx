'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import BackButton from '../../components/BackButton';

type QRType = 'url' | 'wifi' | 'phone' | 'sms' | 'email' | 'whatsapp' | 'upi';
type QRStyle = 'squares' | 'dots' | 'rounded' | 'extra-rounded' | 'classy';

export default function QRGeneratorClient() {
  const [qrType, setQrType] = useState<QRType>('url');
  const [qrData, setQrData] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  
  // WiFi fields
  const [ssid, setSsid] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [encryption, setEncryption] = useState<string>('WPA');
  
  // Contact fields
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [smsMessage, setSmsMessage] = useState<string>('');
  const [whatsappMessage, setWhatsappMessage] = useState<string>('');
  
  // UPI fields
  const [upiId, setUpiId] = useState<string>('');
  const [upiName, setUpiName] = useState<string>('');
  const [upiAmount, setUpiAmount] = useState<string>('');
  
  // Style options
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [margin, setMargin] = useState<number>(4);
  const [qrStyle, setQrStyle] = useState<QRStyle>('squares');
  const [embedLogo, setEmbedLogo] = useState<boolean>(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoSize, setLogoSize] = useState<number>(0.2);

  // Favicon specific state
  const [useFavicon, setUseFavicon] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fetchingFavicon, setFetchingFavicon] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const generateQRData = useCallback((): string => {
    switch (qrType) {
      case 'url':
        return qrData;
      case 'wifi':
        return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
      case 'phone':
        return `tel:${phone}`;
      case 'sms':
        return `smsto:${phone}:${smsMessage}`;
      case 'email':
        return `mailto:${email}`;
      case 'whatsapp':
        return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
      case 'upi':
        return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${upiAmount}`;
      default:
        return qrData;
    }
  }, [qrType, qrData, ssid, password, encryption, phone, email, smsMessage, whatsappMessage, upiId, upiName, upiAmount]);

  // Helper to check if a module is part of the position detection patterns (eyes)
  const isEye = (row: number, col: number, size: number): boolean => {
    // Top-left
    if (row < 7 && col < 7) return true;
    // Top-right
    if (row < 7 && col >= size - 7) return true;
    // Bottom-left
    if (row >= size - 7 && col < 7) return true;
    return false;
  };

  const fetchFavicon = async (urlInput: string) => {
    if (!urlInput) return;
    
    setFetchingFavicon(true);
    let normalizedUrl = urlInput;
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      const urlObj = new URL(normalizedUrl);
      const domain = urlObj.hostname;
      
      // We use Google's service as the source, but route it through our local proxy
      // to avoid CORS issues when fetching the blob.
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      const proxyUrl = `/api/favicon?url=${encodeURIComponent(googleFaviconUrl)}`;
      
      try {
        const response = await fetch(proxyUrl);
        if (response.ok) {
           const blob = await response.blob();
           // Determine type from blob or default to png
           const file = new File([blob], "favicon.png", { type: blob.type || "image/png" });
           setLogo(file);
           setEmbedLogo(true);
        } else {
           throw new Error('Favicon proxy fetch failed');
        }
      } catch (e) {
             console.error("Favicon Proxy Error:", e);
             showToast("Unable to fetch favicon. Please try manual upload.");
             setUseFavicon(false); 
      }
    } catch (error) {
       console.error("Invalid URL:", error);
    } finally {
      setFetchingFavicon(false);
    }
  };

  // Effect to handle auto-fetching when toggle is on and URL changes
  useEffect(() => {
    if (qrType === 'url' && useFavicon) {
        // Debounce fetching to avoid too many requests while typing
        const timer = setTimeout(() => {
            if (qrData) {
                fetchFavicon(qrData);
            }
        }, 1000);
        return () => clearTimeout(timer);
    } else if (!useFavicon && qrType === 'url') {
       // logic to clear logo is handled in the toggle change handler to avoid clearing manual uploads inadvertently
       // unless we strictly want "Toggle OFF = No Logo" behavior which user requested:
       // "Remove favicon logo and revert to normal QR OR keep manual logo state if user has uploaded one."
       // For simplicity, if we turning OFF favicon mode, we shouldn't necessarily clear a logo if the user then manually uploads one.
       // But if they just turn it off, we might want to clear it if it WAS a favicon. 
       // For now, let's leave it manual control or we can clear it if it was auto-set.
       // User rule: "Remove favicon logo and revert to normal QR" implies clearing it.
    }
  }, [qrData, useFavicon, qrType]);


  const generateQR = useCallback(async (silent: boolean = false) => {
    const data = generateQRData();
    if (!data) {
      if (!silent) alert('Please fill in the required fields');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Lazy load QRCode import
      const QRCode = (await import('qrcode')).default;

      // Create raw QR data
      // Rule: "When logo embedding is ON (manual/fav icon): Set QR Error Correction Level to HIGH (H) automatically."
      // Rule: "When logo embedding is OFF: Use default correction level (M)."
      // The original code used 'H' by default. Let's make it dynamic.
      const errorCorrectionLevel = embedLogo ? 'H' : 'M';

      const qr = await QRCode.create(data, {
        errorCorrectionLevel: errorCorrectionLevel,
        // @ts-ignore - margin is valid but missing in some type definitions
        margin: 0 // We handle margin manually
      });
      
      const modules = qr.modules;
      const size = modules.size;
      const baseSize = 400; // Visual size target
      const cellSize = baseSize / (size + margin * 2);
      const pixelSize = Math.floor(cellSize * (size + margin * 2)); // Snap to integer for sharpness
      
      // Update canvas size
      canvas.width = pixelSize;
      canvas.height = pixelSize;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, pixelSize, pixelSize);
      
      // Set foreground
      ctx.fillStyle = fgColor;

      // Draw modules
      const offset = margin * cellSize;
      
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (modules.get(row, col)) {
            const x = offset + col * cellSize;
            const y = offset + row * cellSize;
            
            // Allow special styling for non-eye modules
            const eye = isEye(row, col, size);
            
            if (eye) {
              // Eyes always squares for readability, or slightly rounded
              ctx.fillRect(x, y, cellSize, cellSize);
            } else {
              switch (qrStyle) {
                case 'dots':
                  ctx.beginPath();
                  ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2.5, 0, Math.PI * 2);
                  ctx.fill();
                  break;
                case 'rounded':
                  ctx.beginPath();
                  ctx.roundRect(x, y, cellSize, cellSize, cellSize * 0.25);
                  ctx.fill();
                  break;
                 case 'extra-rounded':
                  ctx.beginPath();
                  ctx.roundRect(x, y, cellSize, cellSize, cellSize * 0.5);
                  ctx.fill();
                  break;
                case 'classy':
                  // Dot with small connection or distinct shape
                   ctx.beginPath();
                   ctx.roundRect(x + 1, y + 1, cellSize - 2, cellSize - 2, 0); // Smaller squares
                   ctx.fill();
                   break;
                case 'squares':
                default:
                  ctx.fillRect(x, y, cellSize, cellSize);
                  break;
              }
            }
          }
        }
      }

      // Apply logo if enabled
      if (embedLogo && logo) {
        const img = new Image();
        const url = URL.createObjectURL(logo);
        
        await new Promise((resolve) => {
          img.onload = () => {
            const logoSizePx = pixelSize * logoSize;
            const x = (pixelSize - logoSizePx) / 2;
            const y = (pixelSize - logoSizePx) / 2;
            
            // Draw white background check for logo safe zone
            ctx.fillStyle = '#ffffff';
            // Round the background rect for better look
            ctx.beginPath();
            // Increased padding/safe zone slightly as per requirement
            ctx.roundRect(x - 5, y - 5, logoSizePx + 10, logoSizePx + 10, 8);
            ctx.fill();
            
            ctx.drawImage(img, x, y, logoSizePx, logoSizePx);
            URL.revokeObjectURL(url);
            resolve(null);
          };
          img.src = url;
        });
      }

      setQrUrl(canvas.toDataURL());
    } catch (error) {
      console.error('Error generating QR code:', error);
      if (!silent) alert('Error generating QR code');
    }
  }, [generateQRData, margin, fgColor, bgColor, embedLogo, logo, logoSize, qrStyle]);

  const downloadQR = async (format: 'png' | 'svg') => {
    if (!qrUrl && format === 'png') {
        alert('Please generate a QR code first');
        return;
    }

    if (format === 'png') {
        const link = document.createElement('a');
        link.download = `qrcode.png`;
        link.href = qrUrl;
        link.click();
    } else {
        // Lazy load
        const QRCode = (await import('qrcode')).default;
        
        const data = generateQRData();
        if (!data) return;

        // Ensure same error correction logic applies to SVG
        const errorCorrectionLevel = embedLogo ? 'H' : 'M';

        QRCode.toString(data, {
            type: 'svg',
            width: 400,
            margin: margin,
            color: {
                dark: fgColor,
                light: bgColor,
            },
            errorCorrectionLevel: errorCorrectionLevel,
        }).then((svg: string) => {
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'qrcode.svg';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    }
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      generateQR(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [generateQR]);

  return (
    <div>
      <BackButton />
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#ef4444', 
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-in-out'
        }}>
            {toastMessage}
        </div>
      )}

      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        QR Code Generator
      </h1>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
        Generate customizable QR codes for various purposes
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              QR Code Type
            </h3>
            <select value={qrType} onChange={(e) => {
                setQrType(e.target.value as QRType);
                // Reset favicon toggle when switching types
                if (useFavicon) {
                    setUseFavicon(false);
                    setEmbedLogo(false);
                    setLogo(null);
                }
            }}>
              <option value="url">URL / Website</option>
              <option value="wifi">WiFi</option>
              <option value="phone">Phone Number</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="upi">UPI Payment</option>
            </select>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Content
            </h3>

            {qrType === 'url' && (
              <div>
                <label>URL</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                />
                 {/* Favicon Toggle */}
                 <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={useFavicon}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setUseFavicon(checked);
                                if (checked) {
                                    // Trigger fetch immediately if data exists
                                    if(qrData) fetchFavicon(qrData);
                                } else {
                                    // Turn off logo embedding if unchecking favicon, 
                                    // reverting to state before or just clearing it.
                                    setEmbedLogo(false);
                                    setLogo(null);
                                }
                            }}
                        />
                        Use Website Favicon as Logo
                        {fetchingFavicon && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(Loading...)</span>}
                    </label>
                 </div>
              </div>
            )}

            {qrType === 'wifi' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label>Network Name (SSID)</label>
                  <input
                    type="text"
                    placeholder="My WiFi"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label>Password</label>
                  <input
                    type="text"
                    placeholder="password123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label>Encryption</label>
                  <select value={encryption} onChange={(e) => setEncryption(e.target.value)}>
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                  </select>
                </div>
              </>
            )}

            {qrType === 'phone' && (
              <div>
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}

            {qrType === 'sms' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label>Message</label>
                  <textarea
                    placeholder="Your message here"
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}

            {qrType === 'email' && (
              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            {qrType === 'whatsapp' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label>Phone Number (with country code)</label>
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label>Message</label>
                  <textarea
                    placeholder="Your message here"
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}

            {qrType === 'upi' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label>UPI ID</label>
                  <input
                    type="text"
                    placeholder="username@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label>Payee Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={upiName}
                    onChange={(e) => setUpiName(e.target.value)}
                  />
                </div>
                <div>
                  <label>Amount (optional)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Style & Design
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
               <label style={{ marginBottom: '0.75rem', display: 'block' }}>Shape</label>
               <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                 {[
                   { id: 'squares', label: 'Square', icon: '⬛' },
                   { id: 'rounded', label: 'Rounded', icon: '▢' },
                   { id: 'extra-rounded', label: 'Smooth', icon: '◯' }, // Using Circle icon to represent smooth/extra rounded
                   { id: 'dots', label: 'Dots', icon: '●' },
                   { id: 'classy', label: 'Classy', icon: '❖' }
                 ].map((style) => (
                   <button
                     key={style.id}
                     onClick={() => setQrStyle(style.id as QRStyle)}
                     className={`btn ${qrStyle === style.id ? 'btn-primary' : 'btn-secondary'}`}
                     style={{ 
                       display: 'flex', 
                       flexDirection: 'column', 
                       alignItems: 'center', 
                       justifyContent: 'center',
                       width: '60px',
                       height: '60px',
                       padding: '0.25rem',
                       fontSize: '0.8rem'
                     }}
                     title={style.label}
                   >
                     <span style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{style.icon}</span>
                   </button>
                 ))}
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Foreground</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    style={{ width: '30px', height: '30px', padding: 0, border: 'none', background: 'none' }}
                  />
                  <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{fgColor}</span>
                </div>
              </div>
              <div>
                <label>Background</label>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{ width: '30px', height: '30px', padding: 0, border: 'none', background: 'none' }}
                  />
                   <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{bgColor}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Margin (Quiet Zone)</label>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={embedLogo}
                  onChange={(e) => {
                      setEmbedLogo(e.target.checked);
                      if (useFavicon && !e.target.checked) {
                          setUseFavicon(false); // Unchecking embed logo also turns off favicon mode
                      }
                  }}
                />
                Embed Logo
              </label>
            </div>

            {embedLogo && (
              <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label>Upload Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        setLogo(e.target.files?.[0] || null);
                        setUseFavicon(false); // Manual upload overrides favicon mode
                    }}
                    style={{ fontSize: '0.9rem' }}
                  />
                </div>
                {logo && (
                  <div>
                    <label>Logo Size: {Math.round(logoSize * 100)}%</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.4"
                      step="0.05"
                      value={logoSize}
                      onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={() => generateQR(false)} style={{ width: '100%' }}>
            Generate QR Code
          </button>
        </div>

        <div>
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Preview
            </h3>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              background: 'var(--border)',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <canvas 
                ref={canvasRef} 
                style={{ 
                  maxWidth: '100%',
                  display: qrUrl ? 'block' : 'none'
                }} 
              />
              {!qrUrl && (
                <p style={{ opacity: 0.5 }}>QR code will appear here</p>
              )}
            </div>

            {qrUrl && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => downloadQR('png')}
                  style={{ flex: 1 }}
                >
                  Download PNG
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => downloadQR('svg')}
                  style={{ flex: 1 }}
                >
                  Download SVG
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
