import React, { useEffect, useState } from 'react';
import { reportingService } from '@/services';
import { PageHeader, LoadingSpinner, StatCard, DataTable } from '@/components/common';
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';

export default function ManagerReports() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await reportingService.getDepartmentManagerDashboard();
            if (response?.data?.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullPage />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <PageHeader
                    title={`${stats?.department?.name || 'Department'} Reports`}
                    description={stats?.department?.description || 'View team performance and progress'}
                    icon="mdi:chart-box"
                />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard
                        title="Team Members"
                        value={stats?.statistics?.teamSize || 0}
                        icon="mdi:account-group"
                        iconColor="text-blue-600"
                        iconBg="bg-blue-100 dark:bg-blue-900"
                    />
                    <StatCard
                        title="Active Enrollments"
                        value={stats?.statistics?.activeEnrollments || 0}
                        icon="mdi:book-open"
                        iconColor="text-green-600"
                        iconBg="bg-green-100 dark:bg-green-900"
                    />
                    <StatCard
                        title="Completion Rate"
                        value={`${stats?.statistics?.completionRate || 0}%`}
                        icon="mdi:chart-arc"
                        iconColor="text-purple-600"
                        iconBg="bg-purple-100 dark:bg-purple-900"
                    />
                    <StatCard
                        title="Certificates Earned"
                        value={stats?.statistics?.certificatesEarned || 0}
                        icon="mdi:certificate"
                        iconColor="text-yellow-600"
                        iconBg="bg-yellow-100 dark:bg-yellow-900"
                    />
                </div>

                {/* Team Members Progress Table */}
                <Card className="border border-gray-200 dark:border-gray-800 mb-6">
                    <CardBody className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Team Member Progress
                        </h3>

                        <DataTable
                            data={stats?.teamMembers || []}
                            columns={[
                                {
                                    key: 'name',
                                    label: 'NAME',
                                    render: (member) => (
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {member.firstName?.[0]}{member.lastName?.[0]}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {member.firstName} {member.lastName}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                },
                                { key: 'email', label: 'EMAIL' },
                                {
                                    key: 'activeCourses',
                                    label: 'ACTIVE',
                                    render: (member) => (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            {member.activeCourses || 0}
                                        </span>
                                    )
                                },
                                {
                                    key: 'completedCourses',
                                    label: 'COMPLETED',
                                    render: (member) => (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {member.completedCourses || 0}
                                        </span>
                                    )
                                },
                                {
                                    key: 'averageProgress',
                                    label: 'AVG PROGRESS',
                                    render: (member) => (
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                                    style={{ width: `${member.averageProgress || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {member.averageProgress || 0}%
                                            </span>
                                        </div>
                                    )
                                }
                            ]}
                            pagination={true}
                            searchable={true}
                            emptyContent={
                                <div className="text-center py-8 text-gray-500">
                                    <Icon icon="mdi:account-off-outline" className="text-4xl mx-auto mb-2 opacity-50" />
                                    <p>No team members found</p>
                                </div>
                            }
                        />
                    </CardBody>
                </Card>

                {/* Learning Paths Summary */}
                {stats?.learningPaths?.length > 0 && (
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Department Learning Paths
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {stats.learningPaths.map((lp) => (
                                    <div
                                        key={lp.id}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Icon icon="mdi:map-marker-path" className="text-xl text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                    {lp.name}
                                                </h4>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {lp.description || 'No description'}
                                                </p>
                                                {lp.type && (
                                                    <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                        {lp.type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                )}
            </motion.div>
        </div>
    );
}

