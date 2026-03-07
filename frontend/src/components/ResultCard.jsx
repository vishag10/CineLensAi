import React from 'react';
import { motion } from 'framer-motion';
import {
  IconNetflix, IconHBO, IconPrime, IconAppleTV, IconYouTube, IconPlex,
  IconStar, IconFilm
} from './Icons.jsx';
import './ResultCard.css';

const STREAMING_ROW1 = [
  { name: 'Apple TV',    Icon: IconAppleTV },
  { name: 'YouTube',     Icon: IconYouTube },
  { name: 'Plex',        Icon: IconPlex },
];
const STREAMING_ROW2 = [
  { name: 'Netflix',     Icon: IconNetflix },
  { name: 'HBO Max',     Icon: IconHBO },
  { name: 'Prime Video', Icon: IconPrime },
];

function StarRating({ score = 8.0 }) {
  const filled = Math.round((score / 10) * 5);
  return (
    <div className="rc-stars">
      {[...Array(5)].map((_, i) => (
        <IconStar key={i} size={13} color="#22D3EE" filled={i < filled} />
      ))}
      <span className="rc-rating-num">{score}</span>
    </div>
  );
}

function ConfidenceBar({ value }) {
  return (
    <div className="rc-conf-wrap">
      <span className="rc-conf-label">Match Confidence: <strong>{value}%</strong></span>
      <div className="rc-conf-track">
        <motion.div
          className="rc-conf-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
}

function StreamingSection({ label, platforms }) {
  return (
    <div className="rc-watch-section">
      <span className="rc-watch-label">{label}</span>
      <div className="rc-stream-row">
        {platforms.map(({ name, Icon }) => (
          <div key={name} className="rc-stream-icon" title={name}>
            <Icon size={36} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Movie poster placeholder — uses CSS gradient based on genre
const POSTER_GRADIENTS = {
  'Sci-Fi':       'linear-gradient(160deg, #1e3a5f 0%, #0a1a30 100%)',
  'Action':       'linear-gradient(160deg, #3b1515 0%, #1a0808 100%)',
  'Drama':        'linear-gradient(160deg, #1e2a3b 0%, #0d141e 100%)',
  'Horror':       'linear-gradient(160deg, #1a0a0a 0%, #0a0505 100%)',
  'Comedy':       'linear-gradient(160deg, #2a2a0a 0%, #141400 100%)',
  'Thriller':     'linear-gradient(160deg, #1a1a2e 0%, #0d0d1e 100%)',
  'Fantasy':      'linear-gradient(160deg, #0a2a1a 0%, #051410 100%)',
  'Romance':      'linear-gradient(160deg, #2a1020 0%, #140a10 100%)',
  'Animation':    'linear-gradient(160deg, #2a1a00 0%, #140d00 100%)',
  'Documentary':  'linear-gradient(160deg, #1a1a1a 0%, #0d0d0d 100%)',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

export default function ResultCard({ result }) {
  if (!result) return null;
  const { title, year, director, description, confidence, genre } = result;
  const confMap = { High: 98, Medium: 75, Low: 45 };
  const confPct = confMap[confidence] || 75;
  const posterBg = POSTER_GRADIENTS[genre] || 'linear-gradient(160deg, #1a2540 0%, #0d1020 100%)';

  return (
    <motion.div className="rc-wrapper" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="rc-match-label" variants={itemVariants}>Most Likely Match:</motion.div>

      <motion.div className="rc-card" variants={itemVariants}>
        {/* Poster */}
        <div className="rc-poster" style={{ background: posterBg }}>
          <div className="rc-poster-icon">
            <IconFilm size={36} color="rgba(255,255,255,0.25)" />
          </div>
          <div className="rc-poster-filmstrip">
            {[...Array(5)].map((_, i) => <span key={i} className="rc-filmhole" />)}
          </div>
          <span className="rc-poster-title">{title}</span>
        </div>

        {/* Info */}
        <div className="rc-info">
          <motion.h2 className="rc-title" variants={itemVariants}>{title}</motion.h2>
          <motion.div className="rc-meta" variants={itemVariants}>
            {year !== 'Unknown' && <span className="rc-year">{year}</span>}
            {director !== 'Unknown' && <span className="rc-director">Director: {director}</span>}
            <StarRating score={8.0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <ConfidenceBar value={confPct} />
          </motion.div>
          {description && (
            <motion.p className="rc-desc" variants={itemVariants}>
              {description.substring(0, 180)}
              {description.length > 180 && (
                <><span>... </span><span className="rc-readmore">Read more...</span></>
              )}
            </motion.p>
          )}
        </div>

        {/* Where to watch */}
        <motion.div className="rc-watch" variants={itemVariants}>
          <StreamingSection label="Where to Watch" platforms={STREAMING_ROW1} />
          <StreamingSection label="Where to Watch" platforms={STREAMING_ROW2} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
