const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');
const PERMISSIONS = require('../constants/permissions');
const assessmentController = require('../controllers/assessmentController');
const upload = require('../middlewares/upload'); // Assuming upload middleware

router.use(authMiddleware);

// --- QUIZZES ---
router.get('/quizzes/:id', assessmentController.getQuiz);

router.post(
  '/quizzes',
  requirePermission(PERMISSIONS.CREATE_COURSE), // Part of course creation
  assessmentController.createQuiz
);

router.put(
  '/quizzes/:id',
  requirePermission(PERMISSIONS.EDIT_QUIZ),
  assessmentController.updateQuiz
);

router.post(
  '/quizzes/:quizId/questions',
  requirePermission(PERMISSIONS.EDIT_QUIZ),
  assessmentController.addQuestion
);

router.get(
  '/quizzes/:quizId/questions',
  assessmentController.getQuizQuestions
);

router.put(
  '/quizzes/:quizId/questions/reorder',
  requirePermission(PERMISSIONS.EDIT_QUIZ),
  assessmentController.updateQuestionOrder
);

router.delete(
  '/questions/:id',
  requirePermission(PERMISSIONS.EDIT_QUIZ),
  assessmentController.deleteQuestion
);

router.delete(
  '/quizzes/:id',
  requirePermission(PERMISSIONS.DELETE_QUIZ),
  assessmentController.deleteQuiz
);

router.post(
  '/quizzes/:quizId/submit',
  assessmentController.submitQuizAttempt
);

// --- ASSIGNMENTS ---
router.post(
  '/assignments',
  requirePermission(PERMISSIONS.CREATE_COURSE),
  assessmentController.createAssignment
);

router.delete(
  '/assignments/:id',
  requirePermission(PERMISSIONS.DELETE_ASSIGNMENT),
  assessmentController.deleteAssignment
);

router.post(
  '/assignments/:assignmentId/submit',
  // upload.array('files'), // Uncomment when middleware verified
  assessmentController.submitAssignment
);

router.get(
  '/submissions',
  requirePermission(PERMISSIONS.GRADE_ASSIGNMENT),
  assessmentController.getSubmissions
);

router.post(
  '/submissions/:submissionId/grade',
  requirePermission(PERMISSIONS.GRADE_ASSIGNMENT),
  assessmentController.gradeSubmission
);

// --- NEW ENDPOINTS ---

// Get assignment details
router.get('/assignments/:id', assessmentController.getAssignment);

// Get quiz attempts for current user
router.get('/quizzes/:quizId/my-attempts', assessmentController.getQuizAttempts);

// Get my submissions for an assignment
router.get('/assignments/:assignmentId/my-submissions', assessmentController.getMySubmissions);

module.exports = router;
