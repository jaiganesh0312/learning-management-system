const { sequelize } = require("../config/database");

// Import all models
const User = require("./user.model");
const Role = require("./role.model");
const UserRole = require("./userRole.model");
const Department = require("./department.model");
const Course = require("./course.model");
const CourseMaterial = require("./courseMaterial.model");
const LearningPath = require("./learningPath.model");
const LearningPathCourse = require("./learningPathCourse.model");
const Enrollment = require("./enrollment.model");
const CourseProgress = require("./courseProgress.model");
const Quiz = require("./quiz.model");
const Question = require("./question.model");
const QuizAttempt = require("./quizAttempt.model");
const Assignment = require("./assignment.model");
const Submission = require("./submission.model");
const Certificate = require("./certificate.model");
const AuditLog = require("./auditLog.model");
const Notification = require("./notification.model");

// Define Associations

// User ↔ Role (many-to-many through UserRole)
User.hasMany(UserRole, { foreignKey: 'userId', as: 'userRoles' });
User.belongsToMany(Role, { 
  through: UserRole, 
  foreignKey: 'userId', 
  as: 'roles' 
});
Role.belongsToMany(User, { 
  through: UserRole, 
  foreignKey: 'roleId', 
  as: 'users' 
});

// UserRole direct associations (needed for include queries)
UserRole.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserRole.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
UserRole.belongsTo(User, { foreignKey: 'assignedBy', as: 'assignedByUser' });

// Department associations
Department.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
Department.belongsTo(Department, { foreignKey: 'parentDepartmentId', as: 'parentDepartment' });
Department.hasMany(Department, { foreignKey: 'parentDepartmentId', as: 'subDepartments' });
User.hasMany(Department, { foreignKey: 'managerId', as: 'managedDepartments' });

User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(User, { foreignKey: 'departmentId', as: 'members' });

// User active role association
User.belongsTo(Role, { foreignKey: 'activeRoleId', as: 'activeRole' });


// Course associations
Course.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Course, { foreignKey: 'createdBy', as: 'createdCourses' });

Course.hasMany(CourseMaterial, { foreignKey: 'courseId', as: 'materials' });
CourseMaterial.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Course.hasMany(Quiz, { foreignKey: 'courseId', as: 'quizzes' });
Quiz.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Course.hasMany(Assignment, { foreignKey: 'courseId', as: 'assignments' });
Assignment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Learning Path associations
LearningPath.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
LearningPath.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
User.hasMany(LearningPath, { foreignKey: 'createdBy', as: 'createdLearningPaths' });
Department.hasMany(LearningPath, { foreignKey: 'departmentId', as: 'learningPaths' });

// Learning Path ↔ Course (many-to-many through LearningPathCourse)
LearningPath.belongsToMany(Course, { 
  through: LearningPathCourse, 
  foreignKey: 'learningPathId', 
  as: 'courses' 
});
Course.belongsToMany(LearningPath, { 
  through: LearningPathCourse, 
  foreignKey: 'courseId', 
  as: 'learningPaths' 
});

// Enrollment associations
Enrollment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Enrollment.belongsTo(LearningPath, { foreignKey: 'learningPathId', as: 'learningPath' });
Enrollment.belongsTo(User, { foreignKey: 'enrolledBy', as: 'enrolledByUser' });

User.hasMany(Enrollment, { foreignKey: 'userId', as: 'enrollments' });
Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
LearningPath.hasMany(Enrollment, { foreignKey: 'learningPathId', as: 'enrollments' });

// Course Progress associations
CourseProgress.belongsTo(Enrollment, { foreignKey: 'enrollmentId', as: 'enrollment' });
CourseProgress.belongsTo(CourseMaterial, { foreignKey: 'courseMaterialId', as: 'material' });
Enrollment.hasMany(CourseProgress, { foreignKey: 'enrollmentId', as: 'courseProgress' });
CourseMaterial.hasMany(CourseProgress, { foreignKey: 'courseMaterialId', as: 'userProgress' });

// Quiz associations
Quiz.hasMany(Question, { foreignKey: 'quizId', as: 'questions' });
Question.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId', as: 'attempts' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });
QuizAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });
QuizAttempt.belongsTo(Enrollment, { foreignKey: 'enrollmentId', as: 'enrollment' });
User.hasMany(QuizAttempt, { foreignKey: 'userId', as: 'quizAttempts' });

// Assignment associations
Assignment.hasMany(Submission, { foreignKey: 'assignmentId', as: 'submissions' });
Submission.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });
Submission.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Submission.belongsTo(User, { foreignKey: 'gradedBy', as: 'grader' });
Submission.belongsTo(Enrollment, { foreignKey: 'enrollmentId', as: 'enrollment' });
User.hasMany(Submission, { foreignKey: 'userId', as: 'submissions' });
User.hasMany(Submission, { foreignKey: 'gradedBy', as: 'gradedSubmissions' });

// Certificate associations
Certificate.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Certificate.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Certificate.belongsTo(LearningPath, { foreignKey: 'learningPathId', as: 'learningPath' });
Certificate.belongsTo(Enrollment, { foreignKey: 'enrollmentId', as: 'enrollment' });
User.hasMany(Certificate, { foreignKey: 'userId', as: 'certificates' });
Course.hasMany(Certificate, { foreignKey: 'courseId', as: 'certificates' });
LearningPath.hasMany(Certificate, { foreignKey: 'learningPathId', as: 'certificates' });

// Audit Log associations
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
AuditLog.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(User, { foreignKey: 'sentBy', as: 'sender' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(Notification, { foreignKey: 'sentBy', as: 'sentNotifications' });

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  Department,
  Course,
  CourseMaterial,
  LearningPath,
  LearningPathCourse,
  Enrollment,
  CourseProgress,
  Quiz,
  Question,
  QuizAttempt,
  Assignment,
  Submission,
  Certificate,
  AuditLog,
  Notification,
};
