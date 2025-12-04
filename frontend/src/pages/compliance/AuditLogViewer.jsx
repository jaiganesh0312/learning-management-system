import React, { useEffect, useState } from 'react';
import { auditLogService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable } from '@/components/common';
import { Card, CardBody, Button, Input, Select, SelectItem, Chip, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';

export default function AuditLogViewer() {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const [filters, setFilters] = useState({
        action: '',
        resource: '',
        userId: '',
        startDate: '',
        endDate: '',
        status: '',
    });

    useEffect(() => {
        fetchLogs();
    }, [pagination.page, pagination.limit]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await auditLogService.getAuditLogs({
                page: pagination.page,
                limit: pagination.limit,
                ...filters,
            });

            if (response?.data?.success) {
                setLogs(response.data.data.logs);
                setPagination({
                    ...pagination,
                    total: response.data.data.pagination.total,
                });
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            addToast({ title: "Error!", description: 'Failed to load audit logs', color: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination({ ...pagination, page: 1 });
        fetchLogs();
    };

    const handleClearFilters = () => {
        setFilters({
            action: '',
            resource: '',
            userId: '',
            startDate: '',
            endDate: '',
            status: '',
        });
        setPagination({ ...pagination, page: 1 });
    };

    const handleExport = async (format = 'csv') => {
        try {
            const response = await auditLogService.exportAuditLogs({
                format,
                ...filters,
            });

            if (response?.data) {
                addToast({ title: "Success!", description: 'Audit logs exported successfully', color: 'success' });
            } else {
                addToast({ title: "Error!", description: 'Failed to export audit logs', color: 'danger' });
            }
        } catch (error) {
            console.error('Error exporting audit logs:', error);
            addToast({ title: "Error!", description: 'Failed to export audit logs', color: 'danger' });
        }
    };

    const columns = [
        {
            key: 'timestamp',
            label: 'TIMESTAMP',
            render: (log) => (
                <span className="text-sm">{format(log.createdAt, "EEE, dd LLL yyyy, hh:mm")}</span> // Day Date Month Year Time Am/pm
            ),
        },
        {
            key: 'user',
            label: 'USER',
            render: (log) => (
                <div>
                    <p className="font-medium text-sm">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">{log.user?.email || 'N/A'}</p>
                </div>
            ),
        },
        {
            key: 'action',
            label: 'ACTION',
            render: (log) => (
                <Chip size="sm" variant="flat" color="primary">
                    {log.action}
                </Chip>
            ),
        },
        {
            key: 'resource',
            label: 'RESOURCE',
            render: (log) => (
                <div>
                    <p className="font-medium text-sm">{log.resource}</p>
                    {log.resourceId && <p className="text-xs text-gray-500">ID: {log.resourceId}</p>}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (log) => (
                <Chip
                    size="sm"
                    variant="flat"
                    color={log.status === 'success' ? 'success' : 'danger'}
                >
                    {log.status}
                </Chip>
            ),
        },
        {
            key: 'role',
            label: 'ROLE',
            render: (log) => (
                <span className="text-sm">{log.role?.displayName || 'N/A'}</span>
            ),
        },
        {
            key: 'ip',
            label: 'IP ADDRESS',
            render: (log) => <span className="text-sm font-mono">{log.ipAddress || 'N/A'}</span>,
        },
    ];

    if (loading && logs.length === 0) return <LoadingSpinner fullPage />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Audit Logs"
                    description="View and export system audit logs"
                    icon="mdi:file-document-outline"
                    action={
                        <div className="flex gap-2">
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<Icon icon="mdi:file-delimited" width="20" />}
                                onPress={() => handleExport('csv')}
                            >
                                Export CSV
                            </Button>
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<Icon icon="mdi:code-json" width="20" />}
                                onPress={() => handleExport('json')}
                            >
                                Export JSON
                            </Button>
                        </div>
                    }
                />

                {/* Filters */}
                <Card className="mb-6">
                    <CardBody>
                        <h3 className="text-lg font-semibold mb-4">Filters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Action"
                                placeholder="e.g., CREATE_COURSE"
                                value={filters.action}
                                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                            />
                            <Input
                                label="Resource"
                                placeholder="e.g., Course"
                                value={filters.resource}
                                onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
                            />
                            <Select
                                label="Status"
                                placeholder="All Statuses"
                                selectedKeys={filters.status ? [filters.status] : []}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <SelectItem key="success" value="success">
                                    Success
                                </SelectItem>
                                <SelectItem key="failure" value="failure">
                                    Failure
                                </SelectItem>
                            </Select>
                            <Input
                                type="date"
                                label="Start Date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                            <Input
                                type="date"
                                label="End Date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                            <div className="flex items-end gap-2">
                                <Button color="primary" onPress={handleSearch} className="flex-1">
                                    <Icon icon="mdi:magnify" width="20" />
                                    Search
                                </Button>
                                <Button variant="flat" onPress={handleClearFilters}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Logs Table */}
                <Card>
                    <CardBody>
                        <DataTable columns={columns} data={logs} />

                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
                                logs
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="flat"
                                    isDisabled={pagination.page === 1}
                                    onPress={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                >
                                    Previous
                                </Button>
                                <Button
                                    size="sm"
                                    variant="flat"
                                    isDisabled={pagination.page * pagination.limit >= pagination.total}
                                    onPress={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
