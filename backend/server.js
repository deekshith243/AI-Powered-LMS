const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const subjectRoutes = require('./src/routes/subjectRoutes');
const videoRoutes = require('./src/routes/videoRoutes');
const progressRoutes = require('./src/routes/progressRoutes');
const userRoutes = require('./src/routes/userRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const certificateRoutes = require('./src/routes/certificateRoutes');
const noteRoutes = require('./src/routes/noteRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');
const jobsRoutes = require('./src/routes/jobs');
const jobTrackerRoutes = require('./src/routes/jobRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://ai-powered-lms-app.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const pool = require('./src/config/db');
    const [rows] = await pool.query('SELECT 1 as connected');
    res.json({ status: 'connected', result: rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/db-inspect', async (req, res) => {
  try {
    const pool = require('./src/config/db');
    const [rows] = await pool.query('DESCRIBE subjects');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/courses/enroll', enrollmentRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/job-tracker', jobTrackerRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
