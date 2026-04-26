const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const testRoutes = require("./routes/test.routes");
const matchRoutes = require("./routes/matchRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");

// Load env vars
dotenv.config();

// Connect to database
//connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use("/api/assign", assignmentRoutes);
app.use("/api/match", matchRoutes);
app.use(express.urlencoded({ extended: true }));

// Routes (we'll fill these in as we build features)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use("/", testRoutes);
// Health check route (very useful for teammates to verify your server is running)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Smart Resource Allocation API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler (always last)
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});