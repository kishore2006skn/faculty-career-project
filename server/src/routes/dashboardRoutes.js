import express from 'express';
import { getSummaryStats, getPublicationCharts } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getSummaryStats);
router.get('/charts', getPublicationCharts);

export default router;
