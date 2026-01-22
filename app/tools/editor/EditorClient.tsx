'use client';

import { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import BackButton from '../../components/BackButton';

interface ProcessedImage {
  name: string;
  url: string;
  blob: Blob;
}

export default function EditorClient() {
  const [images, setImages] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Transform State
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Crop State
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [cropImgSrc, setCropImgSrc] = useState<string>('');
  const [cropAspectRatio, setCropAspectRatio] = useState<number | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);

  // Resize State
  const [resizeWidth, setResizeWidth] = useState<string>('');
  const [resizeHeight, setResizeHeight] = useState<string>('');

  // Output State
  const [format, setFormat] = useState<string>('png');
  const [quality, setQuality] = useState<number>(0.9);

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

  // --- Cropping Logic ---

  const startCropping = async () => {
    if (images.length !== 1) return;
    
    // Generate base image with current rotation/flips baked in for WYSIWYG cropping
    const image = images[0];
    const img = new Image();
    const url = URL.createObjectURL(image);
    
    await new Promise((resolve) => { img.onload = resolve; img.src = url; });

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
        ctx.imageSmoothingQuality = 'high';
        
        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;
        const cropWidth = completedCrop.width * scaleX;
        const cropHeight = completedCrop.height * scaleY;

        ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
        
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
        const newFile = new File([blob], images[0].name.replace(/\.[^/.]+$/, '_cropped.png'), { type: 'image/png' });
        
        setImages([newFile]);
        // Reset transform state as it's now baked in
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setProcessedImages([]);
        
        setIsCropping(false);
        setCropImgSrc('');
    }
  };
  
  const cancelCrop = () => {
    setIsCropping(false);
    setCropImgSrc('');
  };

  // --- Processing Logic (Export) ---

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

        // 1. Calculate dimensions after rotation
        const rad = (rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(rad));
        const cos = Math.abs(Math.cos(rad));
        let canvasWidth = img.width * cos + img.height * sin;
        let canvasHeight = img.width * sin + img.height * cos;

        // 2. Determine Final Output Size (Resize)
        let finalWidth = canvasWidth;
        let finalHeight = canvasHeight;
        
        const targetW = parseInt(resizeWidth);
        const targetH = parseInt(resizeHeight);

        if (!isNaN(targetW) && !isNaN(targetH)) {
            finalWidth = targetW;
            finalHeight = targetH;
        } else if (!isNaN(targetW)) {
            finalWidth = targetW;
            finalHeight = (canvasHeight / canvasWidth) * targetW;
        } else if (!isNaN(targetH)) {
            finalHeight = targetH;
            finalWidth = (canvasWidth / canvasHeight) * targetH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 3. Draw with Transforms & Scaling
        // We need to map the source image (rotated/flipped) into the final destination rect
        ctx.translate(finalWidth / 2, finalHeight / 2);
        
        // Scale to fit target dimensions? 
        // If we just rotate, the canvas size changes. If we resize, we scale that result.
        // Easiest is to draw source transformed, but scaled to fit dest.
        
        // Scale factors relative to the rotated bounding box
        const scaleX = finalWidth / canvasWidth;
        const scaleY = finalHeight / canvasHeight;
        ctx.scale(scaleX, scaleY);

        ctx.rotate(rad);
        if (flipH) ctx.scale(-1, 1);
        if (flipV) ctx.scale(1, -1);

        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        URL.revokeObjectURL(url);

        const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
        const q = (format === 'jpg' || format === 'webp') ? quality : undefined;
        
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), mimeType, q);
        });

        const ext = format === 'jpeg' ? 'jpg' : format;
        const newName = image.name.replace(/\.[^/.]+$/, `_edited.${ext}`);
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

  const reset = () => {
    processedImages.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setProcessedImages([]);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setResizeWidth('');
    setResizeHeight('');
  };

  const downloadAll = async () => {
     if (processedImages.length === 0) return;
     
     const { saveAs } = await import('file-saver');

     if (processedImages.length === 1) {
       saveAs(processedImages[0].blob, processedImages[0].name);
       return;
     }

     const JSZip = (await import('jszip')).default;

     const zip = new JSZip();
     processedImages.forEach(img => zip.file(img.name, img.blob));
     const blob = await zip.generateAsync({ type: 'blob' });
     saveAs(blob, 'edited-images.zip');
  };

  return (
    <div>
      <BackButton />
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Image Editor
      </h1>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
        Rotate, Flip, Crop, Resize, and Convert images in one place
      </p>

      {/* CROP MODAL */}
      {isCropping && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Crop Image</h3>
              <select 
                value={cropAspectRatio || 'free'} 
                onChange={(e) => {
                    const val = e.target.value;
                    setCropAspectRatio(val === 'free' ? undefined : parseFloat(val));
                }}
                style={{ padding: '0.25rem' }}
              >
                  <option value="free">Free</option>
                  <option value="1">1:1 (Square)</option>
                  <option value={16/9}>16:9</option>
                  <option value={4/3}>4:3</option>
                  <option value={9/16}>9:16</option>
                  <option value={3/4}>3:4</option>
              </select>
          </div>
          <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'center', overflow: 'auto', maxHeight: '70vh' }}>
            {cropImgSrc && (
              <ReactCrop 
                crop={crop} 
                onChange={(c, p) => setCrop(p)} 
                onComplete={(c) => setCompletedCrop(c)}
                aspect={cropAspectRatio}
              >
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

      {/* MAIN UI */}
      <div style={{ display: isCropping ? 'none' : 'block' }}>
        
        {/* Upload Zone */}
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
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Drag & drop images here</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFileSelect(e.target.files)} style={{ display: 'none' }} />
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: '2rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Preview ({images.length})</h3>
                 <button className="btn btn-secondary" onClick={reset}>Change Images</button>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                {images.map((file, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem', textAlign: 'center' }}>
                        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '0.5rem' }}>
                            <img 
                                src={URL.createObjectURL(file)} 
                                style={{ 
                                    maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                                    transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, 1) scale(1, ${flipV ? -1 : 1})`,
                                    transition: 'transform 0.3s'
                                }} 
                                onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                            />
                        </div>
                        <p style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                    </div>
                ))}
             </div>
          </div>
        )}

        {/* EDITOR CONTROLS used to be separate cards, now consolidated */}
        <div className="card" style={{ marginBottom: '2rem', opacity: images.length === 0 ? 0.5 : 1, pointerEvents: images.length === 0 ? 'none' : 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Editor Tools</h3>
            
            {/* 1. Rotate & Flip */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', opacity: 0.9 }}>Rotate & Flip</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => setRotation((r) => (r - 90) % 360)}>↺ -90°</button>
                    <button className="btn btn-secondary" onClick={() => setRotation((r) => (r + 90) % 360)}>↻ +90°</button>
                    <button className="btn btn-secondary" onClick={() => setFlipH(!flipH)}>↔ Flip H</button>
                    <button className="btn btn-secondary" onClick={() => setFlipV(!flipV)}>↕ Flip V</button>
                </div>
                <input type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>

            <hr style={{ borderColor: 'var(--border)', margin: '2rem 0', opacity: 0.5 }} />

            {/* 2. Crop */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', opacity: 0.9 }}>Crop</h4>
                <button 
                    className="btn btn-secondary" 
                    onClick={startCropping}
                    disabled={images.length !== 1}
                    style={{ width: '100%' }}
                >
                    ✂️ Crop Image {images.length !== 1 && '(Select exactly 1 image)'}
                </button>
            </div>

            <hr style={{ borderColor: 'var(--border)', margin: '2rem 0', opacity: 0.5 }} />

            {/* 3. Resize */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', opacity: 0.9 }}>Resize (Optional)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Width (px)</label>
                        <input type="number" placeholder="Auto" value={resizeWidth} onChange={(e) => setResizeWidth(e.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Height (px)</label>
                        <input type="number" placeholder="Auto" value={resizeHeight} onChange={(e) => setResizeHeight(e.target.value)} style={{ width: '100%' }} />
                    </div>
                </div>
            </div>

            <hr style={{ borderColor: 'var(--border)', margin: '2rem 0', opacity: 0.5 }} />

            {/* 4. Output Settings */}
            <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', opacity: 0.9 }}>Output Format</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <select value={format} onChange={(e) => setFormat(e.target.value)} style={{ flex: 1 }}>
                        <option value="png">PNG</option>
                        <option value="jpg">JPEG</option>
                        <option value="webp">WEBP</option>
                    </select>
                    {(format === 'jpg' || format === 'webp') && (
                        <div style={{ flex: 1 }}>
                             <label style={{ marginRight: '0.5rem' }}>Quality: {Math.round(quality * 100)}%</label>
                             <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button className="btn btn-primary" onClick={processImages} disabled={loading || images.length === 0}>
                {loading ? 'Processing...' : 'Export Image'}
            </button>
            {images.length > 0 && <button className="btn btn-secondary" onClick={reset}>Reset All</button>}
        </div>

        {/* RESULTS */}
        {processedImages.length > 0 && (
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Results</h3>
                    <button 
                        className="btn btn-primary" 
                        onClick={async () => {
                             const { saveAs } = await import('file-saver');
                             if (processedImages.length === 1) {
                                saveAs(processedImages[0].blob, processedImages[0].name);
                             } else {
                                downloadAll();
                             }
                        }}
                    >
                        Download All
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {processedImages.map((img, idx) => (
                        <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem' }}>
                            <img src={img.url} style={{ width: '100%', height: '150px', objectFit: 'contain', marginBottom: '0.5rem' }} />
                            <p style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{img.name}</p>
                            <button 
                                className="btn btn-secondary" 
                                onClick={async () => {
                                    const { saveAs } = await import('file-saver');
                                    saveAs(img.blob, img.name);
                                }} 
                                style={{ width: '100%', marginTop: '0.5rem' }}>Download</button>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
