const { Quiz, Question, QuizAttempt, Assignment, Submission, Course, User, Enrollment } = require('../models');
const { createAuditLog } = require('../utils/auditLogger');
const { Op } = require('sequelize');

// --- QUIZ MANAGEMENT ---

/**
 * Create a new quiz
 */
const createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, passingScore, timeLimit, maxAttempts, isRequired, randomizeQuestions, showCorrectAnswers, availableFrom, availableUntil } = req.body;

    const quiz = await Quiz.create({
      courseId,
      title,
      description,
      passingScore,
      timeLimit,
      maxAttempts,
      isRequired,
      randomizeQuestions,
      showCorrectAnswers,
      availableFrom,
      availableUntil,
    });

    await createAuditLog({
      action: 'CREATE_QUIZ',
      resource: 'Quiz',
      resourceId: quiz.id,
      details: { courseId, title }
    }, req);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz,
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating quiz',
      error: error.message,
    });
  }
};

/**
 * Add question to quiz
 */
const addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionText, questionType, options, correctAnswer, points, order, explanation } = req.body;

    const question = await Question.create({
      quizId,
      questionText,
      questionType,
      options,
      correctAnswer,
      points,
      order,
      explanation,
    });

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: question,
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding question',
      error: error.message,
    });
  }
};

/**
 * Get quiz with questions
 */
const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id, {
      include: [{
        model: Question,
        as: 'questions',
        attributes: { exclude: ['correctAnswer', 'explanation'] }, // Hide answers for learners
        order: [['order', 'ASC']],
      }],
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // If admin/creator, show answers
    if (req.user.permissions.includes('edit_course')) {
      const fullQuiz = await Quiz.findByPk(id, {
        include: [{ model: Question, as: 'questions' }],
      });
      return res.status(200).json({ success: true, data: fullQuiz });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz',
      error: error.message,
    });
  }
};

/**
 * Submit quiz attempt
 */
const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { enrollmentId, answers, timeSpent } = req.body;

    const quiz = await Quiz.findByPk(quizId, {
      include: [{ model: Question, as: 'questions' }]
    });

    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // Calculate score
    let score = 0;
    let totalPoints = 0;
    
    quiz.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      // Simple exact match grading for now
      if (userAnswer === question.correctAnswer) {
        score += question.points;
      }
    });

    const passed = (score / totalPoints) * 100 >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      userId: req.user.id,
      quizId,
      enrollmentId,
      attemptNumber: 1, // TODO: Calculate attempt number
      answers,
      score,
      passed,
      status: 'completed',
      startedAt: new Date(Date.now() - (timeSpent * 1000)), // Approximate start
      submittedAt: new Date(),
      gradedAt: new Date(),
      timeSpent,
    });

    await createAuditLog({
      action: 'SUBMIT_QUIZ',
      resource: 'QuizAttempt',
      resourceId: attempt.id,
      details: { quizId, enrollmentId, score, passed }
    }, req);

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        attempt,
        passed,
        score,
        totalPoints
      },
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
      error: error.message,
    });
  }
};

// --- ASSIGNMENT MANAGEMENT ---

/**
 * Create assignment
 */
const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, instructions, dueDate, maxScore, submissionType, allowedFileTypes, maxFileSize, isRequired } = req.body;

    const assignment = await Assignment.create({
      courseId,
      title,
      description,
      instructions,
      dueDate,
      maxScore,
      submissionType,
      allowedFileTypes,
      maxFileSize,
      isRequired,
    });

    await createAuditLog({
      action: 'CREATE_ASSIGNMENT',
      resource: 'Assignment',
      resourceId: assignment.id,
      details: { courseId, title }
    }, req);

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment,
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assignment',
      error: error.message,
    });
  }
};

/**
 * Get assignment details
 */
const getAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByPk(id, {
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'createdBy']
      }]
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment',
      error: error.message,
    });
  }
};

/**
 * Submit assignment
 */
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { enrollmentId, content } = req.body;
    
    // Handle file upload if present
    const attachments = req.files ? req.files.map(f => `/uploads/assignments/${f.filename}`) : [];

    const submission = await Submission.create({
      assignmentId,
      userId: req.user.id,
      enrollmentId,
      content,
      attachments,
      status: 'submitted',
      submittedAt: new Date(),
    });

    await createAuditLog({
      action: 'SUBMIT_ASSIGNMENT',
      resource: 'Submission',
      resourceId: submission.id,
      details: { assignmentId, enrollmentId }
    }, req);

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: submission,
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assignment',
      error: error.message,
    });
  }
};

/**
 * Grade submission
 */
const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    const submission = await Submission.findByPk(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    await submission.update({
      score,
      feedback,
      status: 'graded',
      gradedBy: req.user.id,
      gradedAt: new Date(),
    });

    await createAuditLog({
      action: 'GRADE_SUBMISSION',
      resource: 'Submission',
      resourceId: submission.id,
      details: { score, status: 'graded' }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: submission,
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error grading submission',
      error: error.message,
    });
  }
};

/**
 * Delete quiz
 */
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check permissions
    const course = await Course.findByPk(quiz.courseId);
    if (course.createdBy !== req.user.id && !req.user.permissions.includes('delete_quiz')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await quiz.destroy();

    await createAuditLog({
      action: 'DELETE_QUIZ',
      resource: 'Quiz',
      resourceId: id,
      details: { title: quiz.title }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting quiz',
      error: error.message,
    });
  }
};

