import React, { useEffect, useState } from 'react';
import { reportingService } from '@/services';
import { PageHeader, LoadingSpinner, StatCard } from '@/components/common';
import { Card, CardBody, CardHeader, Progress, Button, Chip, Tabs, Tab } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

export default function ComplianceOfficerDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await reportingService.getComplianceOfficerDashboard();
            if (response?.data?.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Compliance Dashboard"
                    description="Overview of organization compliance, training status, and risk management"
                    icon="mdi:shield-check"
                />

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Users"
                        value={stats?.statistics?.totalUsers || 0}
                        icon="mdi:account-group"
                        iconColor="text-blue-600"
                        iconBg="bg-blue-100 dark:bg-blue-900"
                    />
                    <StatCard
                        title="Compliance Rate"
                        value={`${stats?.statistics?.complianceRate || 0}%`}
                        icon="mdi:chart-donut"
                        iconColor={stats?.statistics?.complianceRate >= 80 ? "text-green-600" : "text-orange-600"}
                        iconBg={stats?.statistics?.complianceRate >= 80 ? "bg-green-100 dark:bg-green-900" : "bg-orange-100 dark:bg-orange-900"}
                    />
                    <StatCard
                        title="Overdue Training"
                        value={stats?.statistics?.overdueTraining || 0}
                        icon="mdi:alert-circle"
                        iconColor="text-red-600"
                        iconBg="bg-red-100 dark:bg-red-900"
                    />
                    <StatCard
                        title="Upcoming Deadlines"
                        value={stats?.statistics?.upcomingDeadlines || 0}
                        icon="mdi:clock-alert-outline"
                        iconColor="text-amber-600"
                        iconBg="bg-amber-100 dark:bg-amber-900"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Compliance Status & Paths */}
                        <Card className="border border-gray-200 dark:border-gray-800">
                            <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Icon icon="mdi:road-variant" className="text-blue-600" />
                                    Compliance Programs
                                </h3>
                                <Button
                                    size="sm"
                                    variant="light"
                                    color="primary"
                                    onPress={() => navigate('/compliance/learning-paths')}
                                >
                                    View All
                                </Button>
                            </CardHeader>
                            <CardBody className="p-6">
                                <div className="space-y-6">
                                    {stats?.compliancePaths?.length > 0 ? (
                                        stats.compliancePaths.map((path) => (
                                            <div key={path.id}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">{path.name}</h4>
                                                        <p className="text-xs text-gray-500">{path.totalEnrolled} Enrolled • {path.completed} Completed</p>
                                                    </div>
                                                    <span className={`text-sm font-bold ${path.completionRate >= 80 ? 'text-green-600' :
                                                            path.completionRate >= 50 ? 'text-orange-600' : 'text-red-600'
                                                        }`}>
                                                        {path.completionRate}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={path.completionRate}
                                                    color={path.completionRate >= 80 ? 'success' : path.completionRate >= 50 ? 'warning' : 'danger'}
                                                    size="sm"
                                                    className="h-2"
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Icon icon="mdi:clipboard-text-off-outline" className="mx-auto mb-2 text-4xl opacity-50" />
                                            <p>No active compliance programs</p>
                                            <Button
                                                size="sm"
                                                className="mt-4"
                                                color="primary"
                                                variant="flat"
                                                onPress={() => navigate('/compliance/learning-paths/create')}
                                            >
                                                Create Program
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Alerts & Attention Items */}
                        <Card className="border border-gray-200 dark:border-gray-800">
                            <CardBody className="p-0">
                                <Tabs
                                    aria-label="Compliance Alerts"
                                    variant="underlined"
                                    classNames={{
                                        tabList: "px-6 pt-4",
                                        cursor: "w-full bg-blue-600",
                                        tab: "max-w-fit px-4 h-12",
                                        tabContent: "group-data-[selected=true]:text-blue-600 font-medium"
                                    }}
                                >
                                    <Tab
                                        key="overdue"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Icon icon="mdi:alert-circle" className="text-red-500" />
                                                <span>Overdue Items</span>
                                                <Chip size="sm" color="danger" variant="flat">{stats?.statistics?.overdueTraining || 0}</Chip>
                                            </div>
                                        }
                                    >
                                        <div className="p-6">
                                            <div className="space-y-3">
                                                {stats?.overdueTraining?.length > 0 ? (
                                                    stats.overdueTraining.slice(0, 5).map((item, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                                                                    <span className="text-xs font-bold">{item.userName.charAt(0)}</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.userName}</p>
                                                                    <p className="text-xs text-gray-500">{item.trainingName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-medium text-red-600">{item.daysOverdue} days overdue</p>
                                                                <Button
                                                                    size="sm"
                                                                    variant="light"
                                                                    color="danger"
                                                                    className="h-6 min-w-0 px-2 text-xs"
                                                                    onPress={() => navigate('/compliance/reminders')}
                                                                >
                                                                    Remind
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-center text-gray-500 py-4">No overdue items found. Great job!</p>
                                                )}
                                            </div>
                                            {stats?.overdueTraining?.length > 5 && (
                                                <Button
                                                    fullWidth
                                                    variant="light"
                                                    className="mt-4 text-gray-500"
                                                    onPress={() => navigate('/compliance/tracking')}
                                                >
                                                    View All Overdue Items
                                                </Button>
                                            )}
                                        </div>
                                    </Tab>
                                    <Tab
                                        key="upcoming"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Icon icon="mdi:clock-outline" className="text-amber-500" />
                                                <span>Upcoming (7 Days)</span>
                                                <Chip size="sm" color="warning" variant="flat">{stats?.statistics?.upcomingDeadlines || 0}</Chip>
                                            </div>
                                        }
                                    >
                                        <div className="p-6">
                                            <div className="space-y-3">
                                                {stats?.upcomingDeadlines?.length > 0 ? (
                                                    stats.upcomingDeadlines.slice(0, 5).map((item, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                                                                    <span className="text-xs font-bold">{item.userName.charAt(0)}</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.userName}</p>
                                                                    <p className="text-xs text-gray-500">{item.trainingName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-medium text-amber-600">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-center text-gray-500 py-4">No upcoming deadlines in the next 7 days.</p>
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
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Management</h3>
                            <div className="space-y-3">
                                <ActionCard
                                    title="Learning Paths"
                                    description="Create and manage compliance courses"
                                    icon="mdi:road-variant"
                                    color="bg-purple-100"
                                    path="/compliance/learning-paths"
                                />
                                <ActionCard
                                    title="User Access"
                                    description="Manage user roles and permissions"
                                    icon="mdi:account-key"
                                    color="bg-indigo-100"
                                    path="/compliance/users"
                                />
                                <ActionCard
                                    title="Reminders"
                                    description="Send bulk notifications"
                                    icon="mdi:bell-ring"
                                    color="bg-pink-100"
                                    path="/compliance/reminders"
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Analysis & Reporting</h3>
                            <div className="space-y-3">
                                <ActionCard
                                    title="Compliance Reports"
                                    description="Detailed compliance analytics"
                                    icon="mdi:file-chart"
                                    color="bg-blue-100"
                                    path="/compliance/reports"
                                />
                                <ActionCard
                                    title="Tracking View"
                                    description="Monitor real-time progress"
                                    icon="mdi:chart-timeline-variant"
                                    color="bg-teal-100"
                                    path="/compliance/tracking"
                                />
                                <ActionCard
                                    title="Audit Logs"
                                    description="View system activity logs"
                                    icon="mdi:history"
                                    color="bg-gray-100"
                                    path="/compliance/audit-logs"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
