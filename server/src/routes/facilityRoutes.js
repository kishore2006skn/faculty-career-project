import express from 'express';
import {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
} from '../controllers/facilityController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get('/', getFacilities);
router.get('/:id', getFacilityById);
router.post('/', authorize(ROLES.ADMIN, ROLES.REVIEWER), createFacility);
router.put('/:id', updateFacility);
router.delete('/:id', authorize(ROLES.ADMIN), deleteFacility);

export default router;
