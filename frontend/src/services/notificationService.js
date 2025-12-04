import api from '@/config/axiosConfig';

/**
 * Get notifications for the logged-in user
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=20] - Items per page
 * @param {boolean} [params.unreadOnly=false] - Filter for unread notifications only
 * @returns {Promise<Object>} Response with notifications array and pagination
 */
const getNotifications = async (params = {}) => {
  try {
    const response = await api.get('/notifications', { params });
    return response;
  } catch (error) {
    console.error('Get notifications error:', error);
    return error.response;
  }
};

/**
 * Get unread notification count
 * @returns {Promise<Object>} Response with unread count
 */
const getUnreadCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response;
  } catch (error) {
    console.error('Get unread count error:', error);
    return error.response;
  }
};

/**
 * Send notification/reminder to users
 * @param {Object} data - Notification data
 * @param {Array<string>} data.userIds - Array of user IDs to send notification to
 * @param {string} data.message - Notification message (required)
 * @param {string} [data.title] - Notification title
 * @param {string} [data.type='reminder'] - Notification type
 * @param {string} [data.priority='medium'] - Priority level (low, medium, high)
 * @returns {Promise<Object>} Response with success status
 */
const sendNotification = async (data) => {
  try {
    const response = await api.post('/notifications/send', data);
    return response;
  } catch (error) {
    console.error('Send notification error:', error);
    return error.response;
  }
};

/**
 * Mark notification as read
 * @param {string} id - Notification UUID (required)
 * @returns {Promise<Object>} Response with success status
 */
const markAsRead = async (id) => {
  try {
    const response = await api.put(`/notifications/${id}/read`);
    return response;
  } catch (error) {
    console.error('Mark as read error:', error);
    return error.response;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Response with success status
 */
const markAllAsRead = async () => {
  try {
    const response = await api.put('/notifications/mark-all-read');
    return response;
  } catch (error) {
    console.error('Mark all as read error:', error);
    return error.response;
  }
};

/**
 * Delete notification
 * @param {string} id - Notification UUID (required)
 * @returns {Promise<Object>} Response with success status
 */
const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/notifications/${id}`);
    return response;
  } catch (error) {
    console.error('Delete notification error:', error);
    return error.response;
  }
};

const notificationService = {
  getNotifications,
  getUnreadCount,
  sendNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

export default notificationService;
