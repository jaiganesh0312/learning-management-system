import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Chip, Progress, Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { enrollmentService } from '@/services';
import { PageHeader, LoadingSpinner, EmptyState, CourseCard } from '@/components/common';

export default function MyCourses() {
    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState([]);
    const [selectedTab, setSelectedTab] = useState('all');

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const response = await enrollmentService.getMyEnrollments();
            if (response?.data?.success) {
                setEnrollments(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage />;
    }

    // Filter enrollments by type (course vs learning path)
    const courseEnrollments = enrollments.filter(e => e.courseId);
    const learningPathEnrollments = enrollments.filter(e => e.learningPathId);

    // Filter by status
    const allEnrollments = selectedTab === 'learning-paths' ? learningPathEnrollments : courseEnrollments;
    const inProgressEnrollments = allEnrollments.filter(e => e.status === 'in_progress');
    const completedEnrollments = allEnrollments.filter(e => e.status === 'completed');
    const notStartedEnrollments = allEnrollments.filter(e => e.status === 'not_started');

    const getFilteredEnrollments = () => {
        switch (selectedTab) {
            case 'learning-paths':
                return learningPathEnrollments;
            case 'in-progress':
                return courseEnrollments.filter(e => e.status === 'in_progress');
            case 'completed':
                return courseEnrollments.filter(e => e.status === 'completed');
            case 'not-started':
                return courseEnrollments.filter(e => e.status === 'not_started');
            default:
                return courseEnrollments;
        }
    };

    const filteredEnrollments = getFilteredEnrollments();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="My Courses"
                    description="Track your learning progress and continue where you left off"
                    icon="mdi:book-open-page-variant"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'My Courses' }
                    ]}
                    actions={[
                        {
                            label: 'Browse Courses',
                            icon: 'mdi:magnify',
                            color: 'primary',
                            href: '/courses'
                        }
                    ]}
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Courses</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{courseEnrollments.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:book-multiple" className="text-2xl text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
                                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{courseEnrollments.filter(e => e.status === 'in_progress').length}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:progress-clock" className="text-2xl text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{courseEnrollments.filter(e => e.status === 'completed').length}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:check-circle" className="text-2xl text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Learning Paths</p>
                                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{learningPathEnrollments.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:folder-network" className="text-2xl text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Tabs Filter */}
                <Card className="border border-gray-200 dark:border-gray-800 mb-6">
                    <CardBody className="p-0">
                        <Tabs
                            selectedKey={selectedTab}
                            onSelectionChange={setSelectedTab}
                            variant="underlined"
                            classNames={{
                                tabList: "gap-6 px-6",
                                cursor: "w-full bg-primary",
                                tab: "h-14"
                            }}
                        >
                            <Tab
                                key="all"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:view-grid" />
                                        <span>All Courses</span>
                                        <Chip size="sm" variant="flat">{allEnrollments.length}</Chip>
                                    </div>
                                }
                            />
                            <Tab
                                key="in-progress"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:progress-clock" />
                                        <span>In Progress</span>
                                        <Chip size="sm" color="warning" variant="flat">{inProgressEnrollments.length}</Chip>
                                    </div>
                                }
                            />
                            <Tab
                                key="completed"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:check-circle" />
                                        <span>Completed</span>
                                        <Chip size="sm" color="success" variant="flat">{completedEnrollments.length}</Chip>
                                    </div>
                                }
                            />
                            <Tab
                                key="not-started"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:clock-outline" />
                                        <span>Not Started</span>
                                        <Chip size="sm" variant="flat">{courseEnrollments.filter(e => e.status === 'not_started').length}</Chip>
                                    </div>
                                }
                            />
                            <Tab
                                key="learning-paths"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:folder-network" />
                                        <span>Learning Paths</span>
                                        <Chip size="sm" color="secondary" variant="flat">{learningPathEnrollments.length}</Chip>
                                    </div>
                                }
                            />
                        </Tabs>
                    </CardBody>
                </Card>

                {/* Course/Learning Path Grid */}
                {filteredEnrollments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEnrollments.map((enrollment) => (
                            <motion.div
                                key={enrollment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {enrollment.course && (
                                    <CourseCard
                                        course={enrollment.course}
                                        showProgress
                                        enrollmentProgress={enrollment.progress}
                                    />
                                )}
                                {enrollment.learningPath && (
                                    <Card className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                                        <CardBody className="p-4">
                                            <div className="aspect-video bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mb-3 flex items-center justify-center">
                                                <Icon icon="mdi:folder-network" className="text-6xl text-white" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{enrollment.learningPath.name}</h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Chip size="sm" color="secondary" variant="flat">Learning Path</Chip>
                                            </div>
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                                                    <span className="text-sm font-semibold text-primary">{Math.floor(enrollment.progress || 0)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${enrollment.progress || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={selectedTab === 'learning-paths' ? "mdi:folder-network-outline" : "mdi:book-search"}
                        title={`No ${selectedTab === 'all' ? '' : selectedTab === 'learning-paths' ? 'learning paths' : selectedTab.replace('-', ' ')} ${selectedTab === 'learning-paths' ? '' : 'courses'}`}
                        description="Explore our course catalog to start learning"
                        actionLabel="Browse Courses"
                        onAction={() => window.location.href = '/courses'}
                    />
                )}
            </div>
        </div>
    );
}
