import api from '@/config/axiosConfig';

/**
 * Register a new user
 * @param {Object} data - Registration data
 * @param {string} data.email - User email (required)
 * @param {string} data.firstName - User first name (required)
 * @param {string} data.lastName - User last name (required)
 * @param {string} data.phoneNumber - User phone number (optional)
 * @returns {Promise<Object>} Response with success status and message
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - User data (without sensitive info)
 */
const register = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return error.response;
  }
};

/**
 * Verify OTP for user registration
 * @param {Object} data - OTP verification data
 * @param {string} data.email - User email (required)
 * @param {string} data.otp - OTP code (required)
 * @returns {Promise<Object>} Response with token and user data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - User and token data
 * @returns {string} response.data.data.token - JWT token
 * @returns {Object} response.data.data.user - User object
 */
const verifyOtp = async (data) => {
  try {
    const response = await api.post('/auth/verify-otp', data);
    return response;
  } catch (error) {
    console.error('OTP verification error:', error);
    return error.response;
  }
};

/**
 * Login user
 * @param {Object} data - Login credentials
 * @param {string} data.email - User email (required)
 * @param {string} data.password - User password (required)
 * @returns {Promise<Object>} Response with token and user data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Login data
 * @returns {string} response.data.data.token - JWT token
 * @returns {Object} response.data.data.user - User object
 * @returns {Array} response.data.data.roles - User roles
 */
const login = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return error.response;
  }
};

/**
 * Set password for first-time login (requires authentication)
 * @param {Object} data - Password data
 * @param {string} data.newPassword - New password (required)
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 */
const setPassword = async (data) => {
  try {
    const response = await api.post('/auth/set-password', data);
    return response;
  } catch (error) {
    console.error('Set password error:', error);
    return error.response;
  }
};

/**
 * Update user password (requires authentication)
 * @param {Object} data - Password update data
 * @param {string} data.oldPassword - Current password (required)
 * @param {string} data.newPassword - New password (required)
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 */
const updatePassword = async (data) => {
  try {
    const response = await api.post('/auth/update-password', data);
    return response;
  } catch (error) {
    console.error('Update password error:', error);
    return error.response;
  }
};

const authService = {
  register,
  verifyOtp,
  login,
  setPassword,
  updatePassword,
};

export default authService;
