import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Chip, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { enrollmentService, certificateService, reportingService } from '@/services';
import { PageHeader, LoadingSpinner, StatCard, CourseCard, EmptyState } from '@/components/common';
import { motion } from "framer-motion";
export default function LearnerDashboard() {
    const { user, activeRole } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [certificates, setCertificates] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch dashboard stats
            const statsResponse = await reportingService.getDashboardStats();
            if (statsResponse?.data?.success) {
                setStats(statsResponse.data.data);
            }

            // Fetch enrollments
            const enrollmentsResponse = await enrollmentService.getMyEnrollments();
            if (enrollmentsResponse?.data?.success) {
                setEnrollments(enrollmentsResponse.data.data);
            }

            // Fetch certificates
            const certificatesResponse = await certificateService.getMyCertificates();
            if (certificatesResponse?.data?.success) {
                setCertificates(certificatesResponse.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage />;
    }

    const inProgressCourses = enrollments.filter(e => e.status === 'in_progress');
    const completedCourses = enrollments.filter(e => e.status === 'completed');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title={`Welcome back, ${user?.firstName}! 👋`}
                    description="Continue your learning journey and track your progress"
                    icon="mdi:school"
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Enrolled Courses"
                        value={enrollments.length}
                        icon="mdi:book-open-page-variant"
                        iconColor="text-blue-600"
                        iconBg="bg-blue-100 dark:bg-blue-900"
                    />
                    <StatCard
                        title="In Progress"
                        value={inProgressCourses.length}
                        icon="mdi:progress-clock"
                        iconColor="text-orange-600"
                        iconBg="bg-orange-100 dark:bg-orange-900"
                    />
                    <StatCard
                        title="Completed"
                        value={completedCourses.length}
                        icon="mdi:check-circle"
                        iconColor="text-green-600"
                        iconBg="bg-green-100 dark:bg-green-900"
                    />
                    <StatCard
                        title="Certificates"
                        value={certificates.length}
                        icon="mdi:certificate"
                        iconColor="text-purple-600"
                        iconBg="bg-purple-100 dark:bg-purple-900"
                    />
                </div>

                {/* Continue Learning Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Continue Learning
                        </h2>
                        {inProgressCourses.length > 3 && (
                            <Link to="/my-courses">
                                <Button variant="light" endContent={<Icon icon="mdi:arrow-right" />}>
                                    View All
                                </Button>
                            </Link>
                        )}
                    </div>

                    {inProgressCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {inProgressCourses.slice(0, 3).map((enrollment) => (
                                <CourseCard
                                    key={enrollment.id}
                                    course={enrollment.course}
                                    showProgress
                                    enrollmentProgress={enrollment.progress}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="mdi:book-search"
                            title="No courses in progress"
                            description="Browse our course catalog and start your learning journey"
                            actionLabel="Browse Courses"
                            onAction={() => window.location.href = '/courses'}
                        />
                    )}
                </div>

                {/* Recent Certificates */}
                {certificates.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Recent Certificates
                            </h2>
                            <Link to="/certificates">
                                <Button variant="light" endContent={<Icon icon="mdi:arrow-right" />}>
                                    View All
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {certificates.slice(0, 3).map((certificate) => (
                                <motion.div
                                    key={certificate.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Card className="border border-gray-200 dark:border-gray-800">
                                        <CardBody className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <Icon icon="mdi:certificate" className="text-2xl text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                        {certificate.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                        Issued on {new Date(certificate.issuedAt).toLocaleDateString()}
                                                    </p>
                                                    <Link to={`/certificates/${certificate.id}`}>
                                                        <Button
                                                            size="sm"
                                                            variant="flat"
                                                            color="primary"
                                                            endContent={<Icon icon="mdi:download" />}
                                                        >
                                                            Download
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link to="/courses">
                            <Card className="border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer">
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                                            <Icon icon="mdi:magnify" className="text-2xl text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Browse Courses
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Explore our catalog
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Link>

                        <Link to="/my-courses">
                            <Card className="border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all cursor-pointer">
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                                            <Icon icon="mdi:book-open-page-variant" className="text-2xl text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                My Courses
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                View enrollments
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Link>

                        <Link to="/certificates">
                            <Card className="border border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500 transition-all cursor-pointer">
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                                            <Icon icon="mdi:certificate" className="text-2xl text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Certificates
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                View achievements
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
