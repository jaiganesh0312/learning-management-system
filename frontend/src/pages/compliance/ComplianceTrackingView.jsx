import React, { useEffect, useState } from 'react';
import { complianceService, departmentService, learningPathService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable } from '@/components/common';
import {
    Card,
    CardBody,
    Button,
    Select,
    SelectItem,
    Chip,
    Progress,
    Tabs,
    Tab,
    addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export default function ComplianceTrackingView() {
    const [loading, setLoading] = useState(true);
    const [complianceData, setComplianceData] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [paths, setPaths] = useState([]);
    const [filters, setFilters] = useState({
        departmentId: '',
        pathId: '',
    });
    const [selectedTab, setSelectedTab] = useState('overview');

    useEffect(() => {
        fetchDepartments();
        fetchPaths();
    }, []);

    useEffect(() => {
        fetchComplianceStatus();
    }, [filters]);

    const fetchDepartments = async () => {
        try {
            const response = await departmentService.getAllDepartments({ flat: true });
            if (response?.data?.success) {
                setDepartments(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchPaths = async () => {
        try {
            const response = await learningPathService.getAllLearningPaths({ type: 'compliance' });
            if (response?.data?.success) {
                setPaths(response.data.data.learningPaths);
            }
        } catch (error) {
            console.error('Error fetching paths:', error);
        }
    };

    const fetchComplianceStatus = async () => {
        try {
            setLoading(true);
            const response = await complianceService.getDepartmentComplianceStatus(filters);
            if (response?.data?.success) {
                setComplianceData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching compliance status:', error);
            addToast({ title: "Error!", description: 'Failed to load compliance status', color: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const exportReport = () => {
        if (!complianceData) return;

        // Generate CSV
        const headers = ['Department', 'Total Members', 'Total Enrollments', 'Completed', 'In Progress', 'Overdue', 'Compliance Rate'];
        const rows = complianceData.departments.map(dept => [
            dept.departmentName,
            dept.totalMembers,
            dept.totalEnrollments,
            dept.completed,
            dept.inProgress,
            dept.overdue,
            `${dept.complianceRate}%`,
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        addToast({ title: "Success!", description: 'Report exported successfully', color: 'success' });
    };

    const departmentColumns = [
        {
            key: 'name',
            label: 'DEPARTMENT',
            render: (dept) => <p className="font-medium">{dept.departmentName}</p>,
        },
        {
            key: 'members',
            label: 'MEMBERS',
            render: (dept) => <span>{dept.totalMembers}</span>,
        },
        {
            key: 'enrollments',
            label: 'ENROLLMENTS',
            render: (dept) => <span>{dept.totalEnrollments}</span>,
        },
        {
            key: 'completed',
            label: 'COMPLETED',
            render: (dept) => (
                <Chip color="success" variant="flat" size="sm">
                    {dept.completed}
                </Chip>
            ),
        },
        {
            key: 'overdue',
            label: 'OVERDUE',
            render: (dept) => (
                <Chip color="danger" variant="flat" size="sm">
                    {dept.overdue}
                </Chip>
            ),
        },
        {
            key: 'compliance',
            label: 'COMPLIANCE RATE',
            render: (dept) => (
                <div className="w-full">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{dept.complianceRate}%</span>
                    </div>
                    <Progress
                        value={dept.complianceRate}
                        color={dept.complianceRate >= 80 ? 'success' : dept.complianceRate >= 60 ? 'warning' : 'danger'}
                        size="sm"
                    />
                </div>
            ),
        },
    ];

    const userColumns = [
        {
            key: 'name',
            label: 'USER',
            render: (user) => (
                <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
            ),
        },
        {
            key: 'enrollments',
            label: 'ASSIGNED PATHS',
            render: (user) => <span>{user.enrollments?.length || 0}</span>,
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (user) => {
                const hasOverdue = user.enrollments?.some(e => e.isOverdue);
                const allCompleted = user.enrollments?.every(e => e.status === 'completed');

                if (allCompleted) {
                    return <Chip color="success" size="sm">Compliant</Chip>;
                } else if (hasOverdue) {
                    return <Chip color="danger" size="sm">Overdue</Chip>;
                }
                return <Chip color="warning" size="sm">In Progress</Chip>;
            },
        },
        {
            key: 'details',
            label: 'TRAINING DETAILS',
            render: (user) => (
                <div className="space-y-1">
                    {user.enrollments?.map((enrollment, idx) => (
                        <div key={idx} className="text-sm">
                            <span className="font-medium">{enrollment.learningPathName}</span>
                            {enrollment.isOverdue && (
                                <Chip color="danger" size="sm" className="ml-2">Overdue</Chip>
                            )}
                            {enrollment.status === 'completed' && (
                                <Chip color="success" size="sm" className="ml-2">Complete</Chip>
                            )}
                        </div>
                    ))}
                </div>
            ),
        },
    ];

    const getAllUsers = () => {
        if (!complianceData?.departments) return [];
        return complianceData.departments.flatMap(dept => dept.members || []);
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
                    title="Compliance Tracking"
                    description="View compliance training status across departments and users"
                    icon="mdi:chart-timeline-variant"
                    action={
                        <Button
                            color="primary"
                            startContent={<Icon icon="mdi:download" width="20" />}
                            onPress={exportReport}
                        >
                            Export Report
                        </Button>
                    }
                />

                {/* Filters */}
                <Card className="mb-6">
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Filter by Department"
                                placeholder="All Departments"
                                selectedKeys={filters.departmentId ? [filters.departmentId] : []}
                                onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                            >
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="Filter by Learning Path"
                                placeholder="All Paths"
                                selectedKeys={filters.pathId ? [filters.pathId] : []}
                                onChange={(e) => setFilters({ ...filters, pathId: e.target.value })}
                            >
                                {paths.map((path) => (
                                    <SelectItem key={path.id} value={path.id}>
                                        {path.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </CardBody>
                </Card>

                {/* Summary Cards */}
                {complianceData?.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardBody>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                                        <Icon icon="mdi:account-group" width="24" className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                                        <p className="text-2xl font-bold">{complianceData.summary.totalUsers}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                                        <Icon icon="mdi:check-circle" width="24" className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                                        <p className="text-2xl font-bold">{complianceData.summary.totalCompleted}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
                                        <Icon icon="mdi:alert-circle" width="24" className="text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                                        <p className="text-2xl font-bold">{complianceData.summary.totalOverdue}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                                        <Icon icon="mdi:chart-line" width="24" className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Enrollments</p>
                                        <p className="text-2xl font-bold">{complianceData.summary.totalEnrollments}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {/* Data Tables */}
                <Card>
                    <CardBody>
                        <Tabs
                            selectedKey={selectedTab}
                            onSelectionChange={setSelectedTab}
                            className="mb-4"
                        >
                            <Tab key="overview" title="Department Overview" />
                            <Tab key="users" title="User Details" />
                        </Tabs>

                        {selectedTab === 'overview' && complianceData?.departments && (
                            <DataTable
                                columns={departmentColumns}
                                data={complianceData.departments}
                            />
                        )}

                        {selectedTab === 'users' && (
                            <DataTable
                                columns={userColumns}
                                data={getAllUsers()}
                            />
                        )}
                    </CardBody>
                </Card>
            </motion.div>
        </div>
    );
}
