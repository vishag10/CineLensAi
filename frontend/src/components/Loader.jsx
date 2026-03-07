import React from 'react';
import { motion } from 'framer-motion';
import { IconMicroscope, IconBrain, IconGlobe, IconCompile, IconFilm, IconCheck } from './Icons.jsx';
import './Loader.css';

const steps = [
  { id: 1, Icon: IconMicroscope, label: 'Analyzing visual elements',  sublabel: 'Color palette, costumes, setting...' },
  { id: 2, Icon: IconBrain,      label: 'Reasoning with AI vision',   sublabel: 'Llama 3.2 Vision processing...' },
  { id: 3, Icon: IconGlobe,      label: 'Verifying with web search',  sublabel: 'DuckDuckGo cross-reference...' },
  { id: 4, Icon: IconCompile,    label: 'Compiling results',          sublabel: 'Generating final answer...' },
];

export default function Loader({ currentStep = 1 }) {
  return (
    <motion.div
      className="loader-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated film reel rings */}
      <div className="loader-reel">
        <motion.div className="reel-ring reel-ring-1"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="reel-ring reel-ring-2"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="reel-icon"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}>
          <IconFilm size={28} color="var(--cyan)" />
        </motion.div>
      </div>

      <motion.h3 className="loader-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        Identifying your movie...
      </motion.h3>

      <div className="loader-steps">
        {steps.map(({ id, Icon, label, sublabel }, index) => {
          const isDone   = id < currentStep;
          const isActive = id === currentStep;
          return (
            <motion.div
              key={id}
              className={`loader-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.13 }}
            >
              <div className="step-icon-wrap">
                {isDone ? (
                  <motion.div className="step-check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <IconCheck size={16} color="#22C55E" />
                  </motion.div>
                ) : (
                  <Icon size={18} color={isActive ? 'var(--cyan)' : 'var(--text-muted)'} />
                )}
                {isActive && (
                  <motion.div className="step-pulse"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity }} />
                )}
              </div>
              <div className="step-text">
                <span className="step-label">{label}</span>
                {isActive && (
                  <motion.span className="step-sublabel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {sublabel}
                  </motion.span>
                )}
              </div>
              {isActive && (
                <motion.div className="step-progress"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }} />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
