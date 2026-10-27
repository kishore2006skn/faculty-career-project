import express from 'express';
import {
  getUsers,
  updateUserStatusRole,
  getDepartments,
  createDepartment,
  updateDepartment,
  getAuditLogs,
  getAdvancementPolicy,
  updateAdvancementPolicy,
  getReviewQueue,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

// Routes for both Admin and Reviewers
router.get('/review-queue', authorize(ROLES.ADMIN, ROLES.REVIEWER), getReviewQueue);
router.get('/departments', getDepartments);
router.get('/policy', getAdvancementPolicy);

// Admin-only routes
router.use(authorize(ROLES.ADMIN));

router.get('/users', getUsers);
router.put('/users/:id', updateUserStatusRole);

router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);

router.put('/policy/:id', updateAdvancementPolicy);
router.get('/audit-logs', getAuditLogs);

export default router;
