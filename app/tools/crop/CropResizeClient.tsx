'use client';

import { useState, useRef } from 'react';
import BackButton from '../../components/BackButton';

interface ProcessedImage {
  name: string;
  url: string;
  blob: Blob;
}

export default function CropResizeClient() {
  const [images, setImages] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [aspectRatio, setAspectRatio] = useState<string>('free');
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [quality, setQuality] = useState<number>(0.9);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatios: Record<string, number | null> = {
    'free': null,
    '1:1': 1,
    '16:9': 16/9,
    '9:16': 9/16,
    '4:3': 4/3,
    '3:4': 3/4,
  };

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

  const processImages = async () => {
    if (images.length === 0) {
      alert('Please select images first');
      return;
    }

    setLoading(true);
    const processed: ProcessedImage[] = [];

    for (const image of images) {
      try {
        const img = new Image();
        const url = URL.createObjectURL(image);
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        let targetWidth = width;
        let targetHeight = height;

        const ratio = aspectRatios[aspectRatio];
        if (ratio !== null) {
          targetHeight = Math.round(targetWidth / ratio);
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Calculate scaling to cover the canvas
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Center the image
        const x = (targetWidth - scaledWidth) / 2;
        const y = (targetHeight - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        URL.revokeObjectURL(url);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality);
        });

        const newName = image.name.replace(/\.[^/.]+$/, '_resized.jpg');
        processed.push({
          name: newName,
          url: URL.createObjectURL(blob),
          blob
        });
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    setProcessedImages(processed);
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
    saveAs(blob, `resized-images.zip`);
  };

  const reset = () => {
    processedImages.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setProcessedImages([]);
  };

  return (
    <div>
      <BackButton />
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Crop & Resize Tool
      </h1>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
        Resize and crop images with preset aspect ratios or custom dimensions
      </p>

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
            Supports all image formats
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

        {images.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>
              Selected: {images.length} image{images.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Resize Settings
        </h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>Aspect Ratio</label>
          <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
            <option value="free">Free (Custom)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait)</option>
            <option value="4:3">4:3 (Standard)</option>
            <option value="3:4">3:4 (Portrait)</option>
          </select>
        </div>

        <div className="tools-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '1.5rem' }}>
          <div>
            <label>Width (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 800)}
              min="1"
              max="4000"
            />
          </div>
          <div>
            <label>Height (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 600)}
              min="1"
              max="4000"
              disabled={aspectRatio !== 'free'}
            />
          </div>
        </div>

        <div>
          <label>Quality: {Math.round(quality * 100)}%</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={processImages} disabled={loading || images.length === 0}>
          {loading ? 'Processing...' : 'Resize Images'}
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
              Processed Images ({processedImages.length})
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
