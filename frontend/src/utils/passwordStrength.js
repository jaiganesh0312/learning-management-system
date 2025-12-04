/**
 * Calculate password strength and return detailed analysis
 * @param {string} password - The password to analyze
 * @returns {Object} Strength analysis object
 */
export const calculatePasswordStrength = (password) => {
  if (!password) {
    return {
      score: 0,
      strength: 'empty',
      label: 'Enter a password',
      color: 'default',
      percentage: 0,
      feedback: [],
    };
  }

  let score = 0;
  const feedback = [];
  const checks = {
    length: false,
    lowercase: false,
    uppercase: false,
    numbers: false,
    special: false,
  };

  // Length check (0-40 points)
  if (password.length >= 8) {
    score += 20;
    checks.length = true;
  }
  if (password.length >= 12) {
    score += 10;
  }
  if (password.length >= 16) {
    score += 10;
  }
  if (password.length < 8) {
    feedback.push('Use at least 8 characters');
  }

  // Lowercase letters (10 points)
  if (/[a-z]/.test(password)) {
    score += 10;
    checks.lowercase = true;
  } else {
    feedback.push('Add lowercase letters');
  }

  // Uppercase letters (10 points)
  if (/[A-Z]/.test(password)) {
    score += 10;
    checks.uppercase = true;
  } else {
    feedback.push('Add uppercase letters');
  }

  // Numbers (15 points)
  if (/\d/.test(password)) {
    score += 15;
    checks.numbers = true;
  } else {
    feedback.push('Add numbers');
  }

  // Special characters (15 points)
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 15;
    checks.special = true;
  } else {
    feedback.push('Add special characters (!@#$%^&*)');
  }

  // Bonus for variety (10 points)
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) {
    score += 10;
  }

  // Determine strength level
  let strength, label, color;
  if (score < 30) {
    strength = 'weak';
    label = 'Weak';
    color = 'danger';
  } else if (score < 50) {
    strength = 'fair';
    label = 'Fair';
    color = 'warning';
  } else if (score < 70) {
    strength = 'good';
    label = 'Good';
    color = 'primary';
  } else if (score < 90) {
    strength = 'strong';
    label = 'Strong';
    color = 'success';
  } else {
    strength = 'very-strong';
    label = 'Very Strong';
    color = 'success';
  }

  return {
    score,
    strength,
    label,
    color,
    percentage: Math.min(score, 100),
    checks,
    feedback: feedback.length > 0 ? feedback : ['Great password!'],
  };
};

/**
 * Get password strength requirements
 * @returns {Array} Array of requirement objects
 */
export const getPasswordRequirements = () => {
  return [
    { key: 'length', label: 'At least 8 characters', icon: 'mdi:check-circle' },
    { key: 'lowercase', label: 'Contains lowercase letter', icon: 'mdi:check-circle' },
    { key: 'uppercase', label: 'Contains uppercase letter', icon: 'mdi:check-circle' },
    { key: 'numbers', label: 'Contains number', icon: 'mdi:check-circle' },
    { key: 'special', label: 'Contains special character', icon: 'mdi:check-circle' },
  ];
};
