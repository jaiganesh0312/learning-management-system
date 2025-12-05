const { Course, CourseMaterial, User, AuditLog, Enrollment } = require('../models');
const { createAuditLog } = require('../utils/auditLogger');
const { Op } = require('sequelize');

/**
 * Create a new course
 */
const createCourse = async (req, res) => {
  try {
    const { title, description, category, level, duration, thumbnail, tags, prerequisites, passingScore } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      level,
      duration,
      thumbnail,
      tags,
      prerequisites,
      passingScore,
      createdBy: req.user.id,
      status: 'draft',
    });

    await createAuditLog({
      action: 'CREATE_COURSE',
      resource: 'Course',
      resourceId: course.id,
      details: { title, category, level }
    }, req);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message,
    });
  }
};

/**
 * Get all courses with filtering and pagination
 */
const getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, level, status, myCourses } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category) whereClause.category = category;
    if (level) whereClause.level = level;
    
    // Filter by status (unless admin/creator viewing their own)
    if (status) {
      whereClause.status = status;
    } else if (!req.user.permissions.includes('manage_system_settings')) {
      // Default for learners: only published courses
      whereClause.status = 'published';
    }

    // Filter for "My Courses" (created by me)
    if (myCourses === 'true') {
      whereClause.createdBy = req.user.id;
      // Allow seeing drafts if it's my course
      delete whereClause.status; 
    }

    const { count, rows } = await Course.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email',],
        },
        {
          model: Enrollment,
          as: 'enrollments',
          attributes: ['id']
        }
      ],


      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        courses: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message,
    });
  }
};

const getMyCourses = async (req, res) => {
  try {

    const courses = await Course.findAll({
      where: {
        createdBy: req.user.id,
      },
      include: [
        {
          model: Enrollment,
          as: 'enrollments',
          attributes: ['id']
        }
      ],
    });

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message,
    });
  }
};

/**
 * Get a single course by ID
 */
const getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { Enrollment, CourseProgress, QuizAttempt } = require('../models');

    const course = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: CourseMaterial,
          as: 'materials',
          order: [['order', 'ASC']],
        },
        {
          model: require('../models').Quiz,
          as: 'quizzes',
          include: [
            {
              model: require('../models').Question,
              as: 'questions',
              attributes: ['id'],
            },
          ],
        },
        {
          model: require('../models').Assignment,
          as: 'assignments',
        },
        {
          model: Enrollment,
          as: 'enrollments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
            {
              model: CourseProgress,
              as: 'courseProgress',
              attributes: ['status', 'timeSpent', 'completionPercentage', 'lastAccessedAt'],
            },
          ],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }
   
    // Add question count to quizzes
    const courseData = course.toJSON();
    if (courseData.quizzes) {
      courseData.quizzes = courseData.quizzes.map(quiz => ({
        ...quiz,
        questionCount: quiz.questions?.length || 0,
        questions: undefined, // Remove questions array from response
      }));
    }

    res.status(200).json({
      success: true,
      data: {
        ...courseData,
      },
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message,
    });
  }
};

/**
 * Update a course
 */
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check ownership or admin permission
    if (course.createdBy !== req.user.id && !req.user.permissions.includes('manage_system_settings')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    await course.update(updateData);

    await createAuditLog({
      action: 'UPDATE_COURSE',
      resource: 'Course',
      resourceId: course.id,
      details: { updateData }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message,
    });
  }
};

/**
 * Delete a course
 */
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check ownership or admin permission
    if (course.createdBy !== req.user.id && !req.user.permissions.includes('delete_course')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course',
      });
    }

    await course.destroy();

    await createAuditLog({
      action: 'DELETE_COURSE',
      resource: 'Course',
      resourceId: id,
      details: { title: course.title }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message,
    });
  }
};

/**
 * Upload course material
 */
const uploadCourseMaterial = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, type, duration, isRequired, order } = req.body;
    
    // Assuming file upload middleware puts file info in req.file
    const fileUrl = req.file ? `/uploads/course-materials/${req.file.filename}` : req.body.fileUrl;
    const fileSize = req.file ? req.file.size : null;
    const mimeType = req.file ? req.file.mimetype : null;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.createdBy !== req.user.id && !req.user.permissions.includes('manage_system_settings')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const material = await CourseMaterial.create({
      courseId,
      title,
      description,
      type,
      fileUrl,
      fileSize,
      mimeType,
      duration,
      isRequired,
      order: order || 0,
    });

    await createAuditLog({
      action: 'UPLOAD_MATERIAL',
      resource: 'CourseMaterial',
      resourceId: material.id,
      details: { courseId, title, type }
    }, req);

    res.status(201).json({
      success: true,
      message: 'Material added successfully',
      data: material,
    });
  } catch (error) {
    console.error('Error adding material:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding material',
      error: error.message,
    });
  }
};

/**
 * Publish/Unpublish course
 */
const togglePublishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'published' or 'draft'

    if (!['published', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.createdBy !== req.user.id && !req.user.permissions.includes('publish_course')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await course.update({ 
      status,
      isPublished: status === 'published'
    });

    await createAuditLog({
      action: 'CHANGE_COURSE_STATUS',
      resource: 'Course',
      resourceId: course.id,
      details: { status }
    }, req);

    res.status(200).json({
      success: true,
      message: `Course ${status} successfully`,
      data: course,
    });
  } catch (error) {
    console.error('Error updating course status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course status',
      error: error.message,
    });
  }
};

/**
 * Delete course material
 */
const deleteCourseMaterial = async (req, res) => {
  try {
    const { courseId, materialId } = req.params;

    const material = await CourseMaterial.findOne({
      where: { id: materialId, courseId }
    });

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const course = await Course.findByPk(courseId);
    if (course.createdBy !== req.user.id && !req.user.permissions.includes('manage_system_settings')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await material.destroy();

    // Reorder remaining materials to ensure sequential order
    const remainingMaterials = await CourseMaterial.findAll({
      where: { courseId },
      order: [['order', 'ASC']],
    });

    // Update order for each remaining material
    await Promise.all(
      remainingMaterials.map((mat, index) =>
        mat.update({ order: index })
      )
    );

    await createAuditLog({
      action: 'DELETE_MATERIAL',
      resource: 'CourseMaterial',
      resourceId: materialId,
      details: { courseId, title: material.title }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting material',
      error: error.message,
    });
  }
};

/**
 * Update material order
 */
const updateMaterialOrder = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { materials } = req.body; // Array of { id, order }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.createdBy !== req.user.id && !req.user.permissions.includes('manage_system_settings')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update order for each material
    await Promise.all(
      materials.map(({ id, order }) =>
        CourseMaterial.update({ order }, { where: { id, courseId } })
      )
    );

    await createAuditLog({
      action: 'REORDER_MATERIALS',
      resource: 'CourseMaterial',
      resourceId: courseId,
      details: { materialCount: materials.length }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Materials reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering materials:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering materials',
      error: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getMyCourses,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  uploadCourseMaterial,
  deleteCourseMaterial,
  togglePublishStatus,
  updateMaterialOrder,
};
