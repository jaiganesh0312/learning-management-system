const { Enrollment, Course, LearningPath, User, Department, AuditLog, QuizAttempt, Role, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const stats = {};

    // Basic counts
    stats.totalCourses = await Course.count({ where: { status: 'published' } });
    stats.totalLearners = await User.count(); // TODO: Filter by role 'learner' if needed

    // User specific stats
    if (req.user) {
      stats.myEnrollments = await Enrollment.count({ where: { userId: req.user.id } });
      stats.completedCourses = await Enrollment.count({ 
        where: { userId: req.user.id, status: 'completed' } 
      });
      
      // Calculate average score
      const attempts = await QuizAttempt.findAll({
        where: { userId: req.user.id },
        attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avgScore']]
      });
      stats.averageScore = attempts[0]?.dataValues?.avgScore || 0;
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message,
    });
  }
};

/**
 * Get compliance report (for compliance officers)
 */
const getComplianceReport = async (req, res) => {
  try {
    const { departmentId, startDate, endDate } = req.query;
    
    const whereClause = {
      type: 'compliance',
    };

    // Find compliance learning paths
    const compliancePaths = await LearningPath.findAll({
      where: whereClause,
      attributes: ['id', 'name'],
    });

    const pathIds = compliancePaths.map(p => p.id);

    // Find enrollments in these paths
    const enrollmentWhere = {
      learningPathId: { [Op.in]: pathIds },
    };

    if (startDate && endDate) {
      enrollmentWhere.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const enrollments = await Enrollment.findAll({
      where: enrollmentWhere,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          include: departmentId ? [{
            model: Department,
            as: 'managedDepartments', // This might need adjustment based on user-dept relationship
            where: { id: departmentId }
          }] : []
        },
        {
          model: LearningPath,
          as: 'learningPath',
          attributes: ['name', 'duration']
        }
      ]
    });

    // Calculate compliance rates
    const totalEnrollments = enrollments.length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const overdue = enrollments.filter(e => {
      return e.status !== 'completed' && new Date(e.dueDate) < new Date();
    }).length;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEnrollments,
          completed,
          overdue,
          complianceRate: totalEnrollments ? (completed / totalEnrollments) * 100 : 0
        },
        enrollments
      }
    });

  } catch (error) {
    console.error('Error fetching compliance report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching compliance report',
      error: error.message,
    });
  }
};

/**
 * Get audit logs (for auditors/admins)
 */
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, resource, userId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (action) whereClause.action = action;
    if (resource) whereClause.resource = resource;
    if (userId) whereClause.userId = userId;
    if (startDate && endDate) {
      whereClause.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message,
    });
  }
};

/**
 * Super Admin Dashboard - Comprehensive system overview
 */
const getSuperAdminDashboard = async (req, res) => {
  try {
    const data = {};

    // Statistics
    const [totalUsers, totalCourses, totalEnrollments, activeRoles] = await Promise.all([
      User.count(),
      Course.count(),
      Enrollment.count(),
      sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('roleId')))
    ]);


    data.statistics = {
      totalUsers,
      totalCourses,
      totalEnrollments,
      activeRoles: await Role.count({ where: { isActive: true } }) || 0,
      publishedCourses: await Course.count({ where: { status: 'published' } }),
      draftCourses: await Course.count({ where: { status: 'draft' } }),
    };

    // Recent user registrations (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    data.recentUsers = await User.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    // Recent activities
    data.recentActivity = await AuditLog.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }]
    });

    // Recent course publications
    data.recentCourses = await Course.findAll({
      where: { status: 'published' },
      limit: 5,
      order: [['updatedAt', 'DESC']],
      attributes: ['id', 'title', 'status', 'updatedAt']
    });

    // Recent enrollments
    data.recentEnrollments = await Enrollment.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'title'] }
      ]
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching super admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message,
    });
  }
};

/**
 * Content Creator Dashboard - Course management overview
 */
const getContentCreatorDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = {};

    // Get all courses created by this user
    const myCourses = await Course.findAll({
      where: { createdBy: userId },
      include: [{
        model: Enrollment,
        as: 'enrollments',
        attributes: ['id', 'status']
      }]
    });

    // Statistics
    data.statistics = {
      totalCourses: myCourses.length,
      publishedCourses: myCourses.filter(c => c.status === 'published').length,
      draftCourses: myCourses.filter(c => c.status === 'draft').length,
      totalStudents: myCourses.reduce((sum, course) => sum + (course.enrollments?.length || 0), 0),
    };

    // Course list with details
    data.courses = myCourses.map(course => ({
      id: course.id,
      title: course.title,
      status: course.status,
      enrollmentCount: course.enrollments?.length || 0,
      completedCount: course.enrollments?.filter(e => e.status === 'completed').length || 0,
      updatedAt: course.updatedAt,
    }));

    // Recent activity - quiz submissions on my courses
    const courseIds = myCourses.map(c => c.id);
    data.recentQuizAttempts = await QuizAttempt.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        {
          model: sequelize.models.Quiz,
          as: 'quiz',
          where: { courseId: { [Op.in]: courseIds } },
          attributes: ['id', 'title', 'courseId']
        }
      ]
    }).catch(() => []); // Handle if no quizzes exist

    // Recent completions
    data.recentCompletions = await Enrollment.findAll({
      where: {
        courseId: { [Op.in]: courseIds },
        status: 'completed'
      },
      limit: 10,
      order: [['updatedAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'title'] }
      ]
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching content creator dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message,
    });
  }
};

/**
 * Compliance Officer Dashboard - Compliance tracking overview
 */
const getComplianceOfficerDashboard = async (req, res) => {
  try {
    const data = {};

    // Find compliance learning paths  
    const compliancePaths = await LearningPath.findAll({
      where: { type: 'compliance' },
      attributes: ['id', 'name']
    });

    const pathIds = compliancePaths.map(p => p.id);

    // Get all enrollments in compliance paths
    const enrollments = await Enrollment.findAll({
      where: { learningPathId: { [Op.in]: pathIds } },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: LearningPath, as: 'learningPath', attributes: ['name'] }
      ]
    });

    const totalUsers = await User.count();
    const compliantUsers = enrollments.filter(e => e.status === 'completed').length;
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Statistics
    data.statistics = {
      totalUsers,
      compliantUsers,
      overdueTraining: enrollments.filter(e => 
        e.status !== 'completed' && e.dueDate && new Date(e.dueDate) < now
      ).length,
      upcomingDeadlines: enrollments.filter(e => 
        e.status !== 'completed' && e.dueDate && 
        new Date(e.dueDate) >= now && new Date(e.dueDate) <= sevenDaysFromNow
      ).length,
      complianceRate: totalUsers > 0 ? Math.round((compliantUsers / totalUsers) * 100) : 0,
    };

    // Overdue training details
    data.overdueTraining = enrollments
      .filter(e => e.status !== 'completed' && e.dueDate && new Date(e.dueDate) < now)
      .map(e => ({
        userId: e.user.id,
        userName: e.user.firstName + ' ' + e.user.lastName,
        email: e.user.email,
        trainingName: e.learningPath.name,
        dueDate: e.dueDate,
        daysOverdue: Math.floor((now - new Date(e.dueDate)) / (1000 * 60 * 60 * 24)),
      }))
      .slice(0, 20);

    // Upcoming deadlines
    data.upcomingDeadlines = enrollments
      .filter(e => 
        e.status !== 'completed' && e.dueDate && 
        new Date(e.dueDate) >= now && new Date(e.dueDate) <= sevenDaysFromNow
      )
      .map(e => ({
        userId: e.user.id,
        userName: e.user.firstName + ' ' + e.user.lastName,
        email: e.user.email,
        trainingName: e.learningPath.name,
        dueDate: e.dueDate,
      }))
      .slice(0, 20);

    // Compliance paths overview
    data.compliancePaths = compliancePaths.map(path => {
      const pathEnrollments = enrollments.filter(e => e.learningPathId === path.id);
      const completed = pathEnrollments.filter(e => e.status === 'completed').length;
      return {
        id: path.id,
        name: path.name,
        totalEnrolled: pathEnrollments.length,
        completed,
        completionRate: pathEnrollments.length > 0 ? Math.round((completed / pathEnrollments.length) * 100) : 0,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching compliance officer dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message,
    });
  }
};

/**
 * Department Manager Dashboard - Team management overview
 */
const getDepartmentManagerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = {};

    // Find departments managed by this user
    const departments = await Department.findAll({
      where: { managerId: userId },
      attributes: ['id', 'name', 'description']
    });

    if (departments.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          department: null,
          statistics: { 
            teamSize: 0, 
            averageCompletion: 0, 
            activeEnrollments: 0, 
            completionRate: 0,
            certificatesEarned: 0 
          },
          teamMembers: [],
          learningPaths: [],
        },
      });
    }

    const departmentIds = departments.map(d => d.id);
    
    // Return primary department info (first one if multiple)
    data.department = {
      id: departments[0].id,
      name: departments[0].name,
      description: departments[0].description
    };

    // Get team members (users in these departments)
    const teamMembers = await User.findAll({
      where: { departmentId: { [Op.in]: departmentIds } },
      attributes: ['id', 'firstName', 'lastName', 'email', 'updatedAt'],
      include: [{
        model: Enrollment,
        as: 'enrollments',
        attributes: ['id', 'status', 'progress', 'courseId'],
        include: [{
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }]
      }]
    });

    // Get certificates for team members
    const { Certificate } = require('../models');
    const teamMemberIds = teamMembers.map(m => m.id);
    const certificatesCount = await Certificate.count({
      where: { userId: { [Op.in]: teamMemberIds } }
    });

    // Statistics
    const totalEnrollments = teamMembers.reduce((sum, member) => sum + (member.enrollments?.length || 0), 0);
    const completedEnrollments = teamMembers.reduce((sum, member) => 
      sum + (member.enrollments?.filter(e => e.status === 'completed').length || 0), 0
    );
    const activeEnrollments = teamMembers.reduce((sum, member) => 
      sum + (member.enrollments?.filter(e => e.status === 'active' || e.status === 'in_progress').length || 0), 0
    );

    data.statistics = {
      teamSize: teamMembers.length,
      averageCompletion: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      activeEnrollments: activeEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      certificatesEarned: certificatesCount,
    };

    // Team members with progress
    data.teamMembers = teamMembers.map(member => {
      const enrollments = member.enrollments || [];
      const avgProgress = enrollments.length > 0 
        ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length 
        : 0;
      
      return {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
        activeCourses: enrollments.filter(e => e.status === 'active' || e.status === 'in_progress').length,
        completedCourses: enrollments.filter(e => e.status === 'completed').length,
        averageProgress: Math.round(avgProgress),
        lastActivity: member.updatedAt,
        enrollments: enrollments.map(e => ({
          id: e.id,
          courseId: e.courseId,
          courseTitle: e.course?.title || 'Unknown Course',
          status: e.status,
          progress: e.progress
        }))
      };
    });

    // Learning paths for the department
    data.learningPaths = await LearningPath.findAll({
      where: { departmentId: { [Op.in]: departmentIds } },
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'description', 'type']
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching department manager dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message,
    });
  }
};

/**
 * Auditor Dashboard - Audit and compliance overview
 */
const getAuditorDashboard = async (req, res) => {
  try {
    const data = {};

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Statistics
    data.statistics = {
      totalAuditLogs: await AuditLog.count(),
      recentActivity: await AuditLog.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
      systemChanges: await AuditLog.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      activeReports: 5, // Placeholder - would be actual reports count
    };

    // Recent audit logs
    data.recentAuditLogs = await AuditLog.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
      attributes: ['id', 'action', 'resource', 'details', 'createdAt']
    });

    // Compliance summary
    const compliancePaths = await LearningPath.findAll({
      where: { type: 'compliance' },
      attributes: ['id']
    });

    const pathIds = compliancePaths.map(p => p.id);
    const complianceEnrollments = await Enrollment.count({
      where: { learningPathId: { [Op.in]: pathIds } }
    });
    const completedCompliance = await Enrollment.count({
      where: { 
        learningPathId: { [Op.in]: pathIds },
        status: 'completed'
      }
    });

    data.complianceSummary = {
      totalComplianceEnrollments: complianceEnrollments,
      completedCompliance,
      complianceRate: complianceEnrollments > 0 
        ? Math.round((completedCompliance / complianceEnrollments) * 100) 
        : 0,
    };

    // Available reports
    data.availableReports = [
      { id: 1, name: 'Compliance Report', type: 'compliance', description: 'Overall compliance status' },
      { id: 2, name: 'System Activity Report', type: 'system', description: 'System-wide activity logs' },
      { id: 3, name: 'User Activity Report', type: 'user', description: 'User engagement metrics' },
      { id: 4, name: 'Course Analytics', type: 'analytics', description: 'Course performance data' },
      { id: 5, name: 'Audit Trail', type: 'audit', description: 'Complete audit trail export' },
    ];

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching auditor dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getComplianceReport,
  getAuditLogs,
  getSuperAdminDashboard,
  getContentCreatorDashboard,
  getComplianceOfficerDashboard,
  getDepartmentManagerDashboard,
  getAuditorDashboard,
};
