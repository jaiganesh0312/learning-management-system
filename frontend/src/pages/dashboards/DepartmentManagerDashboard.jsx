import React, { useEffect, useState } from 'react';
import { Card, CardBody, Accordion, AccordionItem, Progress, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { reportingService } from '@/services';
import { PageHeader, LoadingSpinner, StatCard, ListSection } from '@/components/common';
import { format } from 'date-fns';

export default function DepartmentManagerDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await reportingService.getDepartmentManagerDashboard();
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

    const { department, statistics, teamMembers, learningPaths } = data || {};

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 h-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full mx-auto px-4 sm:px-6 lg:px-8"
            >
                <PageHeader
                    title={`${department?.name || 'Department Manager'} Dashboard`}
                    description={department?.description || "Manage your team's learning and development"}
                    icon="mdi:account-supervisor"
                />

                {/* Key Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    <StatCard
                        title="Team Members"
                        value={statistics?.teamSize || 0}
                        icon="mdi:account-group"
                        iconColor="text-blue-600"
                        iconBg="bg-blue-100 dark:bg-blue-900"
                    />
                    <StatCard
                        title="Active Enrollments"
                        value={statistics?.activeEnrollments || 0}
                        icon="mdi:book-open-page-variant"
                        iconColor="text-green-600"
                        iconBg="bg-green-100 dark:bg-green-900"
                    />
                    <StatCard
                        title="Completion Rate"
                        value={`${statistics?.completionRate || 0}%`}
                        icon="mdi:chart-line"
                        iconColor="text-purple-600"
                        iconBg="bg-purple-100 dark:bg-purple-900"
                    />
                    <StatCard
                        title="Certificates Earned"
                        value={statistics?.certificatesEarned || 0}
                        icon="mdi:certificate"
                        iconColor="text-yellow-600"
                        iconBg="bg-yellow-100 dark:bg-yellow-900"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
                >
                    {/* Team Members */}
                    <div className="lg:col-span-2">
                        <ListSection title="Team Members">
                            <Accordion selectionMode="multiple" variant="splitted">
                                {teamMembers?.map((member) => (
                                    <AccordionItem
                                        key={member.id}
                                        aria-label={member.name}
                                        title={
                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                        {member.firstName[0]}{member.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                                                        <p className="text-xs text-gray-500">{member.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 text-xs text-gray-500">
                                                    <span>{member.activeCourses} Active Courses</span>
                                                    <span>Last Active: {format(new Date(member.lastActivity), 'MMM dd, yyyy')}</span>
                                                </div>
                                            </div>
                                        }
                                    >
                                        <div className="py-2 space-y-3">
                                            <h4 className="text-xs font-semibold uppercase text-gray-500">Enrollments</h4>
                                            {member.enrollments && member.enrollments.length > 0 ? (
                                                <div className="space-y-3">
                                                    {member.enrollments.map((enrollment) => (
                                                        <div key={enrollment.id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                                            <div className="flex-1">
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="text-sm font-medium">{enrollment.courseTitle}</span>
                                                                    <Chip size="sm" color={enrollment.status === 'completed' ? 'success' : enrollment.status === 'in_progress' ? 'primary' : 'default'} variant="flat">
                                                                        {enrollment.status.replace('_', ' ')}
                                                                    </Chip>
                                                                </div>
                                                                <Progress size="sm" value={enrollment.progress || 0} color="success" className="max-w-md" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No active enrollments</p>
                                            )}
                                        </div>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </ListSection>
                    </div>

                    {/* Quick Actions & Learning Paths */}
                    <div className="grid gap-3">
                        <div className="grid gap-3">
                            <h3 className="font-semibold text-lg">Quick Actions</h3>
                            <ActionCard
                                title="My Team"
                                description="View and manage team members"
                                icon="mdi:account-group"
                                color="bg-blue-100"
                                path="/manager/team"
                            />
                            <ActionCard
                                title="Learning Paths"
                                description="Assign and track learning paths"
                                icon="mdi:map-marker-path"
                                color="bg-purple-100"
                                path="/manager/learning-paths"
                            />
                            <ActionCard
                                title="Reports"
                                description="View team performance reports"
                                icon="mdi:file-chart"
                                color="bg-green-100"
                                path="/manager/reports"
                            />
                        </div>

                        <ListSection
                            title="Department Learning Paths"
                            items={learningPaths}
                            renderItem={(path) => (
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{path.name}</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{path.description}</p>
                                    </div>
                                    <Chip size="sm" variant="flat" color="secondary">{path.type}</Chip>
                                </div>
                            )}
                            emptyMessage="No learning paths assigned."
                        />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
