import api from '@/config/axiosConfig';

/**
 * Get audit logs with filters
 * @param {Object} params - Query parameters for filtering
 * @param {string} [params.userId] - Filter by user UUID
 * @param {string} [params.action] - Filter by action type
 * @param {string} [params.entityType] - Filter by entity type
 * @param {string} [params.startDate] - Start date for filtering
 * @param {string} [params.endDate] - End date for filtering
 * @param {number} [params.page] - Page number for pagination
 * @param {number} [params.limit] - Items per page
 * @returns {Promise<Object>} Response with audit logs
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Audit logs data with pagination
 * @returns {Array} response.data.data.logs - Array of audit log objects
 * @returns {Object} response.data.data.pagination - Pagination info
 */
const getAuditLogs = async (params = {}) => {
  try {
    const response = await api.get('/audit-logs', { params });
    return response;
  } catch (error) {
    console.error('Get audit logs error:', error);
    return error.response;
  }
};

/**
 * Export audit logs in specified format
 * @param {Object} params - Export parameters
 * @param {string} [params.format] - Export format: 'csv' | 'json' (default: 'csv')
 * @param {string} [params.userId] - Filter by user UUID
 * @param {string} [params.action] - Filter by action type
 * @param {string} [params.startDate] - Start date for filtering
 * @param {string} [params.endDate] - End date for filtering
 * @returns {Promise<Object>} Response with export file or download URL
 * @returns {boolean} response.data.success - Operation success status
 * @returns {string} response.data.message - Response message
 * @returns {Object} response.data.data - Export data or download URL
 */
const exportAuditLogs = async (params = {}) => {
  try {
    const response = await api.get('/audit-logs/export', { 
      params,
      responseType: params.format === 'csv' ? 'blob' : 'json'
    });
    return response;
  } catch (error) {
    console.error('Export audit logs error:', error);
    return error.response;
  }
};

const auditLogService = {
  getAuditLogs,
  exportAuditLogs,
};

export default auditLogService;
