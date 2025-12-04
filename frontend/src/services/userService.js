import api from '@/config/axiosConfig';

/**
 * Get all users (Super Admin only)
 * @returns {Promise<Object>} Response with users array
 */
const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response;
  } catch (error) {
    console.error('Get all users error:', error);
    return error.response;
  }
};

/**
 * Get user by ID
 * @param {string} id - User UUID (required)
 * @returns {Promise<Object>} Response with user data
 */
const getUser = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response;
  } catch (error) {
    console.error('Get user error:', error);
    return error.response;
  }
};

/**
 * Update user
 * @param {string} id - User UUID (required)
 * @param {Object} data - Updated user data
 * @returns {Promise<Object>} Response with updated user
 */
const updateUser = async (id, data) => {
  try {
    const response = await api.put(`/users/${id}`, data);
    return response;
  } catch (error) {
    console.error('Update user error:', error);
    return error.response;
  }
};

/**
 * Delete user
 * @param {string} id - User UUID (required)
 * @returns {Promise<Object>} Response with success status
 */
const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response;
  } catch (error) {
    console.error('Delete user error:', error);
    return error.response;
  }
};

const userService = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};

export default userService;
