import api from '@/config/axiosConfig';

/**
 * Get all departments
 * @returns {Promise<Object>} Response with departments array
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Array} response.data.data - Array of department objects
 */
const getAllDepartments = async () => {
  try {
    const response = await api.get('/departments');
    return response;
  } catch (error) {
    console.error('Get all departments error:', error);
    return error.response;
  }
};

/**
 * Get department by ID
 * @param {string} id - Department UUID (required)
 * @returns {Promise<Object>} Response with department data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Department object with members
 */
const getDepartment = async (id) => {
  try {
    const response = await api.get(`/departments/${id}`);
    return response;
  } catch (error) {
    console.error('Get department error:', error);
    return error.response;
  }
};

/**
 * Create a new department
 * @param {Object} data - Department data
 * @param {string} data.name - Department name (required)
 * @param {string} [data.description] - Department description
 * @param {string} [data.parentDepartmentId] - Parent Department ID
 * @param {string} [data.managerId] - Manager User ID
 * @returns {Promise<Object>} Response with created department
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Created department object
 */
const createDepartment = async (data) => {
  try {
    const response = await api.post('/departments', data);
    return response;
  } catch (error) {
    console.error('Create department error:', error);
    return error.response;
  }
};

/**
 * Update an existing department
 * @param {string} id - Department UUID (required)
 * @param {Object} data - Updated department data
 * @param {string} [data.name] - Department name
 * @param {string} [data.description] - Department description
 * @param {string} [data.parentDepartmentId] - Parent Department ID
 * @param {string} [data.managerId] - Manager User ID
 * @returns {Promise<Object>} Response with updated department
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Updated department object
 */
const updateDepartment = async (id, data) => {
  try {
    const response = await api.put(`/departments/${id}`, data);
    return response;
  } catch (error) {
    console.error('Update department error:', error);
    return error.response;
  }
};

/**
 * Delete a department
 * @param {string} id - Department UUID (required)
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 */
const deleteDepartment = async (id) => {
  try {
    const response = await api.delete(`/departments/${id}`);
    return response;
  } catch (error) {
    console.error('Delete department error:', error);
    return error.response;
  }
};

/**
 * Assign user to department
 * @param {string} id - Department UUID (required)
 * @param {Object} data - User assignment data
 * @param {string} data.userId - User UUID (required)
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Updated user object
 */
const assignUserToDepartment = async (id, data) => {
  try {
    const response = await api.post(`/departments/${id}/members`, data);
    return response;
  } catch (error) {
    console.error('Assign user to department error:', error);
    return error.response;
  }
};

/**
 * Remove user from department
 * @param {string} id - Department UUID (required)
 * @param {string} userId - User UUID (required)
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 */
const removeUserFromDepartment = async (id, userId) => {
  try {
    const response = await api.delete(`/departments/${id}/members/${userId}`);
    return response;
  } catch (error) {
    console.error('Remove user from department error:', error);
    return error.response;
  }
};

const departmentService = {
  getAllDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignUserToDepartment,
  removeUserFromDepartment,
};

export default departmentService;
