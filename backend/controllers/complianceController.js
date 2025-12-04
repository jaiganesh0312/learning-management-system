const { Enrollment, Course, LearningPath, User, Department, Notification, Role, sequelize } = require('../models');
const { Op } = require('sequelize');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * Get department-wise compliance status
 */
const getDepartmentComplianceStatus = async (req, res) => {
  try {
    const { departmentId, pathId, status } = req.query;

    // Build where clause for compliance paths
    const pathWhere = { type: 'compliance' };
    if (pathId) pathWhere.id = pathId;

    const compliancePaths = await LearningPath.findAll({
      where: pathWhere,
      attributes: ['id', 'name', 'description'],
    });

    const pathIds = compliancePaths.map(p => p.id);

    // Get all departments or specific department
    const deptWhere = {};
    if (departmentId) deptWhere.id = departmentId;

    const departments = await Department.findAll({
      where: deptWhere,
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        include: [{
          model: Enrollment,
          as: 'enrollments',
          where: { learningPathId: { [Op.in]: pathIds } },
          required: false,
          include: [{
            model: LearningPath,
            as: 'learningPath',
            attributes: ['id', 'name', 'duration'],
          }],
        }],
      }],
    });

    const now = new Date();
    const results = departments.map(dept => {
      const allEnrollments = dept.members.flatMap(m => m.enrollments || []);
      const completed = allEnrollments.filter(e => e.status === 'completed').length;
      const overdue = allEnrollments.filter(e => 
        e.status !== 'completed' && e.dueDate && new Date(e.dueDate) < now
      ).length;
      const inProgress = allEnrollments.filter(e => 
        e.status === 'in_progress' || e.status === 'active'
      ).length;

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        totalMembers: dept.members.length,
        totalEnrollments: allEnrollments.length,
        completed,
        inProgress,
        overdue,
        complianceRate: allEnrollments.length > 0 
          ? Math.round((completed / allEnrollments.length) * 100) 
          : 0,
        members: dept.members.map(member => ({
          userId: member.id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          enrollments: member.enrollments.map(e => ({
            learningPathId: e.learningPathId,
            learningPathName: e.learningPath?.name,
            status: e.status,
            progress: e.progress,
            duration: e.duration,
          })),
        })),
      };
    });

    await createAuditLog({
      action: 'VIEW_COMPLIANCE_STATUS',
      resource: 'Compliance',
      details: { departmentId, pathId }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Department compliance status retrieved successfully',
      data: {
        departments: results,
        summary: {
          totalDepartments: results.length,
          totalUsers: results.reduce((sum, d) => sum + d.totalMembers, 0),
          totalEnrollments: results.reduce((sum, d) => sum + d.totalEnrollments, 0),
          totalCompleted: results.reduce((sum, d) => sum + d.completed, 0),
          totalOverdue: results.reduce((sum, d) => sum + d.overdue, 0),
        },
      },
    });
  } catch (error) {
    console.error('Error getting department compliance status:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving compliance status',
      error: error.message,
    });
  }
};

/**
 * Send compliance reminders based on filters
 */
const sendComplianceReminders = async (req, res) => {
  try {
    const { 
      departmentIds, 
      userIds, 
      pathId, 
      reminderType = 'overdue', // 'overdue', 'upcoming', 'all'
      message,
      title 
    } = req.body;

    const sentBy = req.user.id;
    let targetUsers = [];

    // Find compliance path
    const compliancePath = pathId ? await LearningPath.findByPk(pathId) : null;

    // Build enrollment filter
    const enrollmentWhere = {};
    if (pathId) enrollmentWhere.learningPathId = pathId;

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Filter by reminder type
    if (reminderType === 'overdue') {
      enrollmentWhere.status = { [Op.ne]: 'completed' };
      enrollmentWhere.dueDate = { [Op.lt]: now };
    } else if (reminderType === 'upcoming') {
      enrollmentWhere.status = { [Op.ne]: 'completed' };
      enrollmentWhere.dueDate = { 
        [Op.and]: [
          { [Op.gte]: now },
          { [Op.lte]: sevenDaysFromNow }
        ]
      };
    }

    // Get enrollments based on filters
    const enrollments = await Enrollment.findAll({
      where: enrollmentWhere,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'departmentId'],
        where: {
          ...(departmentIds && departmentIds.length > 0 ? { departmentId: { [Op.in]: departmentIds } } : {}),
          ...(userIds && userIds.length > 0 ? { id: { [Op.in]: userIds } } : {}),
        },
      }, {
        model: LearningPath,
        as: 'learningPath',
        attributes: ['name', 'dueDate'],
      }],
    });

    // Extract unique users
    const userMap = new Map();
    enrollments.forEach(enrollment => {
      if (!userMap.has(enrollment.user.id)) {
        userMap.set(enrollment.user.id, {
          id: enrollment.user.id,
          name: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
          email: enrollment.user.email,
          paths: [],
        });
      }
      userMap.get(enrollment.user.id).paths.push(enrollment.learningPath.name);
    });

    targetUsers = Array.from(userMap.values());

    if (targetUsers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users found matching the criteria',
      });
    }

    // Create notifications for each user
    const notifications = await Promise.all(
      targetUsers.map(user =>
        Notification.create({
          userId: user.id,
          sentBy,
          title: title || `Compliance Training Reminder`,
          message: message || `You have ${reminderType} compliance training: ${user.paths.join(', ')}`,
          type: 'compliance_reminder',
          priority: reminderType === 'overdue' ? 'high' : 'medium',
          isRead: false,
        })
      )
    );

    await createAuditLog({
      action: 'SEND_COMPLIANCE_REMINDER',
      resource: 'Notification',
      resourceId: notifications[0]?.id,
      details: { 
        reminderType, 
        userCount: targetUsers.length, 
        departmentIds, 
        pathId 
      }
    }, req);

    res.status(201).json({
      success: true,
      message: `Compliance reminders sent to ${targetUsers.length} user(s)`,
      data: {
        remindersSent: targetUsers.length,
        users: targetUsers.map(u => ({ id: u.id, name: u.name, email: u.email })),
      },
    });
  } catch (error) {
    console.error('Error sending compliance reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reminders',
      error: error.message,
    });
  }
};

