const { Enrollment, Course, LearningPath, CourseProgress, CourseMaterial, User, Department, Certificate } = require('../models');
const { createAuditLog } = require('../utils/auditLogger');
const { Op } = require('sequelize');

/**
 * Enroll user in a course or learning path
 */
const enrollUser = async (req, res) => {
  try {
    let { userId, courseId, learningPathId, dueDate } = req.body;

    // Validate request
    if (!courseId && !learningPathId) {
      return res.status(400).json({ success: false, message: 'Must provide courseId or learningPathId' });
    }

    // Support self-enrollment: use current user if userId not provided
    if (!userId) {
      userId = req.user.id;
    }

    // Check permissions
    // Users can enroll themselves, or managers/admins can enroll others
    if (userId !== req.user.id && !req.user.permissions.includes('enroll_user')) {
      return res.status(403).json({ success: false, message: 'Not authorized to enroll this user' });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check existing enrollment
    const whereClause = { userId };
    if (courseId) whereClause.courseId = courseId;
    if (learningPathId) whereClause.learningPathId = learningPathId;

    const existingEnrollment = await Enrollment.findOne({ where: whereClause });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'User already enrolled' });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      learningPathId,
      enrolledBy: req.user.id,
      dueDate,
      status: 'not_started',
      progress: 0,
    });

    await createAuditLog({
      action: 'ENROLL_USER',
      resource: 'Enrollment',
      resourceId: enrollment.id,
      details: { userId, courseId, learningPathId }
    }, req);

    res.status(201).json({
      success: true,
      message: 'Enrollment successful',
      data: enrollment,
    });
  } catch (error) {
    console.error('Error enrolling user:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling user',
      error: error.message,
    });
  }
};

/**
 * Get enrollments for current user
 */
const getMyEnrollments = async (req, res) => {
  try {
    const { status, type } = req.query;
    const whereClause = { userId: req.user.id };

    if (status) whereClause.status = status;
    
    // Filter by type (course or learning path)
    if (type === 'course') whereClause.courseId = { [Op.not]: null };
    if (type === 'learning_path') whereClause.learningPathId = { [Op.not]: null };

    const enrollments = await Enrollment.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'thumbnail', 'duration', 'level'],
        },
        {
          model: LearningPath,
          as: 'learningPath',
          attributes: ['id', 'name', 'thumbnail', 'duration', 'type'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollments',
      error: error.message,
    });
  }
};

/**
 * Update progress for a specific material
 */
const updateProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { 
      courseMaterialId, 
      status, 
      timeSpent, 
      lastPlaybackPosition, 
      playbackSpeed,
      completionPercentage 
    } = req.body;

    const enrollment = await Enrollment.findByPk(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (enrollment.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update or create progress record
    const [progressRecord, created] = await CourseProgress.findOrCreate({
      where: { enrollmentId, courseMaterialId },
      defaults: {
        status: status || 'in_progress',
        timeSpent: timeSpent || 0,
        completionPercentage: completionPercentage || 0,
        lastAccessedAt: new Date(),
        completedAt: status === 'completed' ? new Date() : null,
        notes: JSON.stringify({
          lastPlaybackPosition: lastPlaybackPosition || 0,
          playbackSpeed: playbackSpeed || 1.0,
        }),
      },
    });

    if (!created) {
      // Parse existing notes
      let existingNotes = {};
      try {
        existingNotes = progressRecord.notes ? JSON.parse(progressRecord.notes) : {};
      } catch (e) {
        existingNotes = {};
      }

      // Update notes with video metadata
      const updatedNotes = {
        ...existingNotes,
        lastPlaybackPosition: lastPlaybackPosition !== undefined ? lastPlaybackPosition : existingNotes.lastPlaybackPosition,
        playbackSpeed: playbackSpeed !== undefined ? playbackSpeed : existingNotes.playbackSpeed,
      };

      await progressRecord.update({
        status: status || progressRecord.status,
        timeSpent: timeSpent !== undefined ? (progressRecord.timeSpent || 0) + timeSpent : progressRecord.timeSpent,
        completionPercentage: completionPercentage !== undefined ? completionPercentage : progressRecord.completionPercentage,
        lastAccessedAt: new Date(),
        completedAt: status === 'completed' ? new Date() : progressRecord.completedAt,
        notes: JSON.stringify(updatedNotes),
      });
    }

    // Recalculate overall enrollment progress
    await calculateEnrollmentProgress(enrollmentId);

    await createAuditLog({
      action: 'UPDATE_PROGRESS',
      resource: 'CourseProgress',
      resourceId: progressRecord.id,
      details: { enrollmentId, courseMaterialId, status, timeSpent }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Progress updated',
      data: progressRecord,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message,
    });
  }
};

