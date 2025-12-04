import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Tabs, Tab, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { reportingService } from '@/services';
import { PageHeader, LoadingSpinner, StatCard } from '@/components/common';

export default function CreatorAnalytics() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await reportingService.getContentCreatorDashboard();
            if (response?.data?.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullPage />;

    const ActionCard = ({ title, description, icon, color, path }) => (
        <Card
            isPressable
            onPress={() => navigate(path)}
            className="border border-gray-200 dark:border-gray-800 hover:scale-[1.02] transition-transform"
        >
            <CardBody className="p-4">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
                        <Icon icon={icon} width="24" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                    </div>
                    <Icon icon="mdi:chevron-right" className="text-gray-400 mt-1" width="20" />
                </div>
            </CardBody>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full mx-auto px-4 sm:px-6 lg:px-8"
            >
                <PageHeader
                    title="Creator Dashboard"
                    description="Manage and track your course content and student engagement"
                    icon="mdi:account-tie"
                />

                {/* Key Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    <StatCard
                        title="Total Courses"
                        value={stats?.statistics?.totalCourses || 0}
                        icon="mdi:book-multiple"
                        iconColor="text-blue-600"
                        iconBg="bg-blue-100 dark:bg-blue-900"
                    />
                    <StatCard
                        title="Published Courses"
                        value={stats?.statistics?.publishedCourses || 0}
                        icon="mdi:check-circle"
                        iconColor="text-green-600"
                        iconBg="bg-green-100 dark:bg-green-900"
                    />
                    <StatCard
                        title="Draft Courses"
                        value={stats?.statistics?.draftCourses || 0}
                        icon="mdi:file-document-edit"
                        iconColor="text-amber-600"
                        iconBg="bg-amber-100 dark:bg-amber-900"
                    />
                    <StatCard
                        title="Total Students"
                        value={stats?.statistics?.totalStudents || 0}
                        icon="mdi:account-group"
                        iconColor="text-purple-600"
                        iconBg="bg-purple-100 dark:bg-purple-900"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* My Courses */}
                        <Card className="border border-gray-200 dark:border-gray-800">
                            <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Icon icon="mdi:book-open-page-variant" className="text-blue-600" />
                                    My Courses
                                </h3>
                                <Button
                                    size="sm"
                                    variant="light"
                                    color="primary"
                                    onPress={() => navigate('/creator/courses')}
                                >
                                    View All
                                </Button>
                            </CardHeader>
                            <CardBody className="p-6">
                                <div className="space-y-6">
                                    {stats?.courses?.length > 0 ? (
                                        stats.courses.slice(0, 5).map((course) => {
                                            const completionRate = course.enrollmentCount > 0
                                                ? Math.round((course.completedCount / course.enrollmentCount) * 100)
                                                : 0;
                                            return (
                                                <div key={course.id}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white">{course.title}</h4>
                                                            <p className="text-xs text-gray-500">{course.enrollmentCount} Enrolled • {course.completedCount} Completed</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Chip
                                                                size="sm"
                                                                color={course.status === 'published' ? 'success' : 'warning'}
                                                                variant="flat"
                                                            >
                                                                {course.status}
                                                            </Chip>
                                                            <span className={`text-sm font-bold ${completionRate >= 80 ? 'text-green-600' :
                                                                completionRate >= 50 ? 'text-orange-600' : 'text-red-600'
                                                                }`}>
                                                                {completionRate}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Progress
                                                        value={completionRate}
                                                        color={completionRate >= 80 ? 'success' : completionRate >= 50 ? 'warning' : 'danger'}
                                                        size="sm"
                                                        className="h-2"
                                                    />
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Icon icon="mdi:book-off-outline" className="mx-auto mb-2 text-4xl opacity-50" />
                                            <p>No courses created yet</p>
                                            <Button
                                                size="sm"
                                                className="mt-4"
                                                color="primary"
                                                variant="flat"
                                                onPress={() => navigate('/creator/courses/create')}
                                            >
                                                Create Your First Course
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="border border-gray-200 dark:border-gray-800">
                            <CardBody className="p-0">
                                <Tabs
                                    aria-label="Recent Activity"
                                    variant="underlined"
                                    classNames={{
                                        tabList: "px-6 pt-4",
                                        cursor: "w-full bg-blue-600",
                                        tab: "max-w-fit px-4 h-12",
                                        tabContent: "group-data-[selected=true]:text-blue-600 font-medium"
                                    }}
                                >
                                    <Tab
                                        key="completions"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Icon icon="mdi:trophy" className="text-green-500" />
                                                <span>Recent Completions</span>
                                                <Chip size="sm" color="success" variant="flat">{stats?.recentCompletions?.length || 0}</Chip>
                                            </div>
                                        }
                                    >
                                        <div className="p-6">
                                            <div className="space-y-3">
                                                {stats?.recentCompletions?.length > 0 ? (
                                                    stats.recentCompletions.slice(0, 5).map((completion, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                                                    <span className="text-xs font-bold">{completion.user?.firstName?.charAt(0)}{completion.user?.lastName?.charAt(0)}</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{completion.user?.firstName} {completion.user?.lastName}</p>
                                                                    <p className="text-xs text-gray-500">{completion.course?.title}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-gray-500">{new Date(completion.updatedAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-center text-gray-500 py-4">No recent completions</p>
                                                )}
                                            </div>
                                        </div>
                                    </Tab>
                                    <Tab
                                        key="quizzes"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Icon icon="mdi:clipboard-check" className="text-blue-500" />
                                                <span>Quiz Attempts</span>
                                                <Chip size="sm" color="primary" variant="flat">{stats?.recentQuizAttempts?.length || 0}</Chip>
                                            </div>
                                        }
                                    >
                                        <div className="p-6">
                                            <div className="space-y-3">
                                                {stats?.recentQuizAttempts?.length > 0 ? (
                                                    stats.recentQuizAttempts.slice(0, 5).map((attempt, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                                                    <span className="text-xs font-bold">{attempt.user?.firstName?.charAt(0)}{attempt.user?.lastName?.charAt(0)}</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{attempt.user?.firstName} {attempt.user?.lastName}</p>
                                                                    <p className="text-xs text-gray-500">{attempt.quiz?.title}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-medium text-blue-600">{attempt.score || 0}%</p>
                                                                <p className="text-xs text-gray-500">{new Date(attempt.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-center text-gray-500 py-4">No recent quiz attempts</p>
                                                )}
                                            </div>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Content Management</h3>
                            <div className="grid gap-3">
                                <ActionCard
                                    title="My Courses"
                                    description="Create and manage courses"
                                    icon="mdi:book-multiple"
                                    color="bg-blue-100"
                                    path="/creator/courses"
                                />
                                <ActionCard
                                    title="Learning Paths"
                                    description="Manage learning paths"
                                    icon="mdi:road-variant"
                                    color="bg-purple-100"
                                    path="/creator/learning-paths"
                                />
                                <ActionCard
                                    title="Grading"
                                    description="Review student submissions"
                                    icon="mdi:fountain-pen-tip"
                                    color="bg-green-100"
                                    path="/creator/grading"
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Links</h3>
                            <div className="grid gap-3">
                                <ActionCard
                                    title="Create Course"
                                    description="Start building new content"
                                    icon="mdi:plus-circle"
                                    color="bg-indigo-100"
                                    path="/creator/courses/create"
                                />
                                <ActionCard
                                    title="Create Learning Path"
                                    description="Build a curriculum"
                                    icon="mdi:plus-box"
                                    color="bg-pink-100"
                                    path="/creator/learning-paths/create"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
