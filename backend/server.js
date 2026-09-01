const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const seedDatabase = require('./database/seed_data');

// Import Routers
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const entrepreneurRouter = require('./routes/entrepreneur');
const vcRouter = require('./routes/vc');
const graphRouter = require('./routes/graph');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directory exists
if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

// Serve static pitch deck PDFs
app.use('/api/uploads', express.static(config.UPLOAD_DIR));

// Mount API Routers
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/entrepreneur', entrepreneurRouter);
app.use('/api/vc', vcRouter);
app.use('/api/graph', graphRouter);

// Root Backend API Endpoint (JSON Output)
app.get('/', (req, res) => {
  res.json({
    status: "online",
    app: config.PROJECT_NAME,
    version: config.VERSION,
    engine: "Node.js Express Backend",
    database: "MongoDB & CognoDB openCypher Graph Engine (over Bolt)",
    endpoints: {
      auth: "http://127.0.0.1:8000/api/auth",
      admin: "http://127.0.0.1:8000/api/admin",
      entrepreneur: "http://127.0.0.1:8000/api/entrepreneur",
      vc: "http://127.0.0.1:8000/api/vc",
      graph_network: "http://127.0.0.1:8000/api/graph/network"
    }
  });
});

// Run Seed Data on startup
try {
  seedDatabase();
} catch (e) {
  console.log(`[Seed Warning]: ${e.message}`);
}

// Start Server with automatic port fallback if port is in use
function startServer(port) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[*] ${config.PROJECT_NAME} Node.js Express Backend v${config.VERSION} running on http://127.0.0.1:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[!] Port ${port} is in use. Auto-switching to port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(`[!] Server error: ${err.message}`);
    }
  });
}

startServer(Number(config.PORT) || 8000);
