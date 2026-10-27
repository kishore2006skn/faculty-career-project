import express from 'express';
import {
  getAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  reviewAchievement,
} from '../controllers/achievementController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get('/', getAchievements);
router.get('/:id', getAchievementById);
router.post('/', upload.single('evidenceFile'), createAchievement);
router.put('/:id', upload.single('evidenceFile'), updateAchievement);
router.delete('/:id', deleteAchievement);
router.post('/:id/review', authorize(ROLES.ADMIN, ROLES.REVIEWER), reviewAchievement);

export default router;
