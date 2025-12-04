import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Chip, Divider, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { courseService, enrollmentService } from '@/services';
import assessmentService from '@/services/assessmentService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import AssessmentList from '@/components/learner/AssessmentList';
import ProgressCard from '@/components/learner/ProgressCard';

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [assessments, setAssessments] = useState(null);
    const [progress, setProgress] = useState(null);

    useEffect(() => {
        fetchCourse();
        fetchAssessments();
    }, [id]);

    const fetchAssessments = async () => {
        try {
            const response = await assessmentService.getCourseAssessments(id);
            if (response?.data?.success) {
                setAssessments(response.data.data);

                // Calculate progress (mock data - should come from backend)
                const { quizzes = [], assignments = [] } = response.data.data;
                setProgress({
                    totalAssessments: quizzes.length + assignments.length,
                    completedAssessments: 0, // TODO: Get from backend
                    quizzesCompleted: 0,
                    totalQuizzes: quizzes.length,
                    assignmentsCompleted: 0,
                    totalAssignments: assignments.length,
                    averageScore: 0,
                });
            }
        } catch (error) {
            console.error('Error fetching assessments:', error);
        }
    };

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await courseService.getCourse(id);
            if (response?.data?.success) {
                setCourse(response.data.data);
            }

            // Check enrollment status
            const enrollmentResponse = await enrollmentService.getEnrollmentByCourse(id);
            if (enrollmentResponse?.data?.isEnrolled) {
                setIsEnrolled(true);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            // No need to pass userId - backend will use current user
            const response = await enrollmentService.enrollUser({ courseId: id });
            if (response?.data?.success) {
                setIsEnrolled(true);
                // Navigate to course player
                navigate(`/course-player/${id}`);
            }
        } catch (error) {
            console.error('Error enrolling:', error);
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage />;
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-400">Course not found</p>
            </div>
        );
    }

    const levelColors = {
        beginner: 'success',
        intermediate: 'warning',
        advanced: 'danger'
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Button
                    variant="light"
                    startContent={<Icon icon="mdi:arrow-left" />}
                    onPress={() => navigate('/courses')}
                    className="mb-6"
                >
                    Back to Courses
                </Button>

                {/* Course Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border border-gray-200 dark:border-gray-800 mb-6">
                        <CardBody className="p-8">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Course Thumbnail */}
                                <div className="md:w-1/3">
                                    <img
                                        src={course.thumbnail || '/placeholder-course.jpg'}
                                        alt={course.title}
                                        className="w-full rounded-xl object-cover aspect-video"
                                    />
                                </div>

                                {/* Course Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                                {course.title}
                                            </h1>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Chip
                                                    color={levelColors[course.level] || 'default'}
                                                    variant="flat"
                                                    size="sm"
                                                    className="capitalize"
                                                >
                                                    {course.level}
                                                </Chip>
                                                {course.category && (
                                                    <Chip variant="flat" size="sm" className="capitalize">
                                                        {course.category}
                                                    </Chip>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                                        {course.description}
                                    </p>

                                    {/* Course Meta */}
                                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
                                        <div className="flex items-center gap-2">
                                            <Icon icon="mdi:clock-outline" className="text-lg" />
                                            <span>{course.duration || 'Self-paced'}</span>
                                        </div>
                                        {course.materialsCount > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Icon icon="mdi:file-document-outline" className="text-lg" />
                                                <span>{course.materialsCount} materials</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Enroll Button */}
                                    {!isEnrolled ? (
                                        <Button
                                            color="primary"
                                            size="lg"
                                            onPress={handleEnroll}
                                            isLoading={enrolling}
                                            startContent={!enrolling && <Icon icon="mdi:book-plus" />}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600"
                                        >
                                            {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                        </Button>
                                    ) : (
                                        <Button
                                            color="success"
                                            size="lg"
                                            onPress={() => navigate(`/course-player/${id}`)}
                                            startContent={<Icon icon="mdi:play-circle" />}
                                        >
                                            Continue Learning
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Course Materials */}
                    {course.materials && course.materials.length > 0 && (
                        <Card className="border border-gray-200 dark:border-gray-800 mb-6">
                            <CardBody className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    Course Materials
                                </h2>
                                <div className="space-y-3">
                                    {course.materials.map((material, index) => (
                                        <div
                                            key={material.id}
                                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                        >
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {material.title}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                    {material.type}
                                                </p>
                                            </div>
                                            <Icon
                                                icon={
                                                    material.type === 'video' ? 'mdi:video' :
                                                        material.type === 'document' ? 'mdi:file-document' :
                                                            'mdi:file'
                                                }
                                                className="text-xl text-gray-400"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Assessments Section */}
                    {assessments && (isEnrolled || assessments.quizzes?.length > 0 || assessments.assignments?.length > 0) && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <AssessmentList assessments={assessments} courseId={id} />
                            </div>
                            <div className="lg:col-span-1">
                                {progress && <ProgressCard progress={progress} />}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
