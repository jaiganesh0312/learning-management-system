import api from '@/config/axiosConfig';

/**
 * Get current user's certificates
 * @returns {Promise<Object>} Response with certificates array
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Array} response.data.data - Array of certificate objects
 */
const getMyCertificates = async () => {
  try {
    const response = await api.get('/certificates/my-certificates');
    return response;
  } catch (error) {
    console.error('Get my certificates error:', error);
    return error.response;
  }
};

/**
 * Get certificate by ID
 * @param {string} certificateId - Certificate UUID (required)
 * @returns {Promise<Object>} Response with certificate data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Certificate object
 */
const getCertificate = async (certificateId) => {
  try {
    const response = await api.get(`/certificates/${certificateId}`);
    return response;
  } catch (error) {
    console.error('Get certificate error:', error);
    return error.response;
  }
};

/**
 * Get certificates for a specific user (requires permission)
 * @param {string} userId - User UUID (required)
 * @returns {Promise<Object>} Response with user certificates
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Array} response.data.data - Array of certificate objects
 */
const getUserCertificates = async (userId) => {
  try {
    const response = await api.get(`/certificates/user/${userId}`);
    return response;
  } catch (error) {
    console.error('Get user certificates error:', error);
    return error.response;
  }
};

/**
 * Generate certificate for enrollment
 * @param {string} enrollmentId - Enrollment UUID (required)
 * @returns {Promise<Object>} Response with generated certificate
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Generated certificate object
 */
const generateCertificate = async (enrollmentId) => {
  try {
    const response = await api.post(`/certificates/generate/${enrollmentId}`);
    return response;
  } catch (error) {
    console.error('Generate certificate error:', error);
    return error.response;
  }
};

const certificateService = {
  getMyCertificates,
  getCertificate,
  getUserCertificates,
  generateCertificate,
};

export default certificateService;