/**
 * Bulk assign compliance path to users/departments
 */
const bulkAssignCompliancePath = async (req, res) => {
  try {
    const { pathId, userIds, departmentIds, dueDate } = req.body;

    if (!pathId) {
      return res.status(400).json({
        success: false,
        message: 'Learning path ID is required',
      });
    }

    // Validate learning path
    const learningPath = await LearningPath.findByPk(pathId);
    if (!learningPath || learningPath.type !== 'compliance') {
      return res.status(404).json({
        success: false,
        message: 'Compliance learning path not found',
      });
    }

    let targetUserIds = [];

    // Collect user IDs from direct assignment
    if (userIds && userIds.length > 0) {
      targetUserIds = [...userIds];
    }

    // Collect user IDs from departments
    if (departmentIds && departmentIds.length > 0) {
      const departmentUsers = await User.findAll({
        where: { departmentId: { [Op.in]: departmentIds } },
        attributes: ['id'],
      });
      targetUserIds = [...targetUserIds, ...departmentUsers.map(u => u.id)];
    }

    // Remove duplicates
    targetUserIds = [...new Set(targetUserIds)];

    if (targetUserIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users found for assignment',
      });
    }

    // Check for existing enrollments
    const existingEnrollments = await Enrollment.findAll({
      where: {
        userId: { [Op.in]: targetUserIds },
        learningPathId: pathId,
      },
      attributes: ['userId'],
    });

    const existingUserIds = existingEnrollments.map(e => e.userId);
    const newUserIds = targetUserIds.filter(id => !existingUserIds.includes(id));

    // Create enrollments for new users
    const enrollments = await Promise.all(
      newUserIds.map(userId =>
        Enrollment.create({
          userId,
          learningPathId: pathId,
          status: 'active',
          progress: 0,
          enrolledBy: req.user.id,
          dueDate: dueDate || null,
        })
      )
    );

    await createAuditLog({
      action: 'BULK_ASSIGN_COMPLIANCE_PATH',
      resource: 'Enrollment',
      details: { 
        pathId, 
        pathName: learningPath.name,
        userIds: newUserIds, 
        departmentIds,
        newEnrollments: enrollments.length,
        skippedExisting: existingUserIds.length,
      }
    }, req);

    res.status(201).json({
      success: true,
      message: `Compliance path assigned to ${enrollments.length} user(s)`,
      data: {
        newEnrollments: enrollments.length,
        alreadyEnrolled: existingUserIds.length,
        totalUsers: targetUserIds.length,
      },
    });
  } catch (error) {
    console.error('Error bulk assigning compliance path:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning compliance path',
      error: error.message,
    });
  }
};

/**
 * Get detailed compliance metrics
 */
