import express from 'express';
import {
  getResearchProjects,
  createResearchProject,
  updateResearchProject,
  deleteResearchProject,
} from '../controllers/researchProjectController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', getResearchProjects);
router.post('/', upload.single('supportingDoc'), createResearchProject);
router.put('/:id', upload.single('supportingDoc'), updateResearchProject);
router.delete('/:id', deleteResearchProject);

export default router;
