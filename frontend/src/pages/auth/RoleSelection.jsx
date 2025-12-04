import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';
import { roleService } from '@/services';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function RoleSelection() {
    const { user, switchRole } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    const [activeRole, setActiveRole] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchingRoles, setFetchingRoles] = useState(true);
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState(null);

    // Fetch user roles from API
    useEffect(() => {
        const fetchRoles = async () => {
            if (!user?.id) return;

            setFetchingRoles(true);
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
                setFetchingRoles(false);
            }
        };

        const fetchActiveRole = async () => {
            if (!user?.id) return;

            try {
                const response = await roleService.getMyActiveRole();
                if (response?.data?.success) {
                    setActiveRole(response.data.data.activeRole);
                }
            } catch (err) {
                console.error('Error fetching active role:', err);
                setError('Failed to load active role');
            }
        };

        fetchRoles();
    }, [user?.id, navigate]);

    const handleRoleSelect = async (role) => {
        setSelectedRole(role.id);
        setIsLoading(true);
        setError(null);

        try {
            // Call API to switch role
            const response = await roleService.switchActiveRole({ roleId: role.id });

            if (response?.data?.success) {
                // Update AuthContext with the new user data from API
                switchRole(response.data.data.user.activeRole);

                // Short delay for smooth transition
                await new Promise(resolve => setTimeout(resolve, 500));

                // Navigate to dashboard
                navigate('/dashboard');
            } else {
                setError(response?.data?.message || 'Failed to switch role');
                setIsLoading(false);
                setSelectedRole(null);
            }
        } catch (err) {
            console.error('Error switching role:', err);
            setError(err.response?.data?.message || 'An error occurred while switching roles');
            setIsLoading(false);
            setSelectedRole(null);
        }
    };

    if (fetchingRoles) {
        return <LoadingSpinner fullPage />;
    }

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
            learner: 'from-green-500 to-emerald-600',
            super_admin: 'from-purple-500 to-pink-600',
            content_creator: 'from-blue-500 to-cyan-600',
            compliance_officer: 'from-orange-500 to-red-600',
            department_manager: 'from-indigo-500 to-blue-600',
            auditor: 'from-yellow-500 to-amber-600',
        };
        return colors[roleName] || 'from-gray-500 to-gray-600';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl"
            >
                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardBody className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                                    <Icon icon="mdi:account-switch" className="text-4xl text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Select Your Role
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Choose which role you want to use for this session
                            </p>
                        </div>

                        {error && (
                            <div className="col-span-full mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Roles Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {roles.map((role) => (
                                <motion.button
                                    key={role.id}
                                    onClick={() => handleRoleSelect(role)}
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative p-6 rounded-xl border-2 transition-all ${selectedRole === role.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    {role.id === activeRole?.id && (
                                        <div className="absolute top-3 right-3">
                                            <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded text-xs font-semibold text-green-700 dark:text-green-400">
                                                Current
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center text-center">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getRoleColor(role.name)} flex items-center justify-center mb-4`}>
                                            <Icon icon={getRoleIcon(role.name)} className="text-3xl text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 capitalize">
                                            {role.displayName}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {role.description || 'Access your dashboard and features'}
                                        </p>
                                    </div>

                                    {selectedRole === role.id && isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-xl">
                                            <Icon icon="mdi:loading" className="text-3xl text-blue-600 animate-spin" />
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        {/* Skip Button */}
                        {activeRole && (
                            <div className="text-center">
                                <Button
                                    variant="light"
                                    onPress={() => navigate('/dashboard')}
                                    startContent={<Icon icon="mdi:arrow-right" />}
                                    disabled={isLoading}
                                >
                                    Continue with current role ({activeRole?.displayName})
                                </Button>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </motion.div>
        </div>
    );
}
