import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import HistoryList from '../components/HistoryList.jsx';
import './History.css';

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/history');
      setItems(res.data.history || []);
    } catch (err) {
      setError('Could not load history. Is MongoDB running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/history/${id}`);
      setItems(prev => prev.filter(item => item._id !== id));
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="history-page page">
      <motion.div
        className="history-header"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2>Identification History</h2>
          <p className="history-subtitle">Your last {items.length} movie identifications</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchHistory} disabled={loading}>
          {loading ? '⏳ Loading...' : '↺ Refresh'}
        </button>
      </motion.div>

      {error ? (
        <div className="history-error">
          <span>⚠️ {error}</span>
        </div>
      ) : loading ? (
        <div className="history-loading">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton history-skeleton" />
          ))}
        </div>
      ) : (
        <HistoryList items={items} onDelete={handleDelete} />
      )}
    </div>
  );
}
