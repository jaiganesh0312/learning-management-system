import React, { useEffect, useState } from 'react';
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { reportingService } from '@/services';
import { PageHeader, LoadingSpinner, StatCard, ListSection } from '@/components/common';
import { format } from 'date-fns';

export default function SuperAdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await reportingService.getSuperAdminDashboard();
            if (response?.data?.success) {
                setData(response.data.data);
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

    const { statistics, recentUsers, recentActivity, recentCourses, recentEnrollments } = data || {};

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
                className="mx-auto px-4 sm:px-6 lg:px-8"
            >
                <PageHeader
                    title="System Dashboard"
                    description="Manage users, departments, and system configuration"
                    icon="mdi:shield-crown"
                />

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    <StatCard
                        title="Total Users"
                        value={statistics?.totalUsers || 0}
                        icon="mdi:account-group"
                        iconColor="text-blue-600"
                        iconBg="bg-blue-100 dark:bg-blue-900"
                    />
                    <StatCard
                        title="Total Courses"
                        value={statistics?.totalCourses || 0}
                        icon="mdi:book-open-page-variant"
                        iconColor="text-green-600"
                        iconBg="bg-green-100 dark:bg-green-900"
                    />
                    <StatCard
                        title="Active Roles"
                        value={statistics?.activeRoles || 0}
                        icon="mdi:shield-account"
                        iconColor="text-purple-600"
                        iconBg="bg-purple-100 dark:bg-purple-900"
                    />
                    <StatCard
                        title="Total Enrollments"
                        value={statistics?.totalEnrollments || 0}
                        icon="mdi:school"
                        iconColor="text-orange-600"
                        iconBg="bg-orange-100 dark:bg-orange-900"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
                >
                    {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <ListSection
                            title="Recent System Activity"
                            items={recentActivity}
                            renderItem={(log) => (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <Icon icon="mdi:clock-outline" className="text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            <span className="font-bold">{log.action}</span> on {log.resource}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            by {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'} • {format(new Date(log.createdAt), 'EEE, dd MMM yyyy, hh:mm a')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                        <div className="grid gap-4">
                            <ActionCard
                                title="Manage Users"
                                description="Add, edit, or remove users"
                                icon="mdi:account-group"
                                color="bg-blue-100"
                                path="/admin/users"
                            />
                            <ActionCard
                                title="System Settings"
                                description="Configure system parameters"
                                icon="mdi:cog"
                                color="bg-red-100"
                                path="/admin/settings"
                            />
                            <ActionCard
                                title="Audit Logs"
                                description="View full system logs"
                                icon="mdi:file-document"
                                color="bg-yellow-100"
                                path="/admin/audit-logs"
                            />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {/* Recent Users */}
                    <ListSection
                        title="New Users"
                        items={recentUsers}
                        renderItem={(user) => (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                        {user.firstName[0]}{user.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">{format(new Date(user.createdAt), 'EEE, dd MMM yyyy, hh:mm a')}</span>
                            </div>
                        )}
                    />

                    {/* Recent Courses */}
                    <ListSection
                        title="Recently Published Courses"
                        items={recentCourses}
                        renderItem={(course) => (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</p>
                                    <p className="text-xs text-gray-500 capitalize">{course.status}</p>
                                </div>
                                <span className="text-xs text-gray-400">{format(new Date(course.updatedAt), 'EEE, dd MMM yyyy, hh:mm a')}</span>
                            </div>
                        )}
                    />

                    {/* Recent Enrollments */}
                    <ListSection
                        title="Recent Enrollments"
                        items={recentEnrollments}
                        renderItem={(enrollment) => (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {enrollment.user?.firstName} {enrollment.user?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        enrolled in <span className="font-medium">{enrollment.course?.title}</span>
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400">{format(new Date(enrollment.createdAt), 'EEE, dd MMM yyyy, hh:mm a')}</span>
                            </div>
                        )}
                    />
                </motion.div>
            </motion.div>
        </div >
    );
}
