import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home.jsx';
import History from './pages/History.jsx';
import { IconFilm, IconInstagram, IconLinkedIn } from './components/Icons.jsx';
import './App.css';

const isElectron = typeof window !== 'undefined' && window.electronAPI;

function TitleBar() {
  if (!isElectron) return null;
  return (
    <div className="titlebar">
      <div className="titlebar-drag" />
      <div className="wc-wrap">
        <button className="wc-btn wc-min" onClick={() => window.electronAPI.minimizeWindow()} />
        <button className="wc-btn wc-max" onClick={() => window.electronAPI.maximizeWindow()} />
        <button className="wc-btn wc-cls" onClick={() => window.electronAPI.closeWindow()} />
      </div>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <IconFilm size={22} color="var(--cyan)" />
        <span className="brand-text">CineLens <span className="brand-ai">AI</span></span>
      </div>

      <div className="nav-links">
        {[
          { to: '#', label: 'Browse Movies' },
          { to: '#', label: 'Trending Scenes' },
          { to: '/', label: 'Image Search', exact: true },
          { to: '#', label: 'Community' },
          { to: '/history', label: 'My History' },
        ].map((item) =>
          item.to === '#' ? (
            <a key={item.label} href="#" className="nav-link" onClick={e => e.preventDefault()}>
              {item.label}
            </a>
          ) : (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          )
        )}
      </div>

      <div className="nav-right">
        <div className="nav-avatar">A</div>
        <button className="btn btn-outline upgrade-btn">Upgrade to Pro</button>
      </div>
    </nav>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            <Home />
          </motion.div>
        } />
        <Route path="/history" element={
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            <History />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        <TitleBar />
        <NavBar />
        <main className="app-content">
          <AnimatedRoutes />
        </main>
        <footer className="app-footer">
          <div className="footer-links">
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
          <div className="footer-socials">
            <span>Socials</span>
            <a href="#" aria-label="Instagram" className="social-icon"><IconInstagram size={17} color="var(--text-muted)" /></a>
            <a href="#" aria-label="LinkedIn" className="social-icon"><IconLinkedIn size={17} color="var(--text-muted)" /></a>
          </div>
        </footer>
      </div>
    </Router>
  );
}
