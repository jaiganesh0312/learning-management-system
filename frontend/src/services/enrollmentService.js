import api from '@/config/axiosConfig';

/**
 * Get current user's enrollments
 * @returns {Promise<Object>} Response with enrollments array
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Array} response.data.data - Array of enrollment objects
 */
const getMyEnrollments = async () => {
  try {
    const response = await api.get('/enrollments/my-enrollments');
    return response;
  } catch (error) {
    console.error('Get my enrollments error:', error);
    return error.response;
  }
};

/**
 * Enroll a user in a course or learning path
 * @param {Object} data - Enrollment data
 * @param {string} [data.userId] - User UUID (optional, uses current user if not provided)
 * @param {string} [data.courseId] - Course UUID (required if not learningPathId)
 * @param {string} [data.learningPathId] - Learning path UUID (required if not courseId)
 * @param {string} [data.dueDate] - Due date for completion
 * @returns {Promise<Object>} Response with created enrollment
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Created enrollment object
 */
const enrollUser = async (data) => {
  try {
    const response = await api.post('/enrollments', data);
    return response;
  } catch (error) {
    console.error('Enroll user error:', error);
    return error.response;
  }
};

/**
 * Update course progress for an enrollment
 * @param {string} enrollmentId - Enrollment UUID (required)
 * @param {Object} data - Progress data
 * @param {string} data.courseMaterialId - Material UUID (required)
 * @param {string} [data.status] - Progress status ('not_started', 'in_progress', 'completed')
 * @param {number} [data.timeSpent] - Time spent in seconds
 * @param {number} [data.completionPercentage] - Completion percentage (0-100)
 * @param {number} [data.lastPlaybackPosition] - Last video position in seconds
 * @param {number} [data.playbackSpeed] - Playback speed (e.g., 1.5 for 1.5x)
 * @returns {Promise<Object>} Response with updated progress
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Updated course progress object
 */
const updateProgress = async (enrollmentId, data) => {
  try {
    const response = await api.post(`/enrollments/${enrollmentId}/progress`, data);
    return response;
  } catch (error) {
    console.error('Update progress error:', error);
    return error.response;
  }
};

/**
 * Check if current user is enrolled in a course
 * @param {string} courseId - Course UUID (required)
 * @returns {Promise<Object>} Response with enrollment data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {boolean} response.data.isEnrolled - Whether user is enrolled
 * @returns {Object} [response.data.data] - Enrollment object if enrolled
 */
const getEnrollmentByCourse = async (courseId) => {
  try {
    const response = await api.get(`/enrollments/course/${courseId}`);
    return response;
  } catch (error) {
    // Return 404 as not enrolled, not an error
    if (error.response?.status === 404) {
      return { data: { success: false, isEnrolled: false } };
    }
    console.error('Get enrollment by course error:', error);
    return error.response;
  }
};

/**
 * Get detailed enrollment information with all materials and progress
 * @param {string} enrollmentId - Enrollment UUID (required)
 * @returns {Promise<Object>} Response with enrollment details
 * @returns {boolean} response.data.success - Operation success status
 * @returns {Object} response.data.data - Enrollment with course, materials, and progress
 */
const getEnrollmentDetails = async (enrollmentId) => {
  try {
    const response = await api.get(`/enrollments/${enrollmentId}/details`);
    return response;
  } catch (error) {
    console.error('Get enrollment details error:', error);
    return error.response;
  }
};

const enrollmentService = {
  getMyEnrollments,
  enrollUser,
  updateProgress,
  getEnrollmentByCourse,
  getEnrollmentDetails,
};

export default enrollmentService;
