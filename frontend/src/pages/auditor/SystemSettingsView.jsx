import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Divider, Chip, Accordion, AccordionItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { roleService } from '@/services';
import { PageHeader, LoadingSpinner } from '@/components/common';

export default function SystemSettingsView() {
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        fetchSystemSettings();
    }, []);

    const fetchSystemSettings = async () => {
        try {
            setLoading(true);
            // Fetch all roles and their permissions
            const response = await roleService.getAllRolesWithPermissions();
            if (response?.data?.success) {
                setRoles(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching system settings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullPage />;

    // System Info (hardcoded for now since no backend endpoint)
    const systemInfo = {
        version: '1.0.0',
        environment: 'Production',
        deployedDate: new Date().toLocaleDateString(),
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="System Settings"
                    description="View system configuration - Read-Only Access"
                    icon="mdi:cog-outline"
                />

                {/* Read-Only Warning */}
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
                    <Icon icon="mdi:shield-lock" className="text-amber-600 text-2xl flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Read-Only Mode</h4>
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            You have view-only access to system settings. You cannot make any modifications to the system configuration.
                        </p>
                    </div>
                </div>

                {/* System Information */}
                <Card className="border border-gray-200 dark:border-gray-800 mb-6">
                    <CardHeader className="px-6 py-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Information</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">General system details</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon icon="mdi:information" className="text-blue-600 text-xl" />
                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Version</p>
                                </div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{systemInfo.version}</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon icon="mdi:server" className="text-green-600 text-xl" />
                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Environment</p>
                                </div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{systemInfo.environment}</p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon icon="mdi:calendar" className="text-purple-600 text-xl" />
                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Deployed</p>
                                </div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{systemInfo.deployedDate}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Roles and Permissions */}
                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardHeader className="px-6 py-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Roles & Permissions</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">System roles and their assigned permissions</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="p-6">
                        {roles.length > 0 ? (
                            <Accordion variant="splitted">
                                {roles.map((role) => (
                                    <AccordionItem
                                        key={role.id}
                                        title={
                                            <div className="flex items-center justify-between w-full pr-4">
                                                <div className="flex items-center gap-3">
                                                    <Icon icon="mdi:shield-account" className="text-blue-600 text-xl" />
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            {role.displayName || role.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {role.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={role.isActive ? 'success' : 'default'}
                                                >
                                                    {role.isActive ? 'Active' : 'Inactive'}
                                                </Chip>
                                            </div>
                                        }
                                    >
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Permissions:</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {role.RolePermissions && role.RolePermissions.length > 0 ? (
                                                    role.RolePermissions.map((rolePermission) => (
                                                        <div
                                                            key={rolePermission.Permission.id}
                                                            className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                                                        >
                                                            <Icon icon="mdi:check-circle" className="text-green-600 text-sm" />
                                                            <span className="text-xs text-gray-900 dark:text-white font-medium">
                                                                {rolePermission.Permission.name}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 col-span-3">No permissions assigned</p>
                                                )}
                                            </div>
                                        </div>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center py-8">
                                <Icon icon="mdi:shield-off" className="text-4xl text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 dark:text-gray-400">No roles found</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* System Configuration */}
                <Card className="border border-gray-200 dark:border-gray-800 mt-6">
                    <CardHeader className="px-6 py-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Configuration</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Audit log retention and system settings</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Audit Log Retention</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Number of days audit logs are stored</p>
                                </div>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">365 days</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Audit Log Status</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Current status of audit logging</p>
                                </div>
                                <Chip color="success" variant="flat">Enabled</Chip>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Real-time Monitoring</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">System activity monitoring status</p>
                                </div>
                                <Chip color="success" variant="flat">Active</Chip>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
