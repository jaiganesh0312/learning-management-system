import api from '@/config/axiosConfig';

/**
 * Create a new enquiry (public route)
 * @param {Object} data - Enquiry data
 * @param {string} data.name - Name of person making enquiry (required)
 * @param {string} data.email - Email address (required)
 * @param {string} [data.phone] - Phone number
 * @param {string} data.subject - Enquiry subject (required)
 * @param {string} data.message - Enquiry message (required)
 * @returns {Promise<Object>} Response with created enquiry
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Created enquiry object
 */
const createEnquiry = async (data) => {
  try {
    const response = await api.post('/enquiries', data);
    return response;
  } catch (error) {
    console.error('Create enquiry error:', error);
    return error.response;
  }
};

/**
 * Get all enquiries with optional filters
 * @param {Object} params - Query parameters for filtering
 * @param {string} [params.status] - Filter by status
 * @param {string} [params.startDate] - Start date
 * @param {string} [params.endDate] - End date
 * @returns {Promise<Object>} Response with enquiries array
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Array} response.data.data - Array of enquiry objects
 */
const getAllEnquiries = async (params = {}) => {
  try {
    const response = await api.get('/enquiries', { params });
    return response;
  } catch (error) {
    console.error('Get all enquiries error:', error);
    return error.response;
  }
};

/**
 * Get enquiry by ID
 * @param {string} id - Enquiry UUID (required)
 * @returns {Promise<Object>} Response with enquiry data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Enquiry object
 */
const getEnquiryById = async (id) => {
  try {
    const response = await api.get(`/enquiries/${id}`);
    return response;
  } catch (error) {
    console.error('Get enquiry by ID error:', error);
    return error.response;
  }
};

/**
 * Update enquiry status
 * @param {string} id - Enquiry UUID (required)
 * @param {Object} data - Status update data
 * @param {string} data.status - New status (required)
 * @returns {Promise<Object>} Response with updated enquiry
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Updated enquiry object
 */
const updateEnquiryStatus = async (id, data) => {
  try {
    const response = await api.patch(`/enquiries/${id}/status`, data);
    return response;
  } catch (error) {
    console.error('Update enquiry status error:', error);
    return error.response;
  }
};

const enquiryService = {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
};

export default enquiryService;
