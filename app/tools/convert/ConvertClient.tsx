'use client';

import { useState, useRef } from 'react';
import BackButton from '../../components/BackButton';

interface ProcessedImage {
  name: string;
  url: string;
  blob: Blob;
}

export default function ConvertClient() {
  const [images, setImages] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [format, setFormat] = useState<string>('png');
  const [quality, setQuality] = useState<number>(0.9);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    setImages(prev => [...prev, ...imageFiles]);
    setProcessedImages([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const convertImages = async () => {
    if (images.length === 0) {
      alert('Please select images first');
      return;
    }

    setLoading(true);
    const converted: ProcessedImage[] = [];

    for (const image of images) {
      try {
        const img = new Image();
        const url = URL.createObjectURL(image);
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        // Calculate dimensions
        let targetWidth = img.width;
        let targetHeight = img.height;

        const w = parseInt(width);
        const h = parseInt(height);

        if (!isNaN(w) && !isNaN(h)) {
          targetWidth = w;
          targetHeight = h;
        } else if (!isNaN(w)) {
          targetWidth = w;
          targetHeight = (img.height / img.width) * w;
        } else if (!isNaN(h)) {
          targetHeight = h;
          targetWidth = (img.width / img.height) * h;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        // Use high quality image interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        URL.revokeObjectURL(url);

        const blob = await new Promise<Blob>((resolve) => {
          if (format === 'ico') {
            const isResizing = !isNaN(w) || !isNaN(h);
            const icoCanvas = document.createElement('canvas');
            icoCanvas.width = isResizing ? targetWidth : 32;
            icoCanvas.height = isResizing ? targetHeight : 32;
            const icoCtx = icoCanvas.getContext('2d');
            if (icoCtx) {
              icoCtx.drawImage(img, 0, 0, icoCanvas.width, icoCanvas.height);
              icoCanvas.toBlob((b) => resolve(b!), 'image/png');
            }
          } else {
            const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
            const q = (format === 'jpg' || format === 'webp') ? quality : undefined;
            canvas.toBlob((b) => resolve(b!), mimeType, q);
          }
        });

        const newName = image.name.replace(/\.[^/.]+$/, `.${format}`);
        converted.push({
          name: newName,
          url: URL.createObjectURL(blob),
          blob
        });
      } catch (error) {
        console.error('Error converting image:', error);
      }
    }

    setProcessedImages(converted);
    setLoading(false);
  };

  const downloadSingle = async (img: ProcessedImage) => {
    const { saveAs } = await import('file-saver');
    saveAs(img.blob, img.name);
  };

  const downloadAll = async () => {
    if (processedImages.length === 0) return;
    
    if (processedImages.length === 1) {
      downloadSingle(processedImages[0]);
      return;
    }

    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');

    const zip = new JSZip();
    processedImages.forEach(img => {
      zip.file(img.name, img.blob);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `converted-images.zip`);
  };

  const reset = () => {
    processedImages.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setProcessedImages([]);
    setWidth('');
    setHeight('');
  };

  return (
    <div>
      <BackButton />
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Image Format Converter
      </h1>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
        Convert images between JPEG, PNG, WEBP, BMP, and ICO formats
      </p>

      {/* Drop Zone - Only visible when no images are selected */}
      {images.length === 0 ? (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Drag & drop images here or click to browse
            </p>
            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>
              Supports: JPEG, PNG, WEBP, BMP, ICO
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      ) : (
        /* Live Preview Section */
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
               Selected Images ({images.length})
             </h3>
             <button className="btn btn-secondary" onClick={reset}>
                Change Images
             </button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '0.5rem'
          }}>
            {images.map((file, idx) => (
              <div key={idx} style={{ 
                overflow: 'hidden', 
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                background: 'var(--background)',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{ 
                  width: '100%', 
                  height: '120px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginBottom: '0.5rem'
                }}>
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={file.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                    onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                  />
                </div>
                <p style={{ fontSize: '0.8rem', opacity: 0.8, textAlign: 'center', wordBreak: 'break-all' }}>
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings & Actions - Always visible if images are selected, but disabled if not */}
      <div className="card" style={{ marginBottom: '2rem', opacity: images.length === 0 ? 0.5 : 1, pointerEvents: images.length === 0 ? 'none' : 'auto' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Conversion Settings
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Output Format</label>
            <select style={{ width: '100%' }} value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="png">PNG</option>
              <option value="jpg">JPEG</option>
              <option value="webp">WEBP</option>
              <option value="bmp">BMP</option>
              <option value="ico">ICO (32x32)</option>
            </select>
          </div>

          {(format === 'jpg' || format === 'webp') && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Quality: {Math.round(quality * 100)}%</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
           <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Resize Images (Optional)</h4>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div>
               <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.8 }}>Width (px)</label>
               <input 
                 type="number" 
                 placeholder="Auto" 
                 value={width} 
                 onChange={(e) => setWidth(e.target.value)}
                 style={{ width: '100%' }}
               />
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.8 }}>Height (px)</label>
               <input 
                 type="number" 
                 placeholder="Auto" 
                 value={height} 
                 onChange={(e) => setHeight(e.target.value)}
                 style={{ width: '100%' }}
               />
             </div>
           </div>
           <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem' }}>
             Leave one blank to maintain aspect ratio. Leave both blank to keep original size.
           </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={convertImages} disabled={loading || images.length === 0}>
          {loading ? 'Converting...' : 'Convert Images'}
        </button>
        {images.length > 0 && (
          <button className="btn btn-secondary" onClick={reset}>
            Clear All
          </button>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div className="spinner"></div>
        </div>
      )}

      {processedImages.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
              Converted Images ({processedImages.length})
            </h3>
            <button className="btn btn-primary" onClick={downloadAll}>
              {processedImages.length > 1 ? 'Download All (ZIP)' : 'Download'}
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {processedImages.map((img, idx) => (
              <div key={idx} className="card" style={{ padding: '1rem' }}>
                <img src={img.url} alt={img.name} style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'contain',
                  marginBottom: '0.5rem',
                  background: 'var(--border)',
                  borderRadius: '0.5rem'
                }} />
                <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', wordBreak: 'break-all' }}>
                  {img.name}
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={() => downloadSingle(img)}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
