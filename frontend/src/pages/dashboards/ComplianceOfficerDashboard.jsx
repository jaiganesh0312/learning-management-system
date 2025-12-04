import React, { useEffect, useState } from 'react';
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { reportingService } from '@/services';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatCard from '@/components/common/StatCard';

export default function ComplianceOfficerDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await reportingService.getComplianceOfficerDashboard();
            if (response?.data?.success) {
                setStats(response.data.data);
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Compliance Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">Monitor training compliance and certification status</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Compliance Rate" value={`${stats?.complianceRate || 0}%`} icon="mdi:shield-check" iconColor="text-green-600" iconBg="bg-green-100 dark:bg-green-900" />
                    <StatCard title="Overdue Trainings" value={stats?.overdueTrainings || 0} icon="mdi:alert-circle" iconColor="text-red-600" iconBg="bg-red-100 dark:bg-red-900" />
                    <StatCard title="Certifications" value={stats?.certifications || 0} icon="mdi:certificate" iconColor="text-blue-600" iconBg="bg-blue-100 dark:bg-blue-900" />
                    <StatCard title="Active Users" value={stats?.activeUsers || 0} icon="mdi:account-group" iconColor="text-purple-600" iconBg="bg-purple-100 dark:bg-purple-900" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/compliance/reports">
                        <Card className="border border-gray-200 dark:border-gray-800 hover:border-blue-500 transition-all cursor-pointer">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                                        <Icon icon="mdi:file-chart" className="text-2xl text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Compliance Reports</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">View detailed reports</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Link>

                    <Link to="/compliance/certifications">
                        <Card className="border border-gray-200 dark:border-gray-800 hover:border-green-500 transition-all cursor-pointer">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                                        <Icon icon="mdi:certificate" className="text-2xl text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Certifications</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Track certifications</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Link>

                    <Link to="/compliance/overdue">
                        <Card className="border border-gray-200 dark:border-gray-800 hover:border-red-500 transition-all cursor-pointer">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
                                        <Icon icon="mdi:alert-circle" className="text-2xl text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Overdue Items</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Review overdue</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
