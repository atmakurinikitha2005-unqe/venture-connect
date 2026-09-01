const path = require('path');
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8000,
  PROJECT_NAME: "VentureConnect",
  VERSION: "1.0.0",
  SECRET_KEY: process.env.SECRET_KEY || "ventureconnect_secret_jwt_key_2026_super_secure",
  JWT_EXPIRES_IN: "7d",

  // MongoDB Connection
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017",
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || "ventureconnect",

  // CognoDB Cloud / Neo4j openCypher Connection
  BOLT_URI: process.env.BOLT_URI || process.env.COGNODB_URI || "bolt://localhost:7687",
  COGNODB_USER: process.env.COGNODB_USER || "cognodb",
  COGNODB_PASSWORD: process.env.COGNODB_PASSWORD || "secret",

  // Pitch Deck Upload Directory
  UPLOAD_DIR: path.join(__dirname, 'uploads')
};
