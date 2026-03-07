import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import UploadZone from '../components/UploadZone.jsx';
import Loader from '../components/Loader.jsx';
import ResultCard from '../components/ResultCard.jsx';
import './Home.css';

const STEPS_TIMING = [1500, 3500, 5500];

export default function Home() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaderStep, setLoaderStep] = useState(1);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handleIdentify = async (base64Image) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setLoaderStep(1);
    timers.current.forEach(clearTimeout);
    timers.current = STEPS_TIMING.map((d, i) =>
      setTimeout(() => setLoaderStep(i + 2), d)
    );

    try {
      const res = await axios.post('/api/identify', { image: base64Image, useSearch: true });
      timers.current.forEach(clearTimeout);
      setLoaderStep(4);
      await new Promise(r => setTimeout(r, 350));
      setResult(res.data.result);
    } catch (err) {
      timers.current.forEach(clearTimeout);
      const msg = err.response?.data?.error || err.message;
      const hint = err.response?.data?.hint;
      setError(hint ? `${msg}\n\nHint: ${hint}` : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page page">
      {/* Page title */}
      <motion.h1
        className="home-title"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Discover Movies from Scenes
      </motion.h1>

      {/* Upload / Loader */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader currentStep={loaderStep} />
          </motion.div>
        ) : (
          <motion.div key="uploader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <UploadZone onIdentify={handleIdentify} isLoading={isLoading} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && !isLoading && (
        <motion.div className="home-error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <span>⚠️</span>
          <div>
            <strong>Error</strong>
            <pre>{error}</pre>
          </div>
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && !isLoading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <ResultCard result={result} />
            <div className="home-result-actions">
              <button className="btn btn-ghost" onClick={() => setResult(null)}>✕ Clear result</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
