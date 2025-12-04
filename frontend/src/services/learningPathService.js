import api from '@/config/axiosConfig';

/**
 * Get all learning paths with optional filters
 * @param {Object} params - Query parameters for filtering
 * @param {string} [params.search] - Search term
 * @param {string} [params.category] - Filter by category
 * @returns {Promise<Object>} Response with learning paths array
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Array} response.data.data - Array of learning path objects
 */
const getAllLearningPaths = async (params = {}) => {
  try {
    const response = await api.get('/learning-paths', { params });
    return response;
  } catch (error) {
    console.error('Get all learning paths error:', error);
    return error.response;
  }
};

/**
 * Get learning path by ID
 * @param {string} id - Learning path UUID (required)
 * @returns {Promise<Object>} Response with learning path data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Learning path object with courses
 */
const getLearningPath = async (id) => {
  try {
    const response = await api.get(`/learning-paths/${id}`);
    return response;
  } catch (error) {
    console.error('Get learning path error:', error);
    return error.response;
  }
};

/**
 * Create a new learning path
 * @param {Object} data - Learning path data
 * @param {string} data.title - Learning path title (required)
 * @param {string} [data.description] - Learning path description
 * @param {string} [data.category] - Learning path category
 * @param {number} [data.estimatedDuration] - Estimated duration in hours
 * @returns {Promise<Object>} Response with created learning path
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Created learning path object
 */
const createLearningPath = async (data) => {
  try {
    const response = await api.post('/learning-paths', data);
    return response;
  } catch (error) {
    console.error('Create learning path error:', error);
    return error.response;
  }
};

/**
 * Update an existing learning path
 * @param {string} id - Learning path UUID (required)
 * @param {Object} data - Updated learning path data
 * @param {string} [data.title] - Learning path title
 * @param {string} [data.description] - Learning path description
 * @param {string} [data.category] - Learning path category
 * @param {number} [data.estimatedDuration] - Estimated duration in hours
 * @returns {Promise<Object>} Response with updated learning path
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Updated learning path object
 */
const updateLearningPath = async (id, data) => {
  try {
    const response = await api.put(`/learning-paths/${id}`, data);
    return response;
  } catch (error) {
    console.error('Update learning path error:', error);
    return error.response;
  }
};

/**
 * Delete a learning path
 * @param {string} id - Learning path UUID (required)
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 */
const deleteLearningPath = async (id) => {
  try {
    const response = await api.delete(`/learning-paths/${id}`);
    return response;
  } catch (error) {
    console.error('Delete learning path error:', error);
    return error.response;
  }
};

/**
 * Add course to learning path
 * @param {string} id - Learning path UUID (required)
 * @param {Object} data - Course data
 * @param {string} data.courseId - Course UUID (required)
 * @param {number} data.orderIndex - Order index of course in path (required)
 * @returns {Promise<Object>} Response with updated learning path
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Learning path course object
 */
const addCourseToPath = async (id, data) => {
  try {
    const response = await api.post(`/learning-paths/${id}/courses`, data);
    return response;
  } catch (error) {
    console.error('Add course to path error:', error);
    return error.response;
  }
};

/**
 * Remove course from learning path
 * @param {string} id - Learning path UUID (required)
 * @param {string} courseId - Course UUID (required)
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 */
const removeCourseFromPath = async (id, courseId) => {
  try {
    const response = await api.delete(`/learning-paths/${id}/courses/${courseId}`);
    return response;
  } catch (error) {
    console.error('Remove course from path error:', error);
    return error.response;
  }
};

const learningPathService = {
  getAllLearningPaths,
  getLearningPath,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
  addCourseToPath,
  removeCourseFromPath,
};

export default learningPathService;
