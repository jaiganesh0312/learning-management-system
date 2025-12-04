import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';
import { roleService } from '@/services';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

export default function RoleManagementPage() {
    const { user, activeRole, switchRole } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [switchingRole, setSwitchingRole] = useState(null);
    const [error, setError] = useState(null);
    const [expandedRole, setExpandedRole] = useState(null);
    const [roles, setRoles] = useState([]);

    // Fetch user roles from API
    useEffect(() => {
        const fetchRoles = async () => {
            if (!user?.id) return;

            setLoading(true);
            try {
                const response = await roleService.getUserRoles(user.id);
                if (response?.data?.success) {
                    // Extract roles from UserRole objects
                    const userRoles = response.data.data.map(ur => ur.role);
                    setRoles(userRoles);
                }
            } catch (err) {
                console.error('Error fetching roles:', err);
                setError('Failed to load roles');
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, [user?.id]);

    const getRoleIcon = (roleName) => {
        const icons = {
            learner: 'mdi:school',
            super_admin: 'mdi:shield-crown',
            content_creator: 'mdi:book-edit',
            compliance_officer: 'mdi:shield-check',
            department_manager: 'mdi:account-group',
            auditor: 'mdi:file-document-edit',
        };
        return icons[roleName] || 'mdi:account-circle';
    };

    const getRoleColor = (roleName) => {
        const colors = {
            learner: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-400', border: 'border-green-300 dark:border-green-700' },
            super_admin: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-700' },
            content_creator: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700' },
            compliance_officer: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-700' },
            department_manager: { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-300 dark:border-indigo-700' },
            auditor: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-300 dark:border-yellow-700' },
        };
        return colors[roleName] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-700' };
    };

    const handleSwitchRole = async (role) => {
        if (role.id === activeRole?.id) {
            return; // Already active
        }

        setSwitchingRole(role.id);
        setError(null);

        try {
            // Call API to switch role
            const response = await roleService.switchActiveRole({ roleId: role.id });
            console.log(response);

            if (response?.data?.success) {
                // Update AuthContext with the new user data from API
                switchRole(response.data.data.user.activeRole);

                // Short delay for smooth transition
                await new Promise(resolve => setTimeout(resolve, 500));

                // Navigate to dashboard
                navigate('/dashboard');
            } else {
                setError(response?.data?.message || 'Failed to switch role');
            }
        } catch (err) {
            console.error('Role switch error:', err);
            setError(err.response?.data?.message || 'An error occurred while switching roles');
            console.log(error);
        } finally {
            setSwitchingRole(null);
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Role Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View and switch between your assigned roles
                    </p>
                </motion.div>

                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
                    >
                        <Icon icon="mdi:alert-circle" className="text-xl text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => setError(null)}
                        >
                            <Icon icon="mdi:close" className="text-red-600 dark:text-red-400" />
                        </Button>
                    </motion.div>
                )}

                {/* Current Role Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Current Active Role
                    </h2>
                    {activeRole && (
                        <Card className="border-2 border-blue-500 dark:border-blue-500">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-2xl ${getRoleColor(activeRole.name).bg} flex items-center justify-center`}>
                                        <Icon icon={getRoleIcon(activeRole.name)} className={`text-3xl ${getRoleColor(activeRole.name).text}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                                                {activeRole.displayName}
                                            </h3>
                                            <Chip color="success" size="sm" variant="flat">Active</Chip>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {activeRole.description || 'Currently active role'}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </motion.div>

                {/* Available Roles */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Available Roles ({roles.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {roles.map((role, index) => {
                            const isActive = role.id === activeRole?.id;
                            const isExpanded = expandedRole === role.id;
                            const isSwitching = switchingRole === role.id;
                            const roleColor = getRoleColor(role.name);

                            return (
                                <motion.div
                                    key={role.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className={`border-2 ${isActive ? 'border-blue-500' : 'border-gray-200 dark:border-gray-800'}`}>
                                        <CardHeader className="flex flex-col gap-3 p-6">
                                            <div className="flex items-start justify-between w-full">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={`w-14 h-14 rounded-xl ${roleColor.bg} flex items-center justify-center`}>
                                                        <Icon icon={getRoleIcon(role.name)} className={`text-2xl ${roleColor.text}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                                                {role.displayName}
                                                            </h3>
                                                            {isActive && (
                                                                <Chip color="success" size="sm" variant="flat">Active</Chip>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {role.description || 'Access dashboards and features'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 w-full">
                                                {!isActive && (
                                                    <Button
                                                        color="primary"
                                                        variant="flat"
                                                        onPress={() => handleSwitchRole(role)}
                                                        isLoading={isSwitching}
                                                        isDisabled={switchingRole !== null && !isSwitching}
                                                        startContent={!isSwitching && <Icon icon="mdi:swap-horizontal" />}
                                                        className="flex-1"
                                                    >
                                                        {isSwitching ? 'Switching...' : 'Switch to this role'}
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="light"
                                                    onPress={() => setExpandedRole(isExpanded ? null : role.id)}
                                                    endContent={
                                                        <Icon
                                                            icon={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                                                            className="text-xl"
                                                        />
                                                    }
                                                    className={isActive ? 'flex-1' : ''}
                                                >
                                                    {isExpanded ? 'Hide' : 'View'} Permissions
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        {/* Permissions Section */}
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <Divider />
                                                <CardBody className="p-6">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                        Permissions ({role.permissions?.length || 0})
                                                    </h4>
                                                    {role.permissions && role.permissions.length > 0 ? (
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {role.permissions.map((permission, permIndex) => (
                                                                <div
                                                                    key={permIndex}
                                                                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                                                >
                                                                    <Icon
                                                                        icon="mdi:check-circle"
                                                                        className="text-green-600 dark:text-green-400"
                                                                    />
                                                                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                                                        {permission.replace(/_/g, ' ')}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                            No specific permissions defined for this role
                                                        </p>
                                                    )}
                                                </CardBody>
                                            </motion.div>
                                        )}
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <CardBody className="p-6">
                            <div className="flex items-start gap-3">
                                <Icon icon="mdi:information" className="text-2xl text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                        About Role Switching
                                    </h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Switching roles will change your dashboard and available features. Your progress and data remain safe across all roles.
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
