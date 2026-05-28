require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { testConnection } = require('./config/db');

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/user');
const vocabRoutes   = require('./routes/vocab');
const grammarRoutes = require('./routes/grammar');
const rankingRoutes = require('./routes/ranking');
const toeicRoutes   = require('./routes/toeic');

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/vocab',   vocabRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/toeic',   toeicRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route không tồn tại' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
});

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
testConnection().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
