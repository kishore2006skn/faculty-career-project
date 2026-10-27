import express from 'express';
import {
  getAllFaculty,
  getFacultyById,
  updateFacultyProfile,
  uploadProfilePhoto,
} from '../controllers/facultyController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllFaculty);
router.get('/:id', getFacultyById);
router.put('/:id', updateFacultyProfile);
router.post('/:id/photo', upload.single('photo'), uploadProfilePhoto);

export default router;
