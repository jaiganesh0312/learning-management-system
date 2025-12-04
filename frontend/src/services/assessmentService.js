import api from '@/config/axiosConfig';

/**
 * Get quiz by ID
 * @param {string} id - Quiz UUID (required)
 * @returns {Promise<Object>} Response with quiz data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Quiz object with questions
 */
const getQuiz = async (id) => {
  try {
    const response = await api.get(`/assessments/quizzes/${id}`);
    return response;
  } catch (error) {
    console.error('Get quiz error:', error);
    return error.response;
  }
};

/**
 * Create a new quiz
 * @param {Object} data - Quiz data
 * @param {string} data.title - Quiz title (required)
 * @param {string} [data.description] - Quiz description
 * @param {string} data.courseId - Course UUID (required)
 * @param {number} [data.passingScore] - Passing score percentage
 * @param {number} [data.timeLimit] - Time limit in minutes
 * @returns {Promise<Object>} Response with created quiz
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Created quiz object
 */
const createQuiz = async (data) => {
  try {
    const response = await api.post('/assessments/quizzes', data);
    return response;
  } catch (error) {
    console.error('Create quiz error:', error);
    return error.response;
  }
};

/**
 * Add question to a quiz
 * @param {string} quizId - Quiz UUID (required)
 * @param {Object} data - Question data
 * @param {string} data.questionText - Question text (required)
 * @param {string} data.questionType - Question type (e.g., 'multiple_choice', 'true_false') (required)
 * @param {Array} data.options - Array of answer options (required for multiple choice)
 * @param {string} data.correctAnswer - Correct answer (required)
 * @param {number} [data.points] - Points for this question
 * @returns {Promise<Object>} Response with created question
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Created question object
 */
const addQuestion = async (quizId, data) => {
  try {
    const response = await api.post(`/assessments/quizzes/${quizId}/questions`, data);
    return response;
  } catch (error) {
    console.error('Add question error:', error);
    return error.response;
  }
};

/**
 * Submit quiz attempt
 * @param {string} quizId - Quiz UUID (required)
 * @param {Object} data - Quiz attempt data
 * @param {Array} data.answers - Array of answer objects (required)
 * @param {string} data.answers[].questionId - Question UUID
 * @param {string} data.answers[].answer - User's answer
 * @returns {Promise<Object>} Response with quiz results
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Quiz attempt result with score
 */
const submitQuizAttempt = async (quizId, data) => {
  try {
    const response = await api.post(`/assessments/quizzes/${quizId}/submit`, data);
    return response;
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    return error.response;
  }
};

/**
 * Create a new assignment
 * @param {Object} data - Assignment data
 * @param {string} data.title - Assignment title (required)
 * @param {string} [data.description] - Assignment description
 * @param {string} data.courseId - Course UUID (required)
 * @param {string} [data.dueDate] - Due date
 * @param {number} [data.maxScore] - Maximum score
 * @returns {Promise<Object>} Response with created assignment
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Created assignment object
 */
const createAssignment = async (data) => {
  try {
    const response = await api.post('/assessments/assignments', data);
    return response;
  } catch (error) {
    console.error('Create assignment error:', error);
    return error.response;
  }
};

/**
 * Submit assignment
 * @param {string} assignmentId - Assignment UUID (required)
 * @param {FormData} formData - Form data with submission files and content
 * @returns {Promise<Object>} Response with submission data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Created submission object
 */
const submitAssignment = async (assignmentId, formData) => {
  try {
    const response = await api.post(`/assessments/assignments/${assignmentId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Submit assignment error:', error);
    return error.response;
  }
};

/**
 * Grade a submission
 * @param {string} submissionId - Submission UUID (required)
 * @param {Object} data - Grading data
 * @param {number} data.score - Score awarded (required)
 * @param {string} [data.feedback] - Instructor feedback
 * @returns {Promise<Object>} Response with graded submission
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Updated submission object
 */
const gradeSubmission = async (submissionId, data) => {
  try {
    const response = await api.post(`/assessments/submissions/${submissionId}/grade`, data);
    return response;
  } catch (error) {
    console.error('Grade submission error:', error);
    return error.response;
  }
};

/**
 * Delete a quiz
 * @param {string} id - Quiz UUID
 * @returns {Promise<Object>} Response
 */
const deleteQuiz = async (id) => {
  try {
    const response = await api.delete(`/assessments/quizzes/${id}`);
    return response;
  } catch (error) {
    console.error('Delete quiz error:', error);
    return error.response;
  }
};

/**
 * Delete an assignment
 * @param {string} id - Assignment UUID
 * @returns {Promise<Object>} Response
 */
const deleteAssignment = async (id) => {
  try {
    const response = await api.delete(`/assessments/assignments/${id}`);
    return response;
  } catch (error) {
    console.error('Delete assignment error:', error);
    return error.response;
  }
};

/**
 * Get all submissions
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response
 */
const getSubmissions = async (params = {}) => {
  try {
    const response = await api.get('/assessments/submissions', { params });
    return response;
  } catch (error) {
    console.error('Get submissions error:', error);
    return error.response;
  }
};


/**
 * Get my quiz attempts
 * @param {string} quizId - Quiz UUID
 * @returns {Promise<Object>} Response
 */
const getQuizAttempts = async (quizId) => {
  try {
    const response = await api.get(`/assessments/quizzes/${quizId}/my-attempts`);
    return response;
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    return error.response;
  }
};

/**
 * Get my submissions for an assignment
 * @param {string} assignmentId - Assignment UUID
 * @returns {Promise<Object>} Response
 */
const getMySubmissions = async (assignmentId) => {
  try {
    const response = await api.get(`/assessments/assignments/${assignmentId}/my-submissions`);
    return response;
  } catch (error) {
    console.error('Get my submissions error:', error);
    return error.response;
  }
};

/**
 * Get assignment details
 * @param {string} assignmentId - Assignment UUID
 * @returns {Promise<Object>} Response
 */
const getAssignment = async (assignmentId) => {
  try {
    const response = await api.get(`/assessments/assignments/${assignmentId}`);
    return response;
  } catch (error) {
    console.error('Get assignment error:', error);
    return error.response;
  }
};

/**
 * Get course assessments (quizzes and assignments)
 * @param {string} courseId - Course UUID
 * @returns {Promise<Object>} Response
 */
const getCourseAssessments = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/assessments`);
    return response;
  } catch (error) {
    console.error('Get course assessments error:', error);
    return error.response;
  }
};

const assessmentService = {
  getQuiz,
  createQuiz,
  deleteQuiz,
  addQuestion,
  submitQuizAttempt,
  getQuizAttempts,
  createAssignment,
  getAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissions,
  getMySubmissions,
  getCourseAssessments,
};

export default assessmentService;
