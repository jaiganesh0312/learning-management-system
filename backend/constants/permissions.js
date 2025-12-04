/**
 * Permission constants for RBAC system
 * Each permission represents a specific action that can be performed
 */

const PERMISSIONS = {
  // System & User Management
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  IMPERSONATE_USER: 'impersonate_user',
  
  // Content Management
  CREATE_COURSE: 'create_course',
  EDIT_COURSE: 'edit_course',
  DELETE_COURSE: 'delete_course',
  PUBLISH_COURSE: 'publish_course',
  UPLOAD_COURSE_MATERIAL: 'upload_course_material',
  
  // Learning Path Management
  CREATE_LEARNING_PATH: 'create_learning_path',
  EDIT_LEARNING_PATH: 'edit_learning_path',
  DELETE_LEARNING_PATH: 'delete_learning_path',
  
  // Assessment Management
  CREATE_QUIZ: 'create_quiz',
  EDIT_QUIZ: 'edit_quiz',
  DELETE_QUIZ: 'delete_quiz',
  GRADE_QUIZ: 'grade_quiz',
  CREATE_ASSIGNMENT: 'create_assignment',
  EDIT_ASSIGNMENT: 'edit_assignment',
  DELETE_ASSIGNMENT: 'delete_assignment',
  GRADE_ASSIGNMENT: 'grade_assignment',
  
  // Enrollment & Assignment
  ENROLL_USER: 'enroll_user',
  ENROLL_TEAM: 'enroll_team',
  UNENROLL_USER: 'unenroll_user',
  
  // Progress & Reporting
  VIEW_OWN_PROGRESS: 'view_own_progress',
  VIEW_TEAM_PROGRESS: 'view_team_progress',
  VIEW_ALL_PROGRESS: 'view_all_progress',
  VIEW_DEPARTMENT_REPORTS: 'view_department_reports',
  VIEW_ALL_REPORTS: 'view_all_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Compliance
  MANAGE_COMPLIANCE: 'manage_compliance',
  VIEW_COMPLIANCE_REPORTS: 'view_compliance_reports',
  SEND_REMINDERS: 'send_reminders',
  SEND_BULK_REMINDERS: 'send_bulk_reminders',
  
  // Audit
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  EXPORT_AUDIT_LOGS: 'export_audit_logs',
  
  // Certificates
  GENERATE_CERTIFICATE: 'generate_certificate',
  VIEW_OWN_CERTIFICATES: 'view_own_certificates',
  VIEW_ALL_CERTIFICATES: 'view_all_certificates',
  
  // Course Access
  ACCESS_ASSIGNED_COURSES: 'access_assigned_courses',
  BROWSE_COURSES: 'browse_courses',
  
  // Discussions & Collaboration
  FACILITATE_DISCUSSIONS: 'facilitate_discussions',
  PARTICIPATE_DISCUSSIONS: 'participate_discussions',
};

module.exports = PERMISSIONS;
