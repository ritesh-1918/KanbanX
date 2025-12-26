require('dotenv').config();
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./src/routes/health.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('KanbanX Backend API');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
