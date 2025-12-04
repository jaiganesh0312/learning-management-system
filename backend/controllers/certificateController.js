const { Certificate, Enrollment, Course, LearningPath, User } = require('../models');
const { createAuditLog } = require('../utils/auditLogger');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate certificate for a completed enrollment
 * Auto-generates on completion
 */
const generateCertificate = async (req, res) => {
    try {
        const { enrollmentId } = req.params;

        // Find enrollment with related data
        const enrollment = await Enrollment.findByPk(enrollmentId, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'empCode'],
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'duration', 'level'],
                },
                {
                    model: LearningPath,
                    as: 'learningPath',
                    attributes: ['id', 'name', 'duration'],
                },
            ],
        });

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }

        // Check if enrollment is completed
        if (enrollment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Certificate can only be generated for completed enrollments'
            });
        }

        // Check authorization
        if (enrollment.userId !== req.user.id && !req.user.permissions.includes('view_all_certificates')) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Check if certificate already exists
        let certificate = await Certificate.findOne({
            where: { enrollmentId: enrollment.id }
        });

        if (certificate) {
            return res.status(200).json({
                success: true,
                message: 'Certificate already exists',
                data: certificate,
            });
        }

        // Generate unique certificate number
        const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        // Determine title
        const title = enrollment.course
            ? enrollment.course.title
            : enrollment.learningPath
                ? enrollment.learningPath.name
                : 'Course Completion';

        // Create certificate record
        certificate = await Certificate.create({
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            learningPathId: enrollment.learningPathId,
            enrollmentId: enrollment.id,
            certificateNumber,
            title,
            completionDate: enrollment.completedAt || new Date(),
            issuedAt: new Date(),
            metadata: {
                userName: enrollment.user.name,
                empCode: enrollment.user.empCode,
                duration: enrollment.course?.duration || enrollment.learningPath?.duration,
                level: enrollment.course?.level,
            },
        });

        await createAuditLog({
            action: 'GENERATE_CERTIFICATE',
            resource: 'Certificate',
            resourceId: certificate.id,
            details: { enrollmentId, certificateNumber }
        }, req);

        res.status(201).json({
            success: true,
            message: 'Certificate generated successfully',
            data: certificate,
        });
    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating certificate',
            error: error.message,
        });
    }
};

/**
 * Get certificate by ID and optionally download as PDF
 */
const getCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const { download } = req.query;

        const certificate = await Certificate.findByPk(certificateId, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'empCode'],
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'duration', 'level'],
                },
                {
                    model: LearningPath,
                    as: 'learningPath',
                    attributes: ['id', 'name', 'duration'],
                },
            ],
        });

        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        // Check authorization
        if (certificate.userId !== req.user.id && !req.user.permissions.includes('view_all_certificates')) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // If download is requested, generate PDF
        if (download === 'true') {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    layout: 'landscape',
                    margin: 50,
                });

                // Set response headers for PDF download
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.certificateNumber}.pdf`);

                // Pipe PDF to response
                doc.pipe(res);

                // Design the certificate
                // Background
                doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');

                // Border
                doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
                    .lineWidth(3)
                    .stroke('#2c3e50');

                doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
                    .lineWidth(1)
                    .stroke('#3498db');

                // Title
                doc.fontSize(40)
                    .fillColor('#2c3e50')
                    .font('Helvetica-Bold')
                    .text('CERTIFICATE OF COMPLETION', 0, 100, {
                        align: 'center',
                        width: doc.page.width,
                    });

                // Decorative line
                doc.moveTo(200, 160)
                    .lineTo(doc.page.width - 200, 160)
                    .lineWidth(2)
                    .stroke('#3498db');

                // Certificate text
                doc.fontSize(16)
                    .fillColor('#34495e')
                    .font('Helvetica')
                    .text('This is to certify that', 0, 200, {
                        align: 'center',
                        width: doc.page.width,
                    });

                // User name
                doc.fontSize(32)
                    .fillColor('#2c3e50')
                    .font('Helvetica-Bold')
                    .text(certificate.user.name, 0, 240, {
                        align: 'center',
                        width: doc.page.width,
                    });

                // Completion text
                doc.fontSize(16)
                    .fillColor('#34495e')
                    .font('Helvetica')
                    .text('has successfully completed', 0, 290, {
                        align: 'center',
                        width: doc.page.width,
                    });

                // Course/Path title
                doc.fontSize(24)
                    .fillColor('#3498db')
                    .font('Helvetica-Bold')
                    .text(certificate.title, 0, 320, {
                        align: 'center',
                        width: doc.page.width,
                    });

                // Completion date
                const completionDate = new Date(certificate.completionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });

                doc.fontSize(14)
                    .fillColor('#34495e')
                    .font('Helvetica')
                    .text(`Completed on ${completionDate}`, 0, 380, {
                        align: 'center',
                        width: doc.page.width,
                    });

                // Certificate number
                doc.fontSize(10)
                    .fillColor('#7f8c8d')
                    .text(`Certificate No: ${certificate.certificateNumber}`, 0, 450, {
                        align: 'center',
                        width: doc.page.width,
                    });

                // Signature line
                doc.moveTo(150, 500)
                    .lineTo(350, 500)
                    .stroke('#2c3e50');

                doc.fontSize(12)
                    .fillColor('#2c3e50')
                    .text('Authorized Signature', 150, 510, {
                        width: 200,
                        align: 'center',
                    });

                // Finalize PDF
                doc.end();
            } catch (pdfError) {
                console.error('Error generating PDF:', pdfError);
                return res.status(500).json({
                    success: false,
                    message: 'Error generating PDF',
                    error: pdfError.message,
                });
            }
        } else {
            // Return certificate data as JSON
            res.status(200).json({
                success: true,
                data: certificate,
            });
        }
    } catch (error) {
        console.error('Error fetching certificate:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching certificate',
            error: error.message,
        });
    }
};

/**
 * Get all certificates for the current user (learner)
 */
const getMyCertificates = async (req, res) => {
    try {
        const { courseId, learningPathId } = req.query;
        const whereClause = { userId: req.user.id };

        if (courseId) whereClause.courseId = courseId;
        if (learningPathId) whereClause.learningPathId = learningPathId;

        const certificates = await Certificate.findAll({
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
                    attributes: ['id', 'name', 'thumbnail', 'duration'],
                },
            ],
            order: [['issuedAt', 'DESC']],
        });

        res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates,
        });
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching certificates',
            error: error.message,
        });
    }
};

/**
 * Get certificates for a specific user (Admin/Manager)
 */
const getUserCertificates = async (req, res) => {
    try {
        const { userId } = req.params;
        const { courseId, learningPathId } = req.query;

        // Check permissions
        if (!req.user.permissions.includes('view_all_certificates')) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view other users certificates'
            });
        }

        const whereClause = { userId };
        if (courseId) whereClause.courseId = courseId;
        if (learningPathId) whereClause.learningPathId = learningPathId;

        const certificates = await Certificate.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'empCode'],
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'thumbnail', 'duration', 'level'],
                },
                {
                    model: LearningPath,
                    as: 'learningPath',
                    attributes: ['id', 'name', 'thumbnail', 'duration'],
                },
            ],
            order: [['issuedAt', 'DESC']],
        });

        res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates,
        });
    } catch (error) {
        console.error('Error fetching user certificates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user certificates',
            error: error.message,
        });
    }
};

module.exports = {
    generateCertificate,
    getCertificate,
    getMyCertificates,
    getUserCertificates,
};
