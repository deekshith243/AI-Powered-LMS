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

const app = express();
require('dotenv').config();

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
