const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');
const PERMISSIONS = require('../constants/permissions');
const learningPathController = require('../controllers/learningPathController');

router.use(authMiddleware);

// Public access (for authenticated users)
router.get('/', requirePermission(PERMISSIONS.BROWSE_COURSES), learningPathController.getAllLearningPaths);
router.get('/:id', requirePermission(PERMISSIONS.BROWSE_COURSES), learningPathController.getLearningPath);

// Creator/Admin routes
router.post(
  '/',
  requirePermission(PERMISSIONS.CREATE_LEARNING_PATH),
  learningPathController.createLearningPath
);

router.put(
  '/:id',
  requirePermission(PERMISSIONS.EDIT_LEARNING_PATH),
  learningPathController.updateLearningPath
);

router.delete(
  '/:id',
  requirePermission(PERMISSIONS.DELETE_LEARNING_PATH),
  learningPathController.deleteLearningPath
);

// Manage courses in path
router.post(
  '/:id/courses',
  requirePermission(PERMISSIONS.EDIT_LEARNING_PATH),
  learningPathController.addCourseToPath
);

router.delete(
  '/:id/courses/:courseId',
  requirePermission(PERMISSIONS.EDIT_LEARNING_PATH),
  learningPathController.removeCourseFromPath
);

module.exports = router;
