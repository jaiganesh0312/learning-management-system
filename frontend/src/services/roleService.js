import api from '@/config/axiosConfig';

/**
 * Get all available roles
 * @returns {Promise<Object>} Response with roles array
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Array} response.data.data - Array of role objects
 */
const getAllRoles = async () => {
  try {
    const response = await api.get('/roles');
    return response;
  } catch (error) {
    console.error('Get all roles error:', error);
    return error.response;
  }
};

/**
 * Get roles for a specific user
 * @param {string} userId - User UUID (required)
 * @returns {Promise<Object>} Response with user roles
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Array} response.data.data - Array of user role objects
 */
const getUserRoles = async (userId) => {
  try {
    const response = await api.get(`/roles/user/${userId}`);
    return response;
  } catch (error) {
    console.error('Get user roles error:', error);
    return error.response;
  }
};

/**
 * Get all users with their roles (Super Admin only)
 * @returns {Promise<Object>} Response with users and their roles
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Array} response.data.data - Array of users with roles
 */
const getAllUsersWithRoles = async () => {
  try {
    const response = await api.get('/roles/users');
    return response;
  } catch (error) {
    console.error('Get all users with roles error:', error);
    return error.response;
  }
};

/**
 * Get all users with specific role (Super Admin only)
 * @param {string} role - Role name (required)
 * @returns {Promise<Object>} Response with users and their roles
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Array} response.data.data - Array of users with roles
 */
const getAllUsersWithSpecificRoles = async (roles) => {
  try {
    const response = await api.post('/roles/get-users-with-specific-roles', {roles });
    return response;
  } catch (error) {
    console.error('Get all users with specific role error:', error);
    return error.response;
  }
};

/**
 * Get current user's active role
 * @returns {Promise<Object>} Response with active role
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Active role object
 */
const getMyActiveRole = async () => {
  try {
    const response = await api.get('/roles/my-active-role');
    return response;
  } catch (error) {
    console.error('Get my active role error:', error);
    return error.response;
  }
};

/**
 * Assign role to user (Super Admin only)
 * @param {Object} data - Role assignment data
 * @param {string} data.userId - User UUID (required)
 * @param {string} data.roleId - Role UUID (required)
 * @param {string} [data.departmentId] - Department UUID (optional)
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Created user role object
 */
const assignRole = async (data) => {
  try {
    const response = await api.post('/roles/assign', data);
    return response;
  } catch (error) {
    console.error('Assign role error:', error);
    return error.response;
  }
};

/**
 * Revoke role from user (Super Admin only)
 * @param {Object} data - Role revocation data
 * @param {string} data.userId - User UUID (required)
 * @param {string} data.roleId - Role UUID (required)
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 */
const revokeRole = async (data) => {
  try {
    const response = await api.post('/roles/revoke', data);
    return response;
  } catch (error) {
    console.error('Revoke role error:', error);
    return error.response;
  }
};

/**
 * Switch active role for current user
 * @param {Object} data - Role switch data
 * @param {string} data.roleId - Role UUID to switch to (required)
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Updated active role
 */
const switchActiveRole = async (data) => {
  try {
    const response = await api.post('/roles/switch', data);
    return response;
  } catch (error) {
    console.error('Switch active role error:', error);
    return error.response;
  }
};

const roleService = {
  getAllRoles,
  getUserRoles,
  getAllUsersWithRoles,
  getAllUsersWithSpecificRoles,
  getMyActiveRole,
  assignRole,
  revokeRole,
  switchActiveRole,
};

export default roleService;
