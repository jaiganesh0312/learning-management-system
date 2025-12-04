const { LearningPath, Course, LearningPathCourse, User, Department } = require('../models');
const { createAuditLog } = require('../utils/auditLogger');
const { Op } = require('sequelize');

/**
 * Create a new learning path
 */
const createLearningPath = async (req, res) => {
  try {
    const { name, description, type, category, thumbnail, departmentId, tags, duration } = req.body;

    const learningPath = await LearningPath.create({
      name,
      description,
      type,
      category,
      thumbnail,
      departmentId,
      tags,
      duration,
      createdBy: req.user.id,
      isActive: true,
      isPublished: false,
    });

    await createAuditLog({
      action: 'CREATE_LEARNING_PATH',
      resource: 'LearningPath',
      resourceId: learningPath.id,
      details: { name, type, departmentId }
    }, req);

    res.status(201).json({
      success: true,
      message: 'Learning path created successfully',
      data: learningPath,
    });
  } catch (error) {
    console.error('Error creating learning path:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating learning path',
      error: error.message,
    });
  }
};

/**
 * Get all learning paths with filtering
 */
const getAllLearningPaths = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, departmentId, isPublished } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (type) whereClause.type = type;
    if (departmentId) whereClause.departmentId = departmentId;
    
    if (isPublished) {
      whereClause.isPublished = isPublished === 'true';
    } else if (!req.user.permissions.includes('manage_system_settings')) {
      whereClause.isPublished = true;
    }

    const { count, rows } = await LearningPath.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        learningPaths: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching learning paths',
      error: error.message,
    });
  }
};

/**
 * Get a single learning path with courses
 */
const getLearningPath = async (req, res) => {
  try {
    const { id } = req.params;

    const learningPath = await LearningPath.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
        {
          model: Course,
          as: 'courses',
          through: {
            attributes: ['order', 'isRequired', 'dueDate', 'frequency'],
          },
        },
      ],
      order: [[{ model: Course, as: 'courses' }, LearningPathCourse, 'order', 'ASC']],
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found',
      });
    }

    res.status(200).json({
      success: true,
      data: learningPath,
    });
  } catch (error) {
    console.error('Error fetching learning path:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching learning path',
      error: error.message,
    });
  }
};

/**
 * Add course to learning path
 */
const addCourseToPath = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, order, isRequired, dueDate, frequency } = req.body;

    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      return res.status(404).json({ success: false, message: 'Learning path not found' });
    }

    // Check permissions (creator or admin)
    if (learningPath.createdBy !== req.user.id && !req.user.permissions.includes('edit_learning_path')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Add or update course in path
    const [pathCourse, created] = await LearningPathCourse.findOrCreate({
      where: { learningPathId: id, courseId },
      defaults: {
        order: order || 0,
        isRequired: isRequired !== undefined ? isRequired : true,
        dueDate,
        frequency,
      },
    });

    if (!created) {
      await pathCourse.update({
        order: order || pathCourse.order,
        isRequired: isRequired !== undefined ? isRequired : pathCourse.isRequired,
        dueDate,
        frequency,
      });
    }

    await createAuditLog({
      action: 'ADD_COURSE_TO_PATH',
      resource: 'LearningPathCourse',
      resourceId: pathCourse.id,
      details: { learningPathId: id, courseId, order }
    }, req);

    res.status(200).json({
      success: true,
      message: created ? 'Course added to path' : 'Path course updated',
      data: pathCourse,
    });
  } catch (error) {
    console.error('Error adding course to path:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding course to path',
      error: error.message,
    });
  }
};

/**
 * Remove course from learning path
 */
const removeCourseFromPath = async (req, res) => {
  try {
    const { id, courseId } = req.params;

    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      return res.status(404).json({ success: false, message: 'Learning path not found' });
    }

    if (learningPath.createdBy !== req.user.id && !req.user.permissions.includes('edit_learning_path')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const deleted = await LearningPathCourse.destroy({
      where: { learningPathId: id, courseId },
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Course not found in this path' });
    }

    await createAuditLog({
      action: 'REMOVE_COURSE_FROM_PATH',
      resource: 'LearningPathCourse',
      resourceId: null,
      details: { learningPathId: id, courseId }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Course removed from path',
    });
  } catch (error) {
    console.error('Error removing course from path:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing course from path',
      error: error.message,
    });
  }
};

/**
 * Update learning path details
 */
const updateLearningPath = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      return res.status(404).json({ success: false, message: 'Learning path not found' });
    }

    if (learningPath.createdBy !== req.user.id && !req.user.permissions.includes('edit_learning_path')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await learningPath.update(updateData);

    await createAuditLog({
      action: 'UPDATE_LEARNING_PATH',
      resource: 'LearningPath',
      resourceId: learningPath.id,
      details: { updateData }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Learning path updated',
      data: learningPath,
    });
  } catch (error) {
    console.error('Error updating learning path:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating learning path',
      error: error.message,
    });
  }
};

/**
 * Delete learning path
 */
const deleteLearningPath = async (req, res) => {
  try {
    const { id } = req.params;

    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      return res.status(404).json({ success: false, message: 'Learning path not found' });
    }

    if (learningPath.createdBy !== req.user.id && !req.user.permissions.includes('delete_learning_path')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await learningPath.destroy();

    await createAuditLog({
      action: 'DELETE_LEARNING_PATH',
      resource: 'LearningPath',
      resourceId: id,
      details: { name: learningPath.name }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Learning path deleted',
    });
  } catch (error) {
    console.error('Error deleting learning path:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting learning path',
      error: error.message,
    });
  }
};

module.exports = {
  createLearningPath,
  getAllLearningPaths,
  getLearningPath,
  addCourseToPath,
  removeCourseFromPath,
  updateLearningPath,
  deleteLearningPath,
};