/**
 * Helper to calculate overall progress
 */
const calculateEnrollmentProgress = async (enrollmentId) => {
  try {
    const enrollment = await Enrollment.findByPk(enrollmentId, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!enrollment || !enrollment.courseId) return; // Only for course enrollments for now

    // Get total materials count
    const totalMaterials = await CourseMaterial.count({
      where: { courseId: enrollment.courseId, isRequired: true }
    });

    if (totalMaterials === 0) return;

    // Get completed materials count
    const completedMaterials = await CourseProgress.count({
      where: { 
        enrollmentId, 
        status: 'completed',
        '$material.isRequired$': true 
      },
      include: [{
        model: CourseMaterial,
        as: 'material',
        required: true
      }]
    });

    const progressPercentage = (completedMaterials / totalMaterials) * 100;
    const newStatus = progressPercentage === 100 ? 'completed' : 'in_progress';

    await enrollment.update({
      progress: progressPercentage,
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date() : null,
    });

    // Generate certificate if completed
    if (newStatus === 'completed') {
      await generateCertificate(enrollment);
    }

  } catch (error) {
    console.error('Error calculating progress:', error);
  }
};

/**
 * Helper to generate certificate
 */
const generateCertificate = async (enrollment) => {
  try {
    // Check if certificate already exists
    const existingCert = await Certificate.findOne({
      where: { enrollmentId: enrollment.id }
    });

    if (existingCert) return;

    const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    await Certificate.create({
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      learningPathId: enrollment.learningPathId,
      enrollmentId: enrollment.id,
      certificateNumber,
      title: enrollment.course ? enrollment.course.title : 'Learning Path Completion',
      completionDate: new Date(),
      issuedAt: new Date(),
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
  }
};

/**
 * Get enrollment by course ID for current user
 */
const getEnrollmentByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.id,
        courseId,
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'thumbnail', 'duration', 'level'],
        },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course',
        isEnrolled: false,
      });
    }

    res.status(200).json({
      success: true,
      isEnrolled: true,
      data: enrollment,
    });
  } catch (error) {
    console.error('Error fetching enrollment by course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollment',
      error: error.message,
    });
  }
};

/**
 * Get enrollment details with all materials and progress
 */
const getEnrollmentDetails = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findByPk(enrollmentId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'thumbnail', 'duration', 'level'],
          include: [
            {
              model: CourseMaterial,
              as: 'materials',
              order: [['order', 'ASC']],
            },
          ],
        },
        {
          model: LearningPath,
          as: 'learningPath',
          attributes: ['id', 'name', 'description', 'thumbnail', 'duration'],
        },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    // Check authorization
    if (enrollment.userId !== req.user.id && !req.user.permissions.includes('view_all_enrollments')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this enrollment',
      });
    }

    // Get progress for all materials
    const progressRecords = await CourseProgress.findAll({
      where: { enrollmentId: enrollment.id },
      include: [
        {
          model: CourseMaterial,
          as: 'material',
        },
      ],
    });

    // Create a map of material progress
    const progressMap = {};
    progressRecords.forEach((progress) => {
      let notes = {};
      try {
        notes = progress.notes ? JSON.parse(progress.notes) : {};
      } catch (e) {
        notes = {};
      }

      progressMap[progress.courseMaterialId] = {
        id: progress.id,
        status: progress.status,
        timeSpent: progress.timeSpent,
        completionPercentage: progress.completionPercentage,
        lastAccessedAt: progress.lastAccessedAt,
        completedAt: progress.completedAt,
        lastPlaybackPosition: notes.lastPlaybackPosition || 0,
        playbackSpeed: notes.playbackSpeed || 1.0,
      };
    });

    // Attach progress to each material
    if (enrollment.course && enrollment.course.materials) {
      enrollment.course.materials = enrollment.course.materials.map((material) => ({
        ...material.toJSON(),
        progress: progressMap[material.id] || null,
      }));
    }

    res.status(200).json({
      success: true,
      data: {
        ...enrollment.toJSON(),
        progress: progressMap,
      },
    });
  } catch (error) {
    console.error('Error fetching enrollment details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollment details',
      error: error.message,
    });
  }
};

module.exports = {
  enrollUser,
  getMyEnrollments,
  updateProgress,
  getEnrollmentByCourse,
  getEnrollmentDetails,
};
