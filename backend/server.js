require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('./config/passport');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'session_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());

// Development helper: if a mock user is present in session, expose it as req.user
app.use((req, res, next) => {
  if (req.session && req.session.mockUser) {
    req.user = req.session.mockUser;
  }
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes);

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

// Attempt to connect to DB, but start server even if DB is unavailable (useful for local testing)
connectDB()
  .then((conn) => {
    // conn may be null when SKIP_DB=true
    app.locals.dbConnected = !!conn;
    const dbNote = conn ? '' : ' (DB offline)';
    app.listen(PORT, () => console.log(`Server running on port ${PORT}${dbNote}`));
  })
  .catch((err) => {
    app.locals.dbConnected = false;
    console.error('Failed to connect to DB — starting server without DB connection.');
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (DB offline)`));
  });