/**
 * Delete assignment
 */
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Check permissions
    const course = await Course.findByPk(assignment.courseId);
    if (course.createdBy !== req.user.id && !req.user.permissions.includes('delete_assignment')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await assignment.destroy();

    await createAuditLog({
      action: 'DELETE_ASSIGNMENT',
      resource: 'Assignment',
      resourceId: id,
      details: { title: assignment.title }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting assignment',
      error: error.message,
    });
  }
};

/**
 * Get all submissions with filtering
 */
const getSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, courseId, assignmentId, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (assignmentId) whereClause.assignmentId = assignmentId;

    const assignmentInclude = {
      model: Assignment,
      as: 'assignment',
      attributes: ['id', 'title', 'maxScore', 'courseId'],
      include: [{
          model: Course,
          as: 'course',
          attributes: ['id', 'title'],
          where: courseId ? { id: courseId } : undefined
      }]
    };

    const userInclude = {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email',]
    };

    if (search) {
        userInclude.where = {
            [Op.or]: [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ]
        };
    }

    // If not admin, restrict to courses created by the user
    if (!req.user.permissions.includes('manage_system_settings')) {
         assignmentInclude.include[0].where = {
             ...assignmentInclude.include[0].where,
             createdBy: req.user.id
         };
    }

    const { count, rows } = await Submission.findAndCountAll({
      where: whereClause,
      include: [
        assignmentInclude,
        userInclude
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['submittedAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        submissions: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message,
    });
  }
};

/**
 * Get quiz attempts for current user
 */
const getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const attempts = await QuizAttempt.findAll({
      where: { quizId, userId: req.user.id },
      order: [['attemptNumber', 'DESC']],
    });

    const attemptCount = attempts.length;
    const canAttempt = !quiz.maxAttempts || attemptCount < quiz.maxAttempts;
    const remainingAttempts = quiz.maxAttempts ? quiz.maxAttempts - attemptCount : null;

    res.status(200).json({
      success: true,
      data: {
        attempts,
        canAttempt,
        remainingAttempts,
        maxAttempts: quiz.maxAttempts
      },
    });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz attempts',
      error: error.message,
    });
  }
};

/**
 * Get my submissions for an assignment
 */
const getMySubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const submissions = await Submission.findAll({
      where: { assignmentId, userId: req.user.id },
      order: [['submittedAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: { submissions },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message,
    });
  }
};

/**
 * Get all assessments for a course
 */
const getCourseAssessments = async (req, res) => {
  try {
    const { courseId } = req.params;

    const quizzes = await Quiz.findAll({
      where: { courseId },
      attributes: { exclude: [] },
      include: [{
        model: Question,
        as: 'questions',
        attributes: ['id'] // Just count
      }],
      order: [['createdAt', 'ASC']],
    });

    const assignments = await Assignment.findAll({
      where: { courseId },
      order: [['createdAt', 'ASC']],
    });

    // Add question count to quizzes
    const quizzesWithCount = quizzes.map(quiz => ({
      ...quiz.toJSON(),
      questionCount: quiz.questions?.length || 0
    }));

    res.status(200).json({
      success: true,
      data: {
        quizzes: quizzesWithCount,
        assignments,
      },
    });
  } catch (error) {
    console.error('Error fetching course assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course assessments',
      error: error.message,
    });
  }
};

/**
 * Update quiz
 */
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check permissions
    const course = await Course.findByPk(quiz.courseId);
    if (course.createdBy !== req.user.id && !req.user.permissions.includes('edit_quiz')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await quiz.update(updateData);

    await createAuditLog({
      action: 'UPDATE_QUIZ',
      resource: 'Quiz',
      resourceId: quiz.id,
      details: { updateData }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz,
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quiz',
      error: error.message,
    });
  }
};

/**
 * Delete question
 */
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByPk(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Check permissions via quiz
    const quiz = await Quiz.findByPk(question.quizId);
    const course = await Course.findByPk(quiz.courseId);
    if (course.createdBy !== req.user.id && !req.user.permissions.includes('edit_quiz')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await question.destroy();

    await createAuditLog({
      action: 'DELETE_QUESTION',
      resource: 'Question',
      resourceId: id,
      details: { quizId: question.quizId }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message,
    });
  }
};

/**
 * Get quiz questions
 */
const getQuizQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const questions = await Question.findAll({
      where: { quizId },
      order: [['order', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message,
    });
  }
};

/**
 * Update question order
 */
const updateQuestionOrder = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body; // Array of { id, order }

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check permissions
    const course = await Course.findByPk(quiz.courseId);
    if (course.createdBy !== req.user.id && !req.user.permissions.includes('edit_quiz')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update order for each question
    await Promise.all(
      questions.map(({ id, order }) =>
        Question.update({ order }, { where: { id, quizId } })
      )
    );

    await createAuditLog({
      action: 'REORDER_QUESTIONS',
      resource: 'Question',
      resourceId: quizId,
      details: { questionCount: questions.length }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Questions reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering questions',
      error: error.message,
    });
  }
};

module.exports = {
  createQuiz,
  updateQuiz,
  addQuestion,
  deleteQuestion,
  getQuiz,
  getQuizQuestions,
  deleteQuiz,
  submitQuizAttempt,
  getQuizAttempts,
  updateQuestionOrder,
  createAssignment,
  getAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissions,
  getMySubmissions,
  getCourseAssessments,
};
