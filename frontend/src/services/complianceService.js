import api from '@/config/axiosConfig';

/**
 * Get department-wise compliance status
 * @param {Object} params - Query parameters
 * @param {string} [params.departmentId] - Filter by department ID
 * @param {string} [params.pathId] - Filter by learning path ID
 * @param {string} [params.status] - Filter by status
 * @returns {Promise<Object>} Response with compliance status
 */
const getDepartmentComplianceStatus = async (params = {}) => {
  try {
    const response = await api.get('/compliance/department-status', { params });
    return response;
  } catch (error) {
    console.error('Get department compliance status error:', error);
    return error.response;
  }
};

/**
 * Send compliance reminders
 * @param {Object} data - Reminder data
 * @param {Array<string>} [data.departmentIds] - Department IDs to send reminders to
 * @param {Array<string>} [data.userIds] - User IDs to send reminders to
 * @param {string} [data.pathId] - Learning path ID
 * @param {string} [data.reminderType] - Type: 'overdue', 'upcoming', 'all'
 * @param {string} data.message - Reminder message
 * @param {string} [data.title] - Reminder title
 * @returns {Promise<Object>} Response with reminder status
 */
const sendComplianceReminders = async (data) => {
  try {
    const response = await api.post('/compliance/reminders', data);
    return response;
  } catch (error) {
    console.error('Send compliance reminders error:', error);
    return error.response;
  }
};

/**
 * Bulk assign compliance path to users/departments
 * @param {Object} data - Assignment data
 * @param {string} data.pathId - Learning path ID (required)
 * @param {Array<string>} [data.userIds] - User IDs to assign
 * @param {Array<string>} [data.departmentIds] - Department IDs to assign
 * @param {string} [data.dueDate] - Due date for completion
 * @returns {Promise<Object>} Response with assignment status
 */
const bulkAssignCompliancePath = async (data) => {
  try {
    const response = await api.post('/compliance/bulk-assign', data);
    return response;
  } catch (error) {
    console.error('Bulk assign compliance path error:', error);
    return error.response;
  }
};

/**
 * Get compliance metrics
 * @param {Object} params - Query parameters
 * @param {string} [params.startDate] - Start date for metrics
 * @param {string} [params.endDate] - End date for metrics
 * @param {string} [params.departmentId] - Filter by department
 * @param {string} [params.pathId] - Filter by learning path
 * @returns {Promise<Object>} Response with compliance metrics
 */
const getComplianceMetrics = async (params = {}) => {
  try {
    const response = await api.get('/compliance/metrics', { params });
    return response;
  } catch (error) {
    console.error('Get compliance metrics error:', error);
    return error.response;
  }
};

/**
 * Escalate overdue training to managers
 * @param {Object} data - Escalation data
 * @param {string} [data.departmentId] - Department ID to escalate
 * @param {string} [data.pathId] - Learning path ID
 * @param {number} [data.daysOverdue] - Minimum days overdue (default: 7)
 * @returns {Promise<Object>} Response with escalation status
 */
const escalateOverdueTraining = async (data) => {
  try {
    const response = await api.post('/compliance/escalate', data);
    return response;
  } catch (error) {
    console.error('Escalate overdue training error:', error);
    return error.response;
  }
};

const complianceService = {
  getDepartmentComplianceStatus,
  sendComplianceReminders,
  bulkAssignCompliancePath,
  getComplianceMetrics,
  escalateOverdueTraining,
};

export default complianceService;
