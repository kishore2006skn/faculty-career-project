import express from 'express';
import {
  generateSummaryPreview,
  generatePdfReport,
  generateExcelReport,
  getReportHistory,
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/preview', generateSummaryPreview);
router.post('/pdf', generatePdfReport);
router.post('/excel', generateExcelReport);
router.get('/history', getReportHistory);

export default router;
