import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabaseIfEmpty } from './seed/seedRunner.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database (with MongoDB Memory Server fallback)
    await connectDB();

    // 2. Automatically seed if database is empty
    await seedDatabaseIfEmpty();

    // 3. Start listening on all IPv4 interfaces (0.0.0.0)
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n======================================================`);
      console.log(`🚀 Faculty Advancement & Summary Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
      console.log(`======================================================\n`);
    });

    // Handle Unhandled Promise Rejections & Uncaught Exceptions
    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection Error: ${err?.message || err}`);
    });

    process.on('uncaughtException', (err) => {
      console.error(`Uncaught Exception:`, err);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
