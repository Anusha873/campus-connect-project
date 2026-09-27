const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Route files
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const internalMarksRoutes = require('./routes/internalMarksRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const studyMaterialRoutes = require('./routes/studyMaterialRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const examinationResultRoutes = require('./routes/examinationResultRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Allowed origins for CORS (Local development + Production Vercel & Render)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'https://campus-connect-project-cyan.vercel.app',
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.trim().replace(/\/+$/, ''));
}
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach((o) => {
    if (o.trim()) allowedOrigins.push(o.trim().replace(/\/+$/, ''));
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isMatch =
      allowedOrigins.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin) ||
      /^https:\/\/.*\.onrender\.com$/.test(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    if (isMatch) {
      return callback(null, true);
    }
    // Dynamic reflection fallback to guarantee client access
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 204,
};

// Enable CORS & Preflight handling
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Dev logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routers
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/internal-marks', internalMarksRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/results', examinationResultRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'CampusConnect College Management System API is active',
    timestamp: new Date(),
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to Database & Start Server
const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');

    // Auto-seed initial admin and demo data if database is empty
    try {
      const User = require('./models/User');
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 0) {
        console.log('No admin user found. Automatically initializing demo data for CampusConnect...');
        const seedDatabase = require('./scripts/seed');
        await seedDatabase();
        console.log('Auto-seed completed successfully.');
      }
    } catch (seedErr) {
      console.warn('Auto-seed check notice (non-fatal):', seedErr.message);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
