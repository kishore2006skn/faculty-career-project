import dotenv from 'dotenv';
dotenv.config();

import { connectDB, closeDB } from '../config/db.js';
import { runSeed } from './seedRunner.js';

const executeSeed = async () => {
  try {
    await connectDB();
    await runSeed();
    console.log('[Seed] Standalone seed executed successfully.');
    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Standalone seed failed:', err);
    process.exit(1);
  }
};

executeSeed();
