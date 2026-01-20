'use client';

import { useState, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import BackButton from '../../components/BackButton';

interface ProcessedImage {
  name: string;
  url: string;
  blob: Blob;
}

export default function RotateFlipPage() {
  const [images, setImages] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  // Crop state
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [cropImgSrc, setCropImgSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

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

        // Calculate canvas size based on rotation
        const rad = (rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(rad));
        const cos = Math.abs(Math.cos(rad));
        const newWidth = img.width * cos + img.height * sin;
        const newHeight = img.width * sin + img.height * cos;

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(rad);
        
        if (flipH) ctx.scale(-1, 1);
        if (flipV) ctx.scale(1, -1);

        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        URL.revokeObjectURL(url);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });

        const newName = image.name.replace(/\.[^/.]+$/, '_transformed.png');
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

  const downloadSingle = (img: ProcessedImage) => {
    saveAs(img.blob, img.name);
  };

  const downloadAll = async () => {
    if (processedImages.length === 0) return;
    
    if (processedImages.length === 1) {
      downloadSingle(processedImages[0]);
      return;
    }

    const zip = new JSZip();
    processedImages.forEach(img => {
      zip.file(img.name, img.blob);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `transformed-images.zip`);
  };

  const reset = () => {
    processedImages.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setProcessedImages([]);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const resetSettings = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setProcessedImages([]);
  };

  const startCropping = async () => {
    if (images.length !== 1) return;
    
    // Generate the base image with current rotation/flips baked in
    const image = images[0];
    const img = new Image();
    const url = URL.createObjectURL(image);
    
    await new Promise((resolve) => { img.onload = resolve; img.src = url; });

    // Bake transform
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rad = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const newWidth = img.width * cos + img.height * sin;
    const newHeight = img.width * sin + img.height * cos;

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.translate(newWidth / 2, newHeight / 2);
    ctx.rotate(rad);
    
    if (flipH) ctx.scale(-1, 1);
    if (flipV) ctx.scale(1, -1);
    
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    const blobUrl = await new Promise<string>(resolve => {
        canvas.toBlob(blob => resolve(URL.createObjectURL(blob!)));
    });
    setCropImgSrc(blobUrl);
    
    setCompletedCrop(undefined);
    setCrop(undefined);
    setIsCropping(true);
  };

  const applyCrop = async () => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
        
        // Disable smoothing for crisp crop or enable for quality? High quality usually
        ctx.imageSmoothingQuality = 'high';
        
        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;
        const cropWidth = completedCrop.width * scaleX;
        const cropHeight = completedCrop.height * scaleY;

        ctx.drawImage(
            image,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            canvas.width,
            canvas.height
        );
        
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
        const newFile = new File([blob], images[0].name.replace(/\.[^/.]+$/, '_cropped.png'), { type: 'image/png' });
        
        setImages([newFile]);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setProcessedImages([]); // Clear previous results
        
        setIsCropping(false);
        setCropImgSrc('');
    }
  };
  
  const cancelCrop = () => {
    setIsCropping(false);
    setCropImgSrc('');
  };

  return (
    <div>
      <BackButton />
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Rotate & Flip Tool
      </h1>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
        Rotate images at any angle, flip, and crop them perfectly
      </p>

      {isCropping && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Crop Image</h3>
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>Drag to select the area you want to keep.</p>
          <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'center', overflow: 'auto', maxHeight: '70vh' }}>
            {cropImgSrc && (
              <ReactCrop crop={crop} onChange={(c, p) => setCrop(p)} onComplete={(c) => setCompletedCrop(c)}>
                <img ref={imgRef} src={cropImgSrc} alt="Crop source" style={{ maxWidth: '100%', maxHeight: '60vh' }} />
              </ReactCrop>
            )}
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
             <button className="btn btn-secondary" onClick={cancelCrop}>Cancel</button>
             <button className="btn btn-primary" onClick={applyCrop}>Apply Crop</button>
          </div>
        </div>
      )}

      <div style={{ display: isCropping ? 'none' : 'block' }}>

      {/* Only show drop zone if no images are selected */}
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
        </div>
      ) : (
        /* Live Preview Section */
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
               Live Preview ({images.length})
             </h3>
             <button className="btn btn-secondary" onClick={reset}>
                Change Images
             </button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            maxHeight: '500px',
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
                  height: '150px', 
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
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease',
                      transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, 1) scale(1, ${flipV ? -1 : 1})`
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

      {/* Settings Controls - Always visible if images are selected (implied by layout, but logic ensures they are useful) */}
      <div className="card" style={{ marginBottom: '2rem', opacity: images.length === 0 ? 0.5 : 1, pointerEvents: images.length === 0 ? 'none' : 'auto' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Transformation Settings
        </h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>Quick Rotate</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setRotation((prev) => (prev + 90) % 360)}>
              +90°
            </button>
            <button className="btn btn-secondary" onClick={() => setRotation(90)}>
              90°
            </button>
            <button className="btn btn-secondary" onClick={() => setRotation(180)}>
              180°
            </button>
            <button className="btn btn-secondary" onClick={() => setRotation(270)}>
              270°
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>Smooth Rotation: {rotation}°</label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={flipH}
              onChange={(e) => setFlipH(e.target.checked)}
            />
            Flip Horizontal
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={flipV}
              onChange={(e) => setFlipV(e.target.checked)}
            />
            Flip Vertical
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={startCropping}
            disabled={images.length !== 1}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: images.length !== 1 ? 0.5 : 1 }}
          >
            <span>✂️</span> Crop Image {images.length !== 1 && '(Select strictly 1 image)'}
          </button>
        </div>

        <button className="btn btn-secondary" onClick={resetSettings}>
          Reset Settings
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={processImages} disabled={loading || images.length === 0}>
          {loading ? 'Processing...' : 'Apply Transformation'}
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
              Final Results ({processedImages.length})
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
    </div>
  );
}
