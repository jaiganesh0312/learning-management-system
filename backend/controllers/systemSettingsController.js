const { createAuditLog } = require('../utils/auditLogger');

// In-memory settings store (in production, this would be in database)
let systemSettings = {
  general: {
    systemName: 'Learning Management System',
    systemLogo: '/uploads/logo.png',
    timezone: 'UTC',
    language: 'en',
  },
  email: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpSecure: true,
    fromEmail: 'noreply@lms.com',
    fromName: 'LMS',
  },
  security: {
    minPasswordLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
  },
  learning: {
    defaultCertificateTemplate: 'standard',
    minCompletionPercentage: 80,
    enableDiscussions: true,
    enableRatings: true,
  },
};

/**
 * Get all system settings (Super Admin only)
 */
const getSettings = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: systemSettings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message,
    });
  }
};

/**
 * Update system settings (Super Admin only)
 */
const updateSettings = async (req, res) => {
  try {
    const updates = req.body;

    // Merge updates with existing settings
    systemSettings = {
      ...systemSettings,
      ...updates,
      general: { ...systemSettings.general, ...updates.general },
      email: { ...systemSettings.email, ...updates.email },
      security: { ...systemSettings.security, ...updates.security },
      learning: { ...systemSettings.learning, ...updates.learning },
    };

    await createAuditLog({
      action: 'UPDATE_SYSTEM_SETTINGS',
      resource: 'SystemSettings',
      resourceId: 'system',
      details: { updates }
    }, req);

    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      data: systemSettings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
