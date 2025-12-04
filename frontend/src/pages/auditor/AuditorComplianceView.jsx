import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Divider, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { reportingService } from '@/services';
import { PageHeader, LoadingSpinner, StatCard } from '@/components/common';

export default function AuditorComplianceView() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        fetchCompliance();
    }, []);

    const fetchCompliance = async () => {
        try {
            setLoading(true);
            const response = await reportingService.getAuditorDashboard();
            if (response?.data?.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching compliance:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullPage />;

    const complianceSummary = dashboardData?.complianceSummary || {};
    const availableReports = dashboardData?.availableReports || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Compliance Overview"
                    description="Monitor organization-wide compliance - Read-Only Access"
                    icon="mdi:shield-check-outline"
                />

                {/* Compliance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Total Enrollments"
                        value={complianceSummary.totalComplianceEnrollments || 0}
                        icon="mdi:account-group"
                        iconColor="text-blue-600"
                        iconBg="bg-blue-100 dark:bg-blue-900"
                    />
                    <StatCard
                        title="Completed"
                        value={complianceSummary.completedCompliance || 0}
                        icon="mdi:check-circle"
                        iconColor="text-green-600"
                        iconBg="bg-green-100 dark:bg-green-900"
                    />
                    <StatCard
                        title="Compliance Rate"
                        value={`${complianceSummary.complianceRate || 0}%`}
                        icon="mdi:chart-line"
                        iconColor="text-purple-600"
                        iconBg="bg-purple-100 dark:bg-purple-900"
                    />
                </div>

                {/* Detailed Compliance Status */}
                <Card className="border border-gray-200 dark:border-gray-800 mb-6">
                    <CardHeader className="px-6 py-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compliance Status</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Overview of compliance training status</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Icon icon="mdi:account-multiple" className="text-2xl text-blue-600" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Total Compliance Enrollments</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">All users enrolled in compliance training</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-bold text-blue-600">
                                    {complianceSummary.totalComplianceEnrollments || 0}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Icon icon="mdi:check-circle" className="text-2xl text-green-600" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Completed Training</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Users who completed compliance training</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-bold text-green-600">
                                    {complianceSummary.completedCompliance || 0}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Icon icon="mdi:percent" className="text-2xl text-purple-600" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Overall Compliance Rate</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Percentage of completed compliance training</p>
                                    </div>
                                </div>
                                <span className="text-3xl font-bold text-purple-600">
                                    {complianceSummary.complianceRate || 0}%
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Available Reports */}
                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardHeader className="px-6 py-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Reports</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Compliance and audit reports available for review</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Icon icon="mdi:file-document" className="text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{report.name}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{report.description}</p>
                                            <Chip size="sm" variant="flat" color="default">
                                                {report.type}
                                            </Chip>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {availableReports.length === 0 && (
                            <div className="text-center py-8">
                                <Icon icon="mdi:file-document-outline" className="text-4xl text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 dark:text-gray-400">No reports available</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Read-Only Notice */}
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-3">
                    <Icon icon="mdi:information" className="text-blue-600 text-xl" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Read-Only Access:</strong> This page displays compliance information for audit purposes. No modifications can be made.
                    </p>
                </div>
            </div>
        </div>
    );
}
