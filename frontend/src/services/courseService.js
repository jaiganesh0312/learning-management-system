import api from '@/config/axiosConfig';

/**
 * Get all courses with optional filters
 * @param {Object} params - Query parameters for filtering
 * @param {string} [params.search] - Search term
 * @param {string} [params.category] - Filter by category
 * @param {string} [params.status] - Filter by status
 * @returns {Promise<Object>} Response with courses array
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Array} response.data.data - Array of course objects
 */
const getAllCourses = async (params = {}) => {
  try {
    const response = await api.get('/courses', { params });
    return response;
  } catch (error) {
    console.error('Get all courses error:', error);
    return error.response;
  }
};

/**
 * Get my courses
 * @returns {Promise<Object>} Response with courses array
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Array} response.data.data - Array of course objects
 */
const getMyCourses = async () => {
  try {
    const response = await api.get('/courses/my-courses');
    return response;
  } catch (error) {
    console.error('Get my courses error:', error);
    return error.response;
  }
};

/**
 * Get course by ID
 * @param {string} id - Course UUID (required)
 * @returns {Promise<Object>} Response with course data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Course object
 */
const getCourse = async (id) => {
  try {
    const response = await api.get(`/courses/${id}`);
    return response;
  } catch (error) {
    console.error('Get course error:', error);
    return error.response;
  }
};

/**
 * Create a new course
 * @param {Object} data - Course data
 * @param {string} data.title - Course title (required)
 * @param {string} [data.description] - Course description
 * @param {string} [data.category] - Course category
 * @param {number} [data.duration] - Course duration in hours
 * @param {string} [data.level] - Course level
 * @returns {Promise<Object>} Response with created course
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Created course object
 */
const createCourse = async (data) => {
  try {
    const response = await api.post('/courses', data);
    return response;
  } catch (error) {
    console.error('Create course error:', error);
    return error.response;
  }
};

/**
 * Update an existing course
 * @param {string} id - Course UUID (required)
 * @param {Object} data - Updated course data
 * @param {string} [data.title] - Course title
 * @param {string} [data.description] - Course description
 * @param {string} [data.category] - Course category
 * @param {number} [data.duration] - Course duration in hours
 * @param {string} [data.level] - Course level
 * @returns {Promise<Object>} Response with updated course
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Updated course object
 */
const updateCourse = async (id, data) => {
  try {
    const response = await api.put(`/courses/${id}`, data);
    return response;
  } catch (error) {
    console.error('Update course error:', error);
    return error.response;
  }
};

/**
 * Delete a course
 * @param {string} id - Course UUID (required)
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 */
const deleteCourse = async (id) => {
  try {
    const response = await api.delete(`/courses/${id}`);
    return response;
  } catch (error) {
    console.error('Delete course error:', error);
    return error.response;
  }
};

/**
 * Upload course material
 * @param {string} courseId - Course UUID (required)
 * @param {FormData} formData - Form data with file and material details
 * @returns {Promise<Object>} Response with uploaded material
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Course material object
 */
const uploadCourseMaterial = async (courseId, formData) => {
  try {
    const response = await api.post(`/courses/${courseId}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Upload course material error:', error);
    return error.response;
  }
};

/**
 * Toggle course publish status
 * @param {string} id - Course UUID (required)
 * @returns {Promise<Object>} Response with updated course
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Updated course object
 */
const togglePublishStatus = async (id, status) => {
  try {
    const response = await api.patch(`/courses/${id}/status`, { status });
    return response;
  } catch (error) {
    console.error('Toggle publish status error:', error);
    return error.response;
  }
};

/**
 * Delete course material
 * @param {string} courseId - Course UUID
 * @param {string} materialId - Material UUID
 * @returns {Promise<Object>} Response
 */
const deleteCourseMaterial = async (courseId, materialId) => {
  try {
    const response = await api.delete(`/courses/${courseId}/materials/${materialId}`);
    return response;
  } catch (error) {
    console.error('Delete material error:', error);
    return error.response;
  }
};

/**
 * Update material order
 * @param {string} courseId - Course UUID
 * @param {Array} materials - Array of {id, order}
 * @returns {Promise<Object>} Response
 */
const updateMaterialOrder = async (courseId, materials) => {
  try {
    const response = await api.put(`/courses/${courseId}/materials/reorder`, { materials });
    return response;
  } catch (error) {
    console.error('Update material order error:', error);
    return error.response;
  }
};

/**
 * Upload course thumbnail
 * @param {string} courseId - Course UUID (required)
 * @param {File} file - Thumbnail image file
 * @returns {Promise<Object>} Response with thumbnail URL
 */
const uploadCourseThumbnail = async (courseId, file) => {
  try {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    const response = await api.post(`/courses/${courseId}/thumbnail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Upload thumbnail error:', error);
    return error.response;
  }
};

const courseService = {
  getAllCourses,
  getMyCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadCourseMaterial,
  deleteCourseMaterial,
  togglePublishStatus,
  updateMaterialOrder,
  uploadCourseThumbnail,
};

export default courseService;
