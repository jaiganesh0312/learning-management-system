import api from '@/config/axiosConfig';

/**
 * Get dashboard statistics (role-based data filtering on backend)
 * @returns {Promise<Object>} Response with dashboard stats
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Dashboard statistics object
 */
const getDashboardStats = async () => {
  try {
    const response = await api.get('/reports/dashboard');
    return response;
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return error.response;
  }
};

/**
 * Get compliance report with filters
 * @param {Object} params - Query parameters for filtering
 * @param {string} [params.departmentId] - Filter by department
 * @param {string} [params.startDate] - Start date for report
 * @param {string} [params.endDate] - End date for report
 * @returns {Promise<Object>} Response with compliance data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Compliance report data
 */
const getComplianceReport = async (params = {}) => {
  try {
    const response = await api.get('/reports/compliance', { params });
    return response;
  } catch (error) {
    console.error('Get compliance report error:', error);
    return error.response;
  }
};

/**
 * Get audit logs with filters (from reporting controller)
 * @param {Object} params - Query parameters for filtering
 * @param {string} [params.userId] - Filter by user
 * @param {string} [params.action] - Filter by action
 * @param {string} [params.startDate] - Start date
 * @param {string} [params.endDate] - End date
 * @returns {Promise<Object>} Response with audit logs
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Array} response.data.data - Array of audit log objects
 */
const getAuditLogs = async (params = {}) => {
  try {
    const response = await api.get('/reports/audit-logs', { params });
    return response;
  } catch (error) {
    console.error('Get audit logs error:', error);
    return error.response;
  }
};

/**
 * Get Super Admin dashboard data
 * @returns {Promise<Object>} Response with super admin dashboard data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Super admin dashboard data
 */
const getSuperAdminDashboard = async () => {
  try {
    const response = await api.get('/reports/dashboard/super-admin');
    return response;
  } catch (error) {
    console.error('Get super admin dashboard error:', error);
    return error.response;
  }
};

/**
 * Get Content Creator dashboard data
 * @returns {Promise<Object>} Response with content creator dashboard data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Content creator dashboard data
 */
const getContentCreatorDashboard = async () => {
  try {
    const response = await api.get('/reports/dashboard/content-creator');
    return response;
  } catch (error) {
    console.error('Get content creator dashboard error:', error);
    return error.response;
  }
};

/**
 * Get Compliance Officer dashboard data
 * @returns {Promise<Object>} Response with compliance officer dashboard data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Compliance officer dashboard data
 */
const getComplianceOfficerDashboard = async () => {
  try {
    const response = await api.get('/reports/dashboard/compliance-officer');
    return response;
  } catch (error) {
    console.error('Get compliance officer dashboard error:', error);
    return error.response;
  }
};

/**
 * Get Department Manager dashboard data
 * @returns {Promise<Object>} Response with department manager dashboard data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Department manager dashboard data
 */
const getDepartmentManagerDashboard = async () => {
  try {
    const response = await api.get('/reports/dashboard/department-manager');
    return response;
  } catch (error) {
    console.error('Get department manager dashboard error:', error);
    return error.response;
  }
};

/**
 * Get Auditor dashboard data
 * @returns {Promise<Object>} Response with auditor dashboard data
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Auditor dashboard data
 */
const getAuditorDashboard = async () => {
  try {
    const response = await api.get('/reports/dashboard/auditor');
    return response;
  } catch (error) {
    console.error('Get auditor dashboard error:', error);
    return error.response;
  }
};

const reportingService = {
  getDashboardStats,
  getComplianceReport,
  getAuditLogs,
  getSuperAdminDashboard,
  getContentCreatorDashboard,
  getComplianceOfficerDashboard,
  getDepartmentManagerDashboard,
  getAuditorDashboard,
};

export default reportingService;
