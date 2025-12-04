const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');
const PERMISSIONS = require('../constants/permissions');
const enrollmentController = require('../controllers/enrollmentController');

router.use(authMiddleware);

// Learner routes
router.get('/my-enrollments', enrollmentController.getMyEnrollments);
router.get('/course/:courseId', enrollmentController.getEnrollmentByCourse);
router.get('/:enrollmentId/details', enrollmentController.getEnrollmentDetails);
router.post(
  '/:enrollmentId/progress', 
  enrollmentController.updateProgress
);

// Manager/Admin routes
router.post(
  '/',
  requirePermission(PERMISSIONS.ENROLL_USER),
  enrollmentController.enrollUser
);

module.exports = router;
