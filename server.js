const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');
const setupSockets = require('./sockets');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const conversationRoutes = require('./routes/conversations');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Connect to SQLite
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  })
);

// Routes
app.use('/api', require('./routes/index'));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/conversations', conversationRoutes);

// Error Handler
app.use(errorHandler);

// Setup Socket.io
setupSockets(io);

// Start Server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));