import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Tabs, Tab, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';
import { reportingService } from '@/services';
import { PageHeader, LoadingSpinner, StatCard } from '@/components/common';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const cardHover = {
    scale: 1.02,
    transition: { duration: 0.2 }
};

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

    const ActionCard = ({ title, description, icon, gradient, path }) => (
        <motion.div whileHover={cardHover} whileTap={{ scale: 0.98 }}>
            <Card
                isPressable
                onPress={() => navigate(path)}
                className="border border-gray-200/60 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-300"
            >
                <CardBody className="p-4">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${gradient} shadow-lg`}>
                            <Icon icon={icon} className="text-white text-xl" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                        </div>
                        <Icon icon="mdi:chevron-right" className="text-gray-400 mt-1" width="20" />
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20 py-8">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <motion.div variants={itemVariants}>
                    <PageHeader
                        title="Creator Dashboard"
                        description="Manage and track your course content and student engagement"
                        icon="mdi:account-tie"
                    />
                </motion.div>

                {/* Key Metrics */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Total Courses"
                            value={stats?.statistics?.totalCourses || 0}
                            icon="mdi:book-multiple"
                            iconColor="text-blue-600"
                            iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Published Courses"
                            value={stats?.statistics?.publishedCourses || 0}
                            icon="mdi:check-circle"
                            iconColor="text-emerald-600"
                            iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Draft Courses"
                            value={stats?.statistics?.draftCourses || 0}
                            icon="mdi:file-document-edit"
                            iconColor="text-amber-600"
                            iconBg="bg-gradient-to-br from-amber-500 to-orange-600"
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Total Students"
                            value={stats?.statistics?.totalStudents || 0}
                            icon="mdi:account-group"
                            iconColor="text-purple-600"
                            iconBg="bg-gradient-to-br from-purple-500 to-violet-600"
                        />
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* My Courses */}
                        <motion.div variants={itemVariants}>
                            <Card className="border border-gray-200/60 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                                <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                                <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <Icon icon="mdi:book-open-page-variant" className="text-white text-sm" />
                                        </div>
                                        My Courses
                                    </h3>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                        onPress={() => navigate('/creator/courses')}
                                    >
                                        View All
                                    </Button>
                                </CardHeader>
                                <CardBody className="p-6">
                                    <div className="space-y-6">
                                        {stats?.courses?.length > 0 ? (
                                            stats.courses.slice(0, 5).map((course, index) => {
                                                const completionRate = course.enrollmentCount > 0
                                                    ? Math.round((course.completedCount / course.enrollmentCount) * 100)
                                                    : 0;
                                                return (
                                                    <motion.div
                                                        key={course.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div>
                                                                <h4 className="font-medium text-gray-900 dark:text-white">{course.title}</h4>
                                                                <p className="text-xs text-gray-500">{course.enrollmentCount} Enrolled • {course.completedCount} Completed</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Chip
                                                                    size="sm"
                                                                    variant="flat"
                                                                    className={course.status === 'published'
                                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}
                                                                >
                                                                    {course.status}
                                                                </Chip>
                                                                <span className={`text-sm font-bold ${completionRate >= 80 ? 'text-emerald-600' :
                                                                    completionRate >= 50 ? 'text-orange-600' : 'text-rose-600'
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
                                                            classNames={{
                                                                indicator: completionRate >= 80
                                                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                                                    : completionRate >= 50
                                                                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                                                        : "bg-gradient-to-r from-rose-500 to-pink-500"
                                                            }}
                                                        />
                                                    </motion.div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                                                    <Icon icon="mdi:book-off-outline" className="text-3xl text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No courses created yet</p>
                                                <p className="text-sm text-gray-500 mb-4">Start creating your first course</p>
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    onPress={() => navigate('/creator/courses/create')}
                                                    className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                                    startContent={<Icon icon="mdi:plus" />}
                                                >
                                                    Create Your First Course
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div variants={itemVariants}>
                            <Card className="border border-gray-200/60 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                                <CardBody className="p-0">
                                    <Tabs
                                        aria-label="Recent Activity"
                                        variant="underlined"
                                        classNames={{
                                            tabList: "px-6 pt-4",
                                            cursor: "w-full bg-gradient-to-r from-blue-600 to-indigo-600",
                                            tab: "max-w-fit px-4 h-12",
                                            tabContent: "group-data-[selected=true]:text-blue-600 dark:group-data-[selected=true]:text-blue-400 font-medium"
                                        }}
                                    >
                                        <Tab
                                            key="completions"
                                            title={
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="mdi:trophy" className="text-emerald-500" />
                                                    <span>Recent Completions</span>
                                                    <Chip size="sm" variant="flat" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                        {stats?.recentCompletions?.length || 0}
                                                    </Chip>
                                                </div>
                                            }
                                        >
                                            <div className="p-6">
                                                <div className="space-y-3">
                                                    {stats?.recentCompletions?.length > 0 ? (
                                                        stats.recentCompletions.slice(0, 5).map((completion, index) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-emerald-500/25">
                                                                        {completion.user?.firstName?.charAt(0)}{completion.user?.lastName?.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{completion.user?.firstName} {completion.user?.lastName}</p>
                                                                        <p className="text-xs text-gray-500">{completion.course?.title}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs text-gray-500">{new Date(completion.updatedAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <p className="text-center text-gray-500 py-8">No recent completions</p>
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
                                                    <Chip size="sm" variant="flat" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {stats?.recentQuizAttempts?.length || 0}
                                                    </Chip>
                                                </div>
                                            }
                                        >
                                            <div className="p-6">
                                                <div className="space-y-3">
                                                    {stats?.recentQuizAttempts?.length > 0 ? (
                                                        stats.recentQuizAttempts.slice(0, 5).map((attempt, index) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-blue-500/25">
                                                                        {attempt.user?.firstName?.charAt(0)}{attempt.user?.lastName?.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{attempt.user?.firstName} {attempt.user?.lastName}</p>
                                                                        <p className="text-xs text-gray-500">{attempt.quiz?.title}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-bold text-blue-600">{attempt.score || 0}%</p>
                                                                    <p className="text-xs text-gray-500">{new Date(attempt.createdAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <p className="text-center text-gray-500 py-8">No recent quiz attempts</p>
                                                    )}
                                                </div>
                                            </div>
                                        </Tab>
                                    </Tabs>
                                </CardBody>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Content Management</h3>
                            <div className="space-y-3">
                                <ActionCard
                                    title="My Courses"
                                    description="Create and manage courses"
                                    icon="mdi:book-multiple"
                                    gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                                    path="/creator/courses"
                                />
                                <ActionCard
                                    title="Learning Paths"
                                    description="Manage learning paths"
                                    icon="mdi:road-variant"
                                    gradient="bg-gradient-to-br from-purple-500 to-violet-600"
                                    path="/creator/learning-paths"
                                />
                                <ActionCard
                                    title="Grading"
                                    description="Review student submissions"
                                    icon="mdi:fountain-pen-tip"
                                    gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                                    path="/creator/grading"
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Links</h3>
                            <div className="space-y-3">
                                <ActionCard
                                    title="Create Course"
                                    description="Start building new content"
                                    icon="mdi:plus-circle"
                                    gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
                                    path="/creator/courses/create"
                                />
                                <ActionCard
                                    title="Create Learning Path"
                                    description="Build a curriculum"
                                    icon="mdi:plus-box"
                                    gradient="bg-gradient-to-br from-rose-500 to-pink-600"
                                    path="/creator/learning-paths/create"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
