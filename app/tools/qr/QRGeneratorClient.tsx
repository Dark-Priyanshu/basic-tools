'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import BackButton from '../../components/BackButton';
// We will dynamically import QRCodeStyling to avoid SSR issues
// import QRCodeStyling from 'qr-code-styling';

type QRType = 'url' | 'wifi' | 'phone' | 'sms' | 'email' | 'whatsapp' | 'upi';

// qr-code-styling types
type DotType = 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
type CornerSquareType = 'dot' | 'square' | 'extra-rounded';
type CornerDotType = 'dot' | 'square';

export default function QRGeneratorClient() {
  const [qrType, setQrType] = useState<QRType>('url');
  const [qrData, setQrData] = useState<string>('');
  
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
  
  // Advanced Style options
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [margin, setMargin] = useState<number>(10); // Default margin for this lib is usually pixels
  
  // Shapes
  const [dotsStyle, setDotsStyle] = useState<DotType>('square');
  const [markerBorderStyle, setMarkerBorderStyle] = useState<CornerSquareType>('square');
  const [markerCenterStyle, setMarkerCenterStyle] = useState<CornerDotType>('square');

  // Logo
  const [embedLogo, setEmbedLogo] = useState<boolean>(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoSize, setLogoSize] = useState<number>(0.4);

  // Favicon specific state
  const [useFavicon, setUseFavicon] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fetchingFavicon, setFetchingFavicon] = useState<boolean>(false);
  
  // Container ref for the library to append the canvas
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

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

  const fetchFavicon = useCallback(async (urlInput: string) => {
    if (!urlInput) return;
    
    setFetchingFavicon(true);
    let normalizedUrl = urlInput;
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      const urlObj = new URL(normalizedUrl);
      const domain = urlObj.hostname;
      
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      const proxyUrl = `/api/favicon?url=${encodeURIComponent(googleFaviconUrl)}`;
      
      try {
        const response = await fetch(proxyUrl);
        if (response.ok) {
           const blob = await response.blob();
           const file = new File([blob], "favicon.png", { type: blob.type || "image/png" });
           setLogoFile(file);
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
  }, []);

  // Convert File to Object URL when it changes
  useEffect(() => {
    if (logoFile) {
        const url = URL.createObjectURL(logoFile);
        setLogoUrl(url);
        return () => URL.revokeObjectURL(url);
    } else {
        setLogoUrl('');
    }
  }, [logoFile]);

  useEffect(() => {
    if (qrType === 'url' && useFavicon) {
        const timer = setTimeout(() => {
            if (qrData) {
                fetchFavicon(qrData);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [qrData, useFavicon, qrType, fetchFavicon]);


  // Initialize and Update QR Code
  useEffect(() => {
    const updateQR = async () => {
        if (!qrCodeRef.current) return;

        const QRCodeStyling = (await import('qr-code-styling')).default;

        const data = generateQRData();
        const currentLogo = embedLogo ? logoUrl : undefined;
        
        // Auto-adjust Error Correction
        // Rule: If logo OR heavy styling enabled -> H. Default -> M.
        // Actually, for readability with fancy shapes, H or Q is often safer.
        // Let's use H if logo is present or non-square dots used.
        const isComplexStyle = dotsStyle !== 'square' || markerBorderStyle !== 'square';
        const errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = (embedLogo || isComplexStyle) ? 'H' : 'M';

        const options = {
            width: 400,
            height: 400,
            type: 'canvas' as const,
            data: data || ' ', // Space as placeholder if empty to prevent errors
            image: currentLogo,
            margin: margin,
            dotsOptions: {
                color: fgColor,
                type: dotsStyle
            },
            backgroundOptions: {
                color: bgColor,
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 10,
                imageSize: logoSize
            },
            cornersSquareOptions: {
                color: fgColor,
                type: markerBorderStyle
            },
            cornersDotOptions: {
                color: fgColor,
                type: markerCenterStyle
            },
            qrOptions: {
                errorCorrectionLevel: errorCorrectionLevel
            }
        };

        if (!qrCodeInstance.current) {
            qrCodeInstance.current = new QRCodeStyling(options);
            qrCodeInstance.current.append(qrCodeRef.current);
        } else {
            qrCodeInstance.current.update(options);
        }
    };

    const timer = setTimeout(() => {
        updateQR();
    }, 100); // Debounce slightly
    return () => clearTimeout(timer);

  }, [generateQRData, fgColor, bgColor, dotsStyle, markerBorderStyle, markerCenterStyle, embedLogo, logoUrl, logoSize, margin]);

  const downloadQR = async (format: 'png' | 'svg' | 'jpeg') => {
      if (!qrCodeInstance.current) return;
      await qrCodeInstance.current.download({ name: 'qrcode', extension: format });
  };

  // UI Components
  return (
    <div>
      <BackButton />
      {toastMessage && (
        <div style={{
            position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#ef4444', color: 'white',
            padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000
        }}>
            {toastMessage}
        </div>
      )}

      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>QR Code Generator</h1>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>Generate customizable QR codes with advanced styling.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* 1. Type Section */}
            <div className="card">
                <h3 className="section-title">QR Code Type</h3>
                <select value={qrType} onChange={(e) => {
                    setQrType(e.target.value as QRType);
                    if (useFavicon) { setUseFavicon(false); setEmbedLogo(false); setLogoFile(null); }
                }} style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}>
                    <option value="url">URL / Website</option>
                    <option value="wifi">WiFi</option>
                    <option value="phone">Phone Number</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="upi">UPI Payment</option>
                </select>
            </div>

            {/* 2. Content Section */}
            <div className="card">
                <h3 className="section-title">Content</h3>
                {qrType === 'url' && (
                    <>
                        <label>URL</label>
                        <input type="text" placeholder="https://example.com" value={qrData} onChange={(e) => setQrData(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={useFavicon} onChange={(e) => {
                                setUseFavicon(e.target.checked);
                                if (e.target.checked && qrData) fetchFavicon(qrData);
                                if (!e.target.checked) { setEmbedLogo(false); setLogoFile(null); }
                            }} /> Use Website Favicon {fetchingFavicon && '(Loading...)'}
                        </label>
                    </>
                )}
                {/* Other Inputs (Hidden for brevity, mapped from original logic logic) */}
                {qrType === 'wifi' && (
                    <>
                        <input type="text" placeholder="SSID" value={ssid} onChange={(e) => setSsid(e.target.value)} style={{display:'block', width:'100%', marginBottom:'0.5rem'}} />
                        <input type="text" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{display:'block', width:'100%', marginBottom:'0.5rem'}} />
                        <select value={encryption} onChange={(e) => setEncryption(e.target.value)} style={{width:'100%'}}>
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">None</option>
                        </select>
                    </>
                )}
                {/* Add other inputs back essentially as they were */}
                {(qrType === 'phone' || qrType === 'sms' || qrType === 'whatsapp') && (
                     <input type="tel" placeholder="+1234567890" value={phone} onChange={(e) => setPhone(e.target.value)} style={{display:'block', width:'100%', marginBottom:'0.5rem'}} />
                )}
                {(qrType === 'sms' || qrType === 'whatsapp') && (
                     <textarea placeholder="Message" value={qrType === 'sms' ? smsMessage : whatsappMessage} onChange={(e) => qrType === 'sms' ? setSmsMessage(e.target.value) : setWhatsappMessage(e.target.value)} style={{width:'100%'}} />
                )}
                {qrType === 'email' && (
                     <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{width:'100%'}} />
                )}
                {qrType === 'upi' && (
                     <>
                        <input type="text" placeholder="UPI ID" value={upiId} onChange={(e) => setUpiId(e.target.value)} style={{display:'block', width:'100%', marginBottom:'0.5rem'}} />
                        <input type="text" placeholder="Name" value={upiName} onChange={(e) => setUpiName(e.target.value)} style={{display:'block', width:'100%', marginBottom:'0.5rem'}} />
                        <input type="number" placeholder="Amount" value={upiAmount} onChange={(e) => setUpiAmount(e.target.value)} style={{width:'100%'}} />
                     </>
                )}
            </div>

            {/* 3. Style Section (NEW) */}
            <div className="card">
                <h3 className="section-title">Style & Design</h3>
                
                {/* Color Pickers */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label>Foreground</label>
                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} style={{display:'block', marginTop:'0.25rem'}} />
                    </div>
                    <div>
                        <label>Background</label>
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{display:'block', marginTop:'0.25rem'}} />
                    </div>
                </div>

                {/* Margin Control */}
                <div style={{ marginBottom: '1rem' }}>
                    <label>Margin (Quiet Zone)</label>
                    <input type="range" min="0" max="50" value={margin} onChange={(e) => setMargin(Number(e.target.value))} style={{width:'100%'}} />
                </div>

                {/* Body Shape */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{fontWeight:'bold', marginBottom:'0.5rem', display:'block'}}>Dots Style</label>
                    <div className="style-grid">
                        {['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'].map((s) => (
                            <button key={s} className={`style-btn ${dotsStyle === s ? 'active' : ''}`} onClick={() => setDotsStyle(s as DotType)} title={s}>
                                {/* Visual representation would be ideal, using text for now or simple unicode */}
                                <div className={`preview-icon dot-${s}`}></div>
                                <span style={{fontSize:'0.7rem', textTransform:'capitalize'}}>{s.replace('-', ' ')}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Marker Border */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{fontWeight:'bold', marginBottom:'0.5rem', display:'block'}}>Marker Border</label>
                    <div className="style-grid">
                        {['square', 'extra-rounded', 'dot'].map((s) => (
                            <button key={s} className={`style-btn ${markerBorderStyle === s ? 'active' : ''}`} onClick={() => setMarkerBorderStyle(s as CornerSquareType)} title={s}>
                                <div className={`preview-icon border-${s}`}></div>
                                <span style={{fontSize:'0.7rem', textTransform:'capitalize'}}>{s.replace('-', ' ')}</span>
                            </button>
                        ))}
                    </div>
                </div>

                 {/* Marker Center */}
                 <div style={{ marginBottom: '1rem' }}>
                    <label style={{fontWeight:'bold', marginBottom:'0.5rem', display:'block'}}>Marker Center</label>
                    <div className="style-grid">
                        {['square', 'dot'].map((s) => (
                            <button key={s} className={`style-btn ${markerCenterStyle === s ? 'active' : ''}`} onClick={() => setMarkerCenterStyle(s as CornerDotType)} title={s}>
                                <div className={`preview-icon center-${s}`}></div>
                                <span style={{fontSize:'0.7rem', textTransform:'capitalize'}}>{s}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Logo Section */}
                <div>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom:'0.5rem' }}>
                        <input type="checkbox" checked={embedLogo} onChange={(e) => {
                             setEmbedLogo(e.target.checked);
                             if (!e.target.checked && useFavicon) setUseFavicon(false);
                        }} />
                        Embed Logo
                    </label>
                    {embedLogo && (
                       <div style={{paddingLeft:'1rem'}}>
                           <input type="file" accept="image/*" onChange={(e) => {
                               setLogoFile(e.target.files?.[0] || null);
                               setUseFavicon(false);
                           }} style={{fontSize:'0.8rem', marginBottom:'0.5rem'}} />
                           <label style={{fontSize:'0.8rem'}}>Logo Size</label>
                           <input type="range" min="0.1" max="0.5" step="0.05" value={logoSize} onChange={(e) => setLogoSize(parseFloat(e.target.value))} style={{width:'100%'}} />
                       </div>
                    )}
                </div>

            </div>

        </div>

        {/* Right Column: Preview */}
        <div>
             <div className="card" style={{position:'sticky', top:'20px'}}>
                <h3 className="section-title">Preview</h3>
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    minHeight: '400px', background: '#f5f5f5', borderRadius: '0.5rem', marginBottom: '1rem', padding: '20px'
                }}>
                    <div ref={qrCodeRef} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" style={{flex:1}} onClick={() => downloadQR('png')}>Download PNG</button>
                    <button className="btn btn-secondary" style={{flex:1}} onClick={() => downloadQR('svg')}>Download SVG</button>
                </div>
             </div>
        </div>

      </div>

      <style jsx>{`
        .section-title { font-size: 1.25rem; fontWeight: 600; margin-bottom: 1rem; }
        .style-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
        .style-btn {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 0.5rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--background);
            cursor: pointer; transition: all 0.2s;
        }
        .style-btn.active { border-color: var(--primary); background: rgba(var(--primary-rgb), 0.1); }
        .preview-icon { width: 24px; height: 24px; background: currentColor; margin-bottom: 4px; }
        
        /* CSS Mini-Icons for Buttons */
        .dot-square { border-radius: 0px; }
        .dot-rounded { border-radius: 4px; }
        .dot-dots { border-radius: 50%; }
        .dot-extra-rounded { border-radius: 8px; }
        .dot-classy { border-radius: 0px 8px 0px 8px; }
        .dot-classy-rounded { border-radius: 2px 8px 2px 8px; }

        .border-square { border: 3px solid currentColor; background: transparent; }
        .border-extra-rounded { border: 3px solid currentColor; background: transparent; border-radius: 8px; }
        .border-dot { border: 3px solid currentColor; background: transparent; border-radius: 50%; }

        .center-square { border-radius: 0px; }
        .center-dot { border-radius: 50%; }
      `}</style>
    </div>
  );
}
