import express from 'express';
import {
  getPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  submitForReview,
  reviewPublication,
  lookupDoi,
  checkDuplicate,
} from '../controllers/publicationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get('/doi-lookup', lookupDoi);
router.post('/check-duplicate', checkDuplicate);

router.get('/', getPublications);
router.get('/:id', getPublicationById);
router.post('/', upload.single('supportingDoc'), createPublication);
router.put('/:id', upload.single('supportingDoc'), updatePublication);
router.delete('/:id', deletePublication);

router.post('/:id/submit', submitForReview);
router.post('/:id/review', authorize(ROLES.ADMIN, ROLES.REVIEWER), reviewPublication);

export default router;
