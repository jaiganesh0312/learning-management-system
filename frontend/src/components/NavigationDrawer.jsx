import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Button, Avatar, Divider, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from '../context/AuthContext';
import { motion } from "framer-motion";

export default function NavigationDrawer({ isOpen, onClose }) {
    const { user, activeRole, logout } = useAuth();
    const location = useLocation();

    const getNavigationSections = () => {
        if (!activeRole) return [];

        const roleName = activeRole.name;

        // Common sections for all roles
        const commonSections = [
            {
                title: 'Overview',
                items: [
                    { name: 'Dashboard', path: '/dashboard', icon: 'mdi:view-dashboard' },
                ],
            },
        ];

        // Role-specific sections
        const roleSections = {
            learner: [
                {
                    title: 'Learning',
                    items: [
                        { name: 'My Courses', path: '/my-courses', icon: 'mdi:book-open-page-variant' },
                        { name: 'Browse Courses', path: '/courses', icon: 'mdi:magnify' },
                        { name: 'My Certificates', path: '/certificates', icon: 'mdi:certificate' },
                    ],
                },
            ],
            super_admin: [
                {
                    title: 'Administration',
                    items: [
                        { name: 'User Management', path: '/admin/users', icon: 'mdi:account-group' },
                        { name: 'Departments', path: '/admin/departments', icon: 'mdi:office-building' },
                        { name: 'Roles & Permissions', path: '/admin/roles', icon: 'mdi:shield-account' },
                    ],
                },
                {
                    title: 'System',
                    items: [
                        { name: 'Audit Logs', path: '/admin/audit-logs', icon: 'mdi:file-document' },
                        { name: 'System Settings', path: '/admin/settings', icon: 'mdi:cog' },
                    ],
                },
            ],
            content_creator: [
                {
                    title: 'Content Management',
                    items: [
                        { name: 'My Courses', path: '/creator/courses', icon: 'mdi:book-open-page-variant' },
                        { name: 'Create Course', path: '/creator/courses/create', icon: 'mdi:plus-circle' },
                        { name: 'Learning Paths', path: '/creator/learning-paths', icon: 'mdi:map-marker-path' },
                    ],
                },
                {
                    title: 'Analytics',
                    items: [
                        { name: 'Course Analytics', path: '/creator/analytics', icon: 'mdi:chart-line' },
                        { name: 'Enrollment Reports', path: '/creator/reports', icon: 'mdi:file-chart' },
                    ],
                },
            ],
            compliance_officer: [
                {
                    title: 'Compliance',
                    items: [
                        { name: 'Compliance Dashboard', path: '/compliance', icon: 'mdi:shield-check' },
                        { name: 'Training Reports', path: '/compliance/reports', icon: 'mdi:file-chart' },
                        { name: 'Certifications', path: '/compliance/certifications', icon: 'mdi:certificate' },
                    ],
                },
            ],
            department_manager: [
                {
                    title: 'Team Management',
                    items: [
                        { name: 'My Team', path: '/manager/team', icon: 'mdi:account-group' },
                        { name: 'Team Progress', path: '/manager/progress', icon: 'mdi:chart-box' },
                    ],
                },
                {
                    title: 'Learning',
                    items: [
                        { name: 'Learning Paths', path: '/manager/learning-paths', icon: 'mdi:map-marker-path' },
                        { name: 'Assign Training', path: '/manager/assign', icon: 'mdi:account-plus' },
                        { name: 'Reports', path: '/manager/reports', icon: 'mdi:file-chart' },
                    ],
                },
            ],
            auditor: [
                {
                    title: 'Audit & Compliance',
                    items: [
                        { name: 'Audit Logs', path: '/auditor/logs', icon: 'mdi:file-document-edit' },
                        { name: 'Compliance Review', path: '/auditor/compliance', icon: 'mdi:clipboard-check' },
                        { name: 'Access Reports', path: '/auditor/access', icon: 'mdi:account-key' },
                    ],
                },
            ],
        };

        return [...commonSections, ...(roleSections[roleName] || [])];
    };

    const sections = getNavigationSections();

    const isActivePath = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const handleNavigation = () => {
        // Close drawer on mobile after navigation
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    const handleLogout = () => {
        logout();
        onClose();
        window.location.href = '/login';
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            placement="left"
            size="md"
            className="bg-white dark:bg-gray-900"
        >
            <DrawerContent>
                {(onClose) => (
                    <>
                        <DrawerHeader className="flex flex-col gap-3 p-6 border-b border-gray-200 dark:border-gray-800">
                            {/* Close Button */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                        <Icon icon="mdi:school" className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">LMS</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Learning Management</p>
                                    </div>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    onPress={onClose}
                                    className="lg:hidden"
                                >
                                    <Icon icon="mdi:close" className="text-2xl" />
                                </Button>
                            </div>

                            {/* User Info */}
                            {user && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <Avatar
                                        src={user.avatarUrl}
                                        name={`${user.firstName} ${user.lastName}`}
                                        size="md"
                                        isBordered
                                        color="primary"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Active Role Badge */}
                            {activeRole && (
                                <div className="flex items-center justify-between">
                                    <Chip
                                        color="primary"
                                        variant="flat"
                                        size="sm"
                                        className="capitalize"
                                        startContent={<Icon icon="mdi:shield-account" />}
                                    >
                                        {activeRole.displayName}
                                    </Chip>
                                    <Link to="/roles" onClick={handleNavigation}>
                                        <Button
                                            size="sm"
                                            variant="light"
                                            color="primary"
                                            endContent={<Icon icon="mdi:chevron-right" />}
                                        >
                                            Manage Roles
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </DrawerHeader>

                        <DrawerBody className="p-0">
                            <div className="py-4">
                                {sections.map((section, sectionIndex) => (
                                    <div key={sectionIndex} className="mb-6">
                                        <h3 className="px-6 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {section.title}
                                        </h3>
                                        <nav className="space-y-1 px-3">
                                            {section.items.map((item) => {
                                                const isActive = isActivePath(item.path);
                                                return (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        onClick={handleNavigation}
                                                    >
                                                        <motion.div
                                                            whileHover={{ x: 4 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                                }`}
                                                        >
                                                            <Icon
                                                                icon={item.icon}
                                                                className={`text-xl ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}
                                                            />
                                                            <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                                                                {item.name}
                                                            </span>
                                                            {isActive && (
                                                                <div className="ml-auto w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-full" />
                                                            )}
                                                        </motion.div>
                                                    </Link>
                                                );
                                            })}
                                        </nav>
                                    </div>
                                ))}

                                <Divider className="my-4" />

                                {/* Quick Links */}
                                <div className="px-3">
                                    <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Quick Links
                                    </h3>
                                    <nav className="space-y-1">
                                        <Link to="/profile" onClick={handleNavigation}>
                                            <motion.div
                                                whileHover={{ x: 4 }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <Icon icon="mdi:account" className="text-xl" />
                                                <span className="font-medium">My Profile</span>
                                            </motion.div>
                                        </Link>
                                        <Link to="/settings" onClick={handleNavigation}>
                                            <motion.div
                                                whileHover={{ x: 4 }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <Icon icon="mdi:cog" className="text-xl" />
                                                <span className="font-medium">Settings</span>
                                            </motion.div>
                                        </Link>
                                        <Link to="/help" onClick={handleNavigation}>
                                            <motion.div
                                                whileHover={{ x: 4 }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <Icon icon="mdi:help-circle" className="text-xl" />
                                                <span className="font-medium">Help & Support</span>
                                            </motion.div>
                                        </Link>
                                    </nav>
                                </div>
                            </div>
                        </DrawerBody>

                        <DrawerFooter className="p-4 border-t border-gray-200 dark:border-gray-800">
                            <Button
                                color="danger"
                                variant="flat"
                                onPress={handleLogout}
                                className="w-full"
                                startContent={<Icon icon="mdi:logout" className="text-xl" />}
                            >
                                Logout
                            </Button>
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
}
