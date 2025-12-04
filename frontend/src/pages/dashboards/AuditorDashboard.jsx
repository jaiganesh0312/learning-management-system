import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Divider, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { reportingService } from '@/services';
import { PageHeader, LoadingSpinner, StatCard } from '@/components/common';
import { format } from 'date-fns';

export default function AuditorDashboard() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await reportingService.getAuditorDashboard();
            if (response?.data?.success) {
                setDashboardData(response.data.data);
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

    const stats = dashboardData?.statistics || {};
    const recentLogs = dashboardData?.recentAuditLogs?.slice(0, 5) || [];
    const complianceSummary = dashboardData?.complianceSummary || {};
    const availableReports = dashboardData?.availableReports || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full mx-auto px-4 sm:px-6 lg:px-8"
            >
                <PageHeader
                    title="Auditor Dashboard"
                    description="Monitor system activity and compliance - Read-Only Access"
                    icon="mdi:shield-search"
                />

                {/* Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    <StatCard
                        title="Total Audit Logs"
                        value={stats.totalAuditLogs || 0}
                        icon="mdi:file-document-multiple"
                        iconColor="text-blue-600"
                        iconBg="bg-blue-100 dark:bg-blue-900"
                    />
                    <StatCard
                        title="Recent Activity (7d)"
                        value={stats.recentActivity || 0}
                        icon="mdi:clock-outline"
                        iconColor="text-green-600"
                        iconBg="bg-green-100 dark:bg-green-900"
                    />
                    <StatCard
                        title="System Changes (30d)"
                        value={stats.systemChanges || 0}
                        icon="mdi:database-sync"
                        iconColor="text-orange-600"
                        iconBg="bg-orange-100 dark:bg-orange-900"
                    />
                    <StatCard
                        title="Active Reports"
                        value={availableReports.length || 0}
                        icon="mdi:file-chart"
                        iconColor="text-purple-600"
                        iconBg="bg-purple-100 dark:bg-purple-900"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                >
                    {/* Recent Audit Logs Preview */}
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardHeader className="flex justify-between items-center px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Audit Logs</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Latest system activities</p>
                            </div>
                            <Link to="/auditor/logs">
                                <Chip color="primary" variant="flat" size="sm">View All</Chip>
                            </Link>
                        </CardHeader>
                        <Divider />
                        <CardBody className="p-4">
                            <div className="space-y-3">
                                {recentLogs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                            <Icon icon="mdi:file-document" className="text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {log.action} - {log.resource}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                {log.createdAt && format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {recentLogs.length === 0 && (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent logs</p>
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Compliance Summary */}
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardHeader className="px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compliance Summary</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Organization-wide compliance status</p>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Enrollments</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {complianceSummary.totalComplianceEnrollments || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                                    <span className="text-lg font-bold text-green-600">
                                        {complianceSummary.completedCompliance || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Compliance Rate</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {complianceSummary.complianceRate || 0}%
                                    </span>
                                </div>
                                <Link to="/auditor/compliance" className="block w-full">
                                    <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                        View Detailed Report
                                    </button>
                                </Link>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Quick Access Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <Link to="/auditor/logs">
                        <Card className="border border-gray-200 dark:border-gray-800 hover:border-blue-500 transition-all cursor-pointer h-full">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                                        <Icon icon="mdi:file-document-edit" className="text-2xl text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Audit Logs</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">View system logs</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Link>

                    <Link to="/auditor/compliance">
                        <Card className="border border-gray-200 dark:border-gray-800 hover:border-green-500 transition-all cursor-pointer h-full">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                                        <Icon icon="mdi:clipboard-check" className="text-2xl text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Compliance</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Review compliance</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Link>

                    <Link to="/auditor/system-settings">
                        <Card className="border border-gray-200 dark:border-gray-800 hover:border-purple-500 transition-all cursor-pointer h-full">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                                        <Icon icon="mdi:cog" className="text-2xl text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">System Settings</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">View settings</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Link>

                    <Card className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:shield-lock" className="text-2xl text-gray-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Read-Only Mode</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">View access only</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
