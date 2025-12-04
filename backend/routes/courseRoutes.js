const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');
const PERMISSIONS = require('../constants/permissions');
const courseController = require('../controllers/courseController');
const upload = require('../middlewares/upload'); // Assuming existing upload middleware
const courseMaterialUpload = require('../middlewares/courseMaterialUpload');

router.use(authMiddleware);

// Public access (for authenticated users)
router.get('/', requirePermission(PERMISSIONS.BROWSE_COURSES), courseController.getAllCourses);
router.get('/my-courses', requirePermission(PERMISSIONS.BROWSE_COURSES), courseController.getMyCourses);
router.get('/:id', requirePermission(PERMISSIONS.BROWSE_COURSES), courseController.getCourse);

// Creator/Admin routes
router.post(
  '/',
  requirePermission(PERMISSIONS.CREATE_COURSE),
  courseController.createCourse
);

router.put(
  '/:id',
  requirePermission(PERMISSIONS.EDIT_COURSE),
  courseController.updateCourse
);

router.delete(
  '/:id',
  requirePermission(PERMISSIONS.DELETE_COURSE),
  courseController.deleteCourse
);

router.post(
  '/:courseId/materials',
  requirePermission(PERMISSIONS.UPLOAD_COURSE_MATERIAL),
  courseMaterialUpload.single('file'),
  courseController.uploadCourseMaterial
);

router.delete(
  '/:courseId/materials/:materialId',
  requirePermission(PERMISSIONS.UPLOAD_COURSE_MATERIAL), // Using upload permission for management
  courseController.deleteCourseMaterial
);

router.patch(
  '/:id/status',
  requirePermission(PERMISSIONS.PUBLISH_COURSE),
  courseController.togglePublishStatus
);

// Get course assessments (quizzes and assignments)
const assessmentController = require('../controllers/assessmentController');
router.get(
  '/:courseId/assessments',
  requirePermission(PERMISSIONS.BROWSE_COURSES),
  assessmentController.getCourseAssessments
);

module.exports = router;
