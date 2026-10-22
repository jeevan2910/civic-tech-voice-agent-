const path = require('path');
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'civic_ai_grievance_secret_key_2026',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  csvFilePath: path.join(__dirname, '..', 'civicai_enhanced_grievances_120_records.csv'),
  dataPath: path.join(__dirname, '..', 'data', 'grievances_store.json')
};
