import React from 'react';
import { motion } from 'framer-motion';
import {
  IconGenreAction, IconGenreDrama, IconGenreScifi, IconGenreHorror,
  IconGenreComedy, IconGenreDefault, IconFilm, IconTrash
} from './Icons.jsx';
import './HistoryList.css';

const GENRE_CONFIG = {
  action:       { Icon: IconGenreAction,  color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
  drama:        { Icon: IconGenreDrama,   color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
  'sci-fi':     { Icon: IconGenreScifi,   color: '#22D3EE', bg: 'rgba(34,211,238,0.08)' },
  horror:       { Icon: IconGenreHorror,  color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
  comedy:       { Icon: IconGenreComedy,  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
};

function getGenreConfig(genre = '') {
  const key = Object.keys(GENRE_CONFIG).find(g => genre.toLowerCase().includes(g));
  return GENRE_CONFIG[key] || { Icon: IconGenreDefault, color: '#22D3EE', bg: 'rgba(34,211,238,0.08)' };
}

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function HistoryList({ items, onDelete }) {
  if (!items || items.length === 0) {
    return (
      <div className="history-empty">
        <div className="history-empty-icon">
          <IconFilm size={48} color="var(--text-muted)" />
        </div>
        <h3>No history yet</h3>
        <p>Start identifying movies and your results will appear here.</p>
      </div>
    );
  }

  return (
    <div className="history-grid">
      {items.map((item, index) => {
        const { Icon, color, bg } = getGenreConfig(item.genre);
        return (
          <motion.div
            key={item._id || index}
            className="history-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            layout
          >
            <div className="history-item-header">
              <div className="history-genre-icon" style={{ background: bg, color }}>
                <Icon size={16} color={color} />
              </div>
              <div className="history-title-group">
                <h4 className="history-title">{item.title}</h4>
                {item.year !== 'Unknown' && <span className="history-year">{item.year}</span>}
              </div>
              {onDelete && (
                <button className="history-delete" onClick={() => onDelete(item._id)} aria-label="Delete">
                  <IconTrash size={13} color="currentColor" />
                </button>
              )}
            </div>

            <div className="history-item-body">
              {item.genre && item.genre !== 'Unknown' && <span className="history-badge genre-badge">{item.genre}</span>}
              <span className={`history-badge conf-badge conf-${item.confidence?.toLowerCase()}`}>{item.confidence}</span>
              {item.method === 'Model + Search' && <span className="history-badge method-badge">+ Search</span>}
            </div>

            {item.description && (
              <p className="history-desc">
                {item.description.substring(0, 120)}{item.description.length > 120 ? '...' : ''}
              </p>
            )}

            <div className="history-footer">
              <span className="history-time">{timeAgo(item.timestamp)}</span>
              {item.director && item.director !== 'Unknown' && (
                <span className="history-director">{item.director}</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
