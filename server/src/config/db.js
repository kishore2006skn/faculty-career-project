import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const customUri = process.env.MONGODB_URI;

  if (customUri) {
    try {
      console.log(`[DB] Attempting connection to custom MongoDB URI...`);
      const conn = await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[DB] Failed to connect to MONGODB_URI (${err.message}). Checking fallback options...`);
    }
  }

  // Try standard local MongoDB
  try {
    console.log(`[DB] Attempting connection to local MongoDB (mongodb://127.0.0.1:27017/faculty_advancement)...`);
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/faculty_advancement', {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] Connected to local MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.log(`[DB] Local MongoDB not running (${err.message}). Initializing MongoMemoryServer for development...`);
  }

  // Fallback to MongoMemoryServer with retry for Windows reserved ephemeral ports
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    let lastError = null;

    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        if (memoryServer) {
          try { await memoryServer.stop(); } catch (_) {}
          memoryServer = null;
        }

        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'faculty_advancement_dev',
            ip: '127.0.0.1',
          }
        });

        const memoryUri = memoryServer.getUri();
        const conn = await mongoose.connect(memoryUri, {
          directConnection: true,
        });
        console.log(`[DB] MongoMemoryServer started successfully! Connected at: ${memoryUri}`);
        return conn;
      } catch (err) {
        lastError = err;
        console.warn(`[DB] MongoMemoryServer attempt ${attempt} failed (${err.message}). Retrying with fresh port...`);
        if (attempt === 4) throw err;
      }
    }
  } catch (err) {
    console.error(`[DB] Critical Error: Unable to initialize any MongoDB connection:`, err.message);
    throw err;
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
