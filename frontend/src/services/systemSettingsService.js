import api from '@/config/axiosConfig';

/**
 * Get system settings
 * @returns {Promise<Object>} Response with system settings
 */
const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response;
  } catch (error) {
    console.error('Get settings error:', error);
    return error.response;
  }
};

/**
 * Update system settings
 * @param {Object} data - Updated settings data
 * @returns {Promise<Object>} Response with updated settings
 */
const updateSettings = async (data) => {
  try {
    const response = await api.put('/settings', data);
    return response;
  } catch (error) {
    console.error('Update settings error:', error);
    return error.response;
  }
};

const systemSettingsService = {
  getSettings,
  updateSettings,
};

export default systemSettingsService;
