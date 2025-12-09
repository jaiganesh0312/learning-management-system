import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Chip } from "@heroui/react";
import UserRoleModal from "@/components/admin/UserRoleModal";
import UserDepartmentModal from "@/components/admin/UserDepartmentModal";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { userService, roleService, departmentService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable } from '@/components/common';

export default function UserManagement() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [selectedUserForDept, setSelectedUserForDept] = useState(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedUserForRole, setSelectedUserForRole] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, rolesRes, deptsRes] = await Promise.all([
                roleService.getAllUsersWithRoles(),
                roleService.getAllRoles(),
                departmentService.getAllDepartments()
            ]);

            if (usersRes?.data?.success) setUsers(usersRes.data.data.users);
            if (rolesRes?.data?.success) setRoles(rolesRes.data.data);
            if (deptsRes?.data?.success) setDepartments(deptsRes.data.data);
        } catch (error) {
            console.error('Error assigning role:', error);
        } finally {
            setLoading(false);
        }
    };



    const openRoleModal = (rowUser) => {
        const user = users.find(u => u.id === rowUser.id);
        setSelectedUserForRole(user);
        setIsRoleModalOpen(true);
    };

    const openDeptModal = (user) => {
        setSelectedUserForDept(user);
        setIsDeptModalOpen(true);
    };





    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'roles', label: 'Roles' },
        { key: 'department', label: 'Department' },
        { key: 'actions', label: 'Actions' }
    ];

    const tableData = users.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        roles: (
            <div className="flex gap-1 flex-wrap">
                {user.userRoles?.map(ur => (
                    <Chip key={ur.roleId} size="sm" color="primary" variant="flat">
                        {ur.role?.name}
                    </Chip>
                ))}
            </div>
        ),
        departmentId: user.department?.id,
        departmentName: user.department?.name,
        department: user.department?.name || 'N/A',
    }));

    const rowActions = [
        {
            isDropdown: true,
            items: [
                {
                    label: 'Manage Roles',
                    icon: 'mdi:account-cog',
                    onClick: (user) => openRoleModal(user)
                },
                {
                    label: 'Manage Department',
                    icon: 'mdi:domain',
                    onClick: (user) => openDeptModal(user)
                }
            ]
        }
    ];

    if (loading) {
        return <LoadingSpinner fullPage />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon icon="mdi:account-multiple" className="text-2xl text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                User Management
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage users and their roles and departments
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:account-group" className="text-2xl text-blue-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verified Users</p>
                                    <p className="text-3xl font-bold text-green-600">{users.filter(u => u.isEmailVerified).length}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:account-check" className="text-2xl text-green-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>



                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Roles</p>
                                    <p className="text-3xl font-bold text-purple-600">{roles.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:shield-account" className="text-2xl text-purple-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Departments</p>
                                    <p className="text-3xl font-bold text-orange-600">{departments.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:office-building" className="text-2xl text-orange-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* User Table */}
                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardBody className="p-6">
                        <DataTable
                            data={tableData}
                            columns={columns}
                            searchPlaceholder="Search users..."
                            searchKeys={['name', 'email']}
                            rowActions={rowActions}
                        />
                    </CardBody>
                </Card>



                <UserDepartmentModal
                    isOpen={isDeptModalOpen}
                    onClose={() => setIsDeptModalOpen(false)}
                    user={selectedUserForDept}
                    departments={departments}
                    onUpdate={fetchData}
                />

                <UserRoleModal
                    isOpen={isRoleModalOpen}
                    onClose={() => setIsRoleModalOpen(false)}
                    user={selectedUserForRole}
                    roles={roles}
                    onUpdate={fetchData}
                />
            </div>
        </div>
    );
}
