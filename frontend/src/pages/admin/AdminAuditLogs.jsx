import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Divider, Button, Input, Select, SelectItem, Pagination, Chip, Accordion, AccordionItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';
import { auditLogService } from '@/services';
import { PageHeader, LoadingSpinner } from '@/components/common';
import { format } from 'date-fns';

export default function AdminAuditLogs() {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        action: '',
        resource: '',
        userId: '',
        status: '',
        startDate: '',
        endDate: '',
    });
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, [filters.page]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await auditLogService.getAuditLogs(filters);
            if (response?.data?.success) {
                setLogs(response.data.data.logs || []);
                setPagination(response.data.data.pagination || pagination);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handleApplyFilters = () => {
        fetchLogs();
    };

    const handleClearFilters = () => {
        setFilters({
            page: 1,
            limit: 20,
            action: '',
            resource: '',
            userId: '',
            status: '',
            startDate: '',
            endDate: '',
        });
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleExport = async (format) => {
        try {
            setExporting(true);
            const exportParams = { ...filters, format };
            const response = await auditLogService.exportAuditLogs(exportParams);

            if (format === 'csv') {
                // Handle CSV blob download
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `audit-logs-${Date.now()}.csv`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } else {
                // Handle JSON download
                const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `audit-logs-${Date.now()}.json`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting logs:', error);
        } finally {
            setExporting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'success';
            case 'failure': return 'danger';
            case 'error': return 'warning';
            default: return 'default';
        }
    };

    if (loading && logs.length === 0) return <LoadingSpinner fullPage />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <PageHeader
                    title="Audit Logs"
                    description="Monitor system activity and user actions"
                    icon="mdi:file-document-multiple"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Admin', href: '/admin/audit-logs' },
                        { label: 'Audit Logs' }
                    ]}
                />

                {/* Filter Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card className="border border-gray-200 dark:border-gray-800 mb-6">
                        <CardHeader className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:filter" className="text-xl text-gray-600 dark:text-gray-400" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Date Range */}
                                <Input
                                    type="date"
                                    label="Start Date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    variant="bordered"
                                />
                                <Input
                                    type="date"
                                    label="End Date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    variant="bordered"
                                />

                                {/* Action Filter */}
                                <Input
                                    label="Action"
                                    placeholder="e.g., CREATE_COURSE, LOGIN"
                                    value={filters.action}
                                    onChange={(e) => handleFilterChange('action', e.target.value)}
                                    variant="bordered"
                                    startContent={<Icon icon="mdi:lightning-bolt" className="text-gray-400" />}
                                />

                                {/* Resource Filter */}
                                <Input
                                    label="Resource"
                                    placeholder="e.g., Course, User"
                                    value={filters.resource}
                                    onChange={(e) => handleFilterChange('resource', e.target.value)}
                                    variant="bordered"
                                    startContent={<Icon icon="mdi:folder" className="text-gray-400" />}
                                />

                                {/* Status Filter */}
                                <Select
                                    label="Status"
                                    placeholder="Select status"
                                    selectedKeys={filters.status ? [filters.status] : []}
                                    onSelectionChange={(keys) => handleFilterChange('status', Array.from(keys)[0] || '')}
                                    variant="bordered"
                                >
                                    <SelectItem key="success">Success</SelectItem>
                                    <SelectItem key="failure">Failure</SelectItem>
                                    <SelectItem key="error">Error</SelectItem>
                                </Select>

                                {/* User ID Filter */}
                                <Input
                                    label="User ID"
                                    placeholder="Filter by user UUID"
                                    value={filters.userId}
                                    onChange={(e) => handleFilterChange('userId', e.target.value)}
                                    variant="bordered"
                                    startContent={<Icon icon="mdi:account" className="text-gray-400" />}
                                />
                            </div>

                            <div className="flex gap-3 mt-4">
                                <Button
                                    color="primary"
                                    onClick={handleApplyFilters}
                                    startContent={<Icon icon="mdi:magnify" />}
                                >
                                    Apply Filters
                                </Button>
                                <Button
                                    variant="flat"
                                    onClick={handleClearFilters}
                                    startContent={<Icon icon="mdi:close" />}
                                >
                                    Clear
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Export Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex gap-3 mb-6"
                >
                    <Button
                        color="success"
                        variant="flat"
                        onClick={() => handleExport('csv')}
                        isLoading={exporting}
                        startContent={<Icon icon="mdi:file-delimited" />}
                    >
                        Export to CSV
                    </Button>
                    <Button
                        color="secondary"
                        variant="flat"
                        onClick={() => handleExport('json')}
                        isLoading={exporting}
                        startContent={<Icon icon="mdi:code-json" />}
                    >
                        Export to JSON
                    </Button>
                </motion.div>

                {/* Audit Logs Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardHeader className="px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Logs</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {logs.length} of {pagination.total} logs
                                </p>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody className="p-0">
                            {loading ? (
                                <div className="p-8 flex justify-center">
                                    <LoadingSpinner />
                                </div>
                            ) : logs.length > 0 ? (
                                <Accordion variant="splitted" className="px-4">
                                    {logs.map((log) => (
                                        <AccordionItem
                                            key={log.id}
                                            title={
                                                <div className="flex items-center justify-between w-full pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <Chip color={getStatusColor(log.status)} size="sm" variant="flat">
                                                            {log.status}
                                                        </Chip>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {log.action}
                                                        </span>
                                                        <span className="text-gray-600 dark:text-gray-400">-</span>
                                                        <span className="text-gray-600 dark:text-gray-400">{log.resource}</span>
                                                    </div>
                                                    <span className="text-sm text-gray-500 dark:text-gray-500">
                                                        {format(new Date(log.createdAt), 'MMM dd, HH:mm')}
                                                    </span>
                                                </div>
                                            }
                                        >
                                            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">User</p>
                                                        <p className="text-sm text-gray-900 dark:text-white">
                                                            {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            {log.user?.email || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">Role</p>
                                                        <p className="text-sm text-gray-900 dark:text-white">
                                                            {log.role?.displayName || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">Resource ID</p>
                                                        <p className="text-xs text-gray-900 dark:text-white font-mono">
                                                            {log.resourceId || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">IP Address</p>
                                                        <p className="text-sm text-gray-900 dark:text-white">
                                                            {log.ipAddress || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">User Agent</p>
                                                        <p className="text-xs text-gray-900 dark:text-white truncate">
                                                            {log.userAgent || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">Timestamp</p>
                                                        <p className="text-sm text-gray-900 dark:text-white">
                                                            {format(new Date(log.createdAt), 'MMMM dd, yyyy HH:mm:ss')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="p-8 text-center">
                                    <Icon icon="mdi:inbox" className="text-6xl text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600 dark:text-gray-400">No audit logs found</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">Try adjusting your filters</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                        <Pagination
                            total={pagination.totalPages}
                            page={pagination.page}
                            onChange={handlePageChange}
                            showControls
                            color="primary"
                        />
                    </div>
                )}
            </motion.div>
        </div>
    );
}
