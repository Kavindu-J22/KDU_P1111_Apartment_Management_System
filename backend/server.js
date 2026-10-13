const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db'); // Initialize DB pool and test connection
const authRoutes = require('./routes/authRoutes');
const unitRoutes = require('./routes/unitRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const billRoutes = require('./routes/billRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

// CORS — allow localhost in dev, Vercel URL in production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // set this to your Vercel URL in Render env vars
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow Postman / server-to-server calls (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/events', eventRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