const getComplianceMetrics = async (req, res) => {
  try {
    const { startDate, endDate, departmentId, pathId } = req.query;

    // Build date range
    const dateWhere = {};
    if (startDate && endDate) {
      dateWhere.createdAt = { 
        [Op.between]: [new Date(startDate), new Date(endDate)] 
      };
    }

    // Get compliance paths
    const pathWhere = { type: 'compliance' };
    if (pathId) pathWhere.id = pathId;

    const compliancePaths = await LearningPath.findAll({
      where: pathWhere,
      attributes: ['id', 'name'],
    });

    const pathIds = compliancePaths.map(p => p.id);

    // Get all enrollments
    const enrollmentWhere = { 
      learningPathId: { [Op.in]: pathIds },
      ...dateWhere,
    };

    const enrollments = await Enrollment.findAll({
      where: enrollmentWhere,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'departmentId'],
        ...(departmentId ? { where: { departmentId } } : {}),
      }],
    });

    const now = new Date();
    const metrics = {
      totalEnrollments: enrollments.length,
      completed: enrollments.filter(e => e.status === 'completed').length,
      inProgress: enrollments.filter(e => e.status === 'in_progress' || e.status === 'active').length,
      overdue: enrollments.filter(e => 
        e.status !== 'completed' && e.dueDate && new Date(e.dueDate) < now
      ).length,
      onTrack: enrollments.filter(e => 
        e.status !== 'completed' && (!e.dueDate || new Date(e.dueDate) >= now)
      ).length,
      averageProgress: enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
        : 0,
      complianceRate: enrollments.length > 0
        ? Math.round((enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100)
        : 0,
    };

    // Trends by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Enrollment.findAll({
      where: {
        learningPathId: { [Op.in]: pathIds },
        createdAt: { [Op.gte]: sixMonthsAgo },
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
      raw: true,
    });

    res.status(200).json({
      success: true,
      message: 'Compliance metrics retrieved successfully',
      data: {
        metrics,
        trends: monthlyData,
        paths: compliancePaths,
      },
    });
  } catch (error) {
    console.error('Error getting compliance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving compliance metrics',
      error: error.message,
    });
  }
};

/**
 * Escalate overdue training to managers
 */
const escalateOverdueTraining = async (req, res) => {
  try {
    const { departmentId, pathId, daysOverdue = 7 } = req.body;

    const now = new Date();
    const cutoffDate = new Date(now.getTime() - daysOverdue * 24 * 60 * 60 * 1000);

    // Build where clause
    const pathWhere = { type: 'compliance' };
    if (pathId) pathWhere.id = pathId;

    const compliancePaths = await LearningPath.findAll({
      where: pathWhere,
      attributes: ['id', 'name'],
    });

    const pathIds = compliancePaths.map(p => p.id);

    // Find overdue enrollments
    const enrollments = await Enrollment.findAll({
      where: {
        learningPathId: { [Op.in]: pathIds },
        status: { [Op.ne]: 'completed' },
        dueDate: { [Op.lt]: cutoffDate },
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'departmentId'],
        ...(departmentId ? { where: { departmentId } } : {}),
        include: [{
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'managerId'],
          include: [{
            model: User,
            as: 'manager',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          }],
        }],
      }, {
        model: LearningPath,
        as: 'learningPath',
        attributes: ['name', 'dueDate'],
      }],
    });

    if (enrollments.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No overdue training found',
        data: { escalationsSent: 0 },
      });
    }

    // Group by manager
    const managerMap = new Map();
    enrollments.forEach(enrollment => {
      const manager = enrollment.user.department?.manager;
      if (manager) {
        if (!managerMap.has(manager.id)) {
          managerMap.set(manager.id, {
            manager,
            overdueUsers: [],
          });
        }
        managerMap.get(manager.id).overdueUsers.push({
          name: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
          email: enrollment.user.email,
          path: enrollment.learningPath.name,
          dueDate: enrollment.dueDate,
          daysOverdue: Math.floor((now - new Date(enrollment.dueDate)) / (1000 * 60 * 60 * 24)),
        });
      }
    });

    // Send escalation notifications to managers
    const notifications = [];
    for (const [managerId, data] of managerMap) {
      const message = `ESCALATION: ${data.overdueUsers.length} team member(s) have overdue compliance training:\n\n${
        data.overdueUsers.map(u => `- ${u.name} (${u.email}): ${u.path} - ${u.daysOverdue} days overdue`).join('\n')
      }`;

      const notification = await Notification.create({
        userId: managerId,
        sentBy: req.user.id,
        title: 'Compliance Training Escalation',
        message,
        type: 'escalation',
        priority: 'urgent',
        isRead: false,
      });

      notifications.push(notification);
    }

    await createAuditLog({
      action: 'ESCALATE_OVERDUE_TRAINING',
      resource: 'Notification',
      details: { 
        escalationsSent: notifications.length,
        overdueEnrollments: enrollments.length,
        daysOverdue,
        departmentId,
        pathId,
      }
    }, req);

    res.status(201).json({
      success: true,
      message: `Escalations sent to ${notifications.length} manager(s)`,
      data: {
        escalationsSent: notifications.length,
        overdueEnrollments: enrollments.length,
      },
    });
  } catch (error) {
    console.error('Error escalating overdue training:', error);
    res.status(500).json({
      success: false,
      message: 'Error escalating overdue training',
      error: error.message,
    });
  }
};

module.exports = {
  getDepartmentComplianceStatus,
  sendComplianceReminders,
  bulkAssignCompliancePath,
  getComplianceMetrics,
  escalateOverdueTraining,
};
