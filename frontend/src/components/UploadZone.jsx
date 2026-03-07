import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCamera, IconUpload, IconScan, IconX } from './Icons.jsx';
import './UploadZone.css';

const isElectron = typeof window !== 'undefined' && window.electronAPI;

// CSS-only scene thumbnail data (no emojis, just gradients + labels)
const SAMPLE_SCENES = [
  { label: 'Desert', gradient: 'linear-gradient(135deg, #c2a060 0%, #8B6914 100%)' },
  { label: 'Battle', gradient: 'linear-gradient(135deg, #8B3014 0%, #5a1a08 100%)' },
  { label: 'Night City', gradient: 'linear-gradient(135deg, #1a1a4e 0%, #0a0a2e 100%)' },
];

// History sidebar — CSS gradient cards, no emojis
const FAUX_HISTORY = [
  { label: 'Spacesuit Scene',   gradient: 'linear-gradient(135deg, #0d2a4a, #1e3a5f)' },
  { label: 'Stranded on Mars',  gradient: 'linear-gradient(135deg, #4a1e0d, #8B3014)' },
  { label: 'The Agent',         gradient: 'linear-gradient(135deg, #0d1a40, #1a2a5f)' },
  { label: 'One World',         gradient: 'linear-gradient(135deg, #0d3020, #103020)' },
  { label: 'The Man Worker',    gradient: 'linear-gradient(135deg, #2a1a30, #1a0d2a)' },
  { label: 'The Minds Moment',  gradient: 'linear-gradient(135deg, #1a2a1a, #0d2a20)' },
];

function SceneThumb({ label, gradient }) {
  return (
    <div className="uz-thumb" style={{ background: gradient }} title={label}>
      <div className="uz-thumb-overlay">
        <span className="uz-thumb-label">{label}</span>
      </div>
    </div>
  );
}

function HistoryCard({ label, gradient }) {
  return (
    <div className="hs-item" style={{ background: gradient }} title={label}>
      <div className="hs-filmstrip">
        {[...Array(3)].map((_, i) => <span key={i} className="hs-hole" />)}
      </div>
      <span className="hs-label">{label}</span>
    </div>
  );
}

export default function UploadZone({ onImageSelect, onIdentify, isLoading }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isElectron && window.electronAPI?.onScreenCaptured) {
      window.electronAPI.onScreenCaptured((dataUrl) => handleDataUrl(dataUrl));
      return () => window.electronAPI.removeScreenCapturedListener?.();
    }
  }, []);

  useEffect(() => {
    const onPaste = (e) => {
      const item = Array.from(e.clipboardData?.items || []).find(i => i.type.startsWith('image/'));
      if (item) processFile(item.getAsFile());
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  const handleDataUrl = (dataUrl) => {
    setPreview(dataUrl);
    setImageBase64(dataUrl.replace(/^data:image\/[a-z]+;base64,/, ''));
    onImageSelect?.(dataUrl);
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => handleDataUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  }, []);

  const handleClear = () => { setPreview(null); setImageBase64(null); };

  return (
    <div className="uz-outer">
      {/* Header row */}
      <div className="uz-header">
        <div className="uz-header-label">
          <IconUpload size={16} color="var(--cyan)" />
          Drag, Drop or Upload an Image to identify the movie
        </div>
        <motion.button
          className="btn btn-cyan scan-btn"
          onClick={() => preview && onIdentify?.(imageBase64)}
          disabled={!preview || isLoading}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          {isLoading
            ? <><span className="spinner" /> Scanning...</>
            : <><IconScan size={15} color="#060d1a" /> Scan</>
          }
        </motion.button>
      </div>

      <div className="uz-body">
        {/* Left: drop zone */}
        <div
          className={`uz-dropzone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-preview' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !preview && fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*"
            onChange={(e) => processFile(e.target.files[0])} className="uz-hidden-input" />

          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div key="preview" className="uz-preview-wrap"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <img src={preview} alt="Preview" className="uz-preview-img" />
                <button className="uz-clear" onClick={(e) => { e.stopPropagation(); handleClear(); }}>
                  <IconX size={13} color="#fff" />
                </button>
              </motion.div>
            ) : (
              <motion.div key="empty" className="uz-empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* Camera icon with cyan glow ring */}
                <div className="uz-camera-wrap">
                  <div className="uz-camera-ring" />
                  <div className="uz-camera-ring uz-camera-ring-2" />
                  <div className="uz-camera-svg">
                    <IconCamera size={34} color="var(--cyan)" />
                  </div>
                </div>

                <p className="uz-cta">Click to select file or drag scene here</p>
                <p className="uz-hint">Supports JPG, PNG, WEBP (Max 15MB)</p>

                {/* Sample scenes strip */}
                <div className="uz-samples">
                  <span className="uz-samples-label">Try these scenes:</span>
                  <div className="uz-sample-thumbs">
                    {SAMPLE_SCENES.map((s) => (
                      <SceneThumb key={s.label} {...s} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Past Search History */}
        <div className="uz-history-panel">
          <h4 className="uz-history-title">Past Search History</h4>
          <div className="hs-grid">
            {FAUX_HISTORY.map((item) => (
              <HistoryCard key={item.label} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
