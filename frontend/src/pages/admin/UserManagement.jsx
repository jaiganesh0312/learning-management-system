import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { userService, roleService, departmentService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable } from '@/components/common';

export default function UserManagement() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [selectedUserForDept, setSelectedUserForDept] = useState(null);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedUserForRole, setSelectedUserForRole] = useState(null);
    const [selectedRoleToAdd, setSelectedRoleToAdd] = useState("");
    const [selectedRoleToRevoke, setSelectedRoleToRevoke] = useState("");

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
        } catch (error) {
            console.error('Error assigning role:', error);
        } finally {
            setLoading(false);
        }
    };



    const openRoleModal = (rowUser) => {
        const user = users.find(u => u.id === rowUser.id);
        setSelectedUserForRole(user);
        setSelectedRoleToAdd("");
        setSelectedRoleToRevoke("");
        setIsRoleModalOpen(true);
    };

    const handleAddRole = async () => {
        if (!selectedUserForRole || !selectedRoleToAdd) return;
        try {
            const response = await roleService.assignRole({
                userId: selectedUserForRole.id,
                roleId: selectedRoleToAdd
            });
            if (response?.data?.success) {
                fetchData();
                setSelectedRoleToAdd("");
                // Refresh the selected user's roles in the modal
                const updatedUser = { ...selectedUserForRole };
                // We might need to re-fetch the specific user or just close the modal
                // For simplicity, let's close the modal and let the main list refresh
                setIsRoleModalOpen(false);
            }
        } catch (error) {
            console.error('Error assigning role:', error);
        }
    };

    const handleRevokeRole = async () => {
        if (!selectedUserForRole || !selectedRoleToRevoke) return;
        try {
            const response = await roleService.revokeRole({
                userId: selectedUserForRole.id,
                roleId: selectedRoleToRevoke
            });
            if (response?.data?.success) {
                fetchData();
                setSelectedRoleToRevoke("");
                // Refresh the selected user's roles in the modal
                // We need to update the selectedUserForRole state to reflect the change immediately in the modal
                // Since we fetched fresh data, we can find the updated user from the 'users' list (which will be updated by fetchData)
                // However, fetchData is async and might not have finished yet. 
                // A better approach for the modal is to locally update the state or wait for fetch.
                // For now, let's close the modal to be safe and simple, or we can try to update local state.
                // Let's close it as per previous logic, or keep it open and rely on the fact that we need to re-select the user.
                // Actually, let's just close it to ensure consistency.
                setIsRoleModalOpen(false);
            }
        } catch (error) {
            console.error('Error revoking role:', error);
        }
    };

    const openDeptModal = (user) => {
        setSelectedUserForDept(user);
        setSelectedDepartmentId(user.department?.id || "");
        setIsDeptModalOpen(true);
    };

    const handleAssignDepartment = async () => {
        if (!selectedDepartmentId || !selectedUserForDept) return;
        try {
            const response = await departmentService.assignUserToDepartment(selectedDepartmentId, { userId: selectedUserForDept.id });
            if (response?.data?.success) {
                fetchData();
                setIsDeptModalOpen(false);
            }
        } catch (error) {
            console.error('Error assigning department:', error);
        }
    };

    const handleRemoveDepartment = async () => {
        if (!selectedUserForDept?.department?.id) return;
        try {
            const response = await departmentService.removeUserFromDepartment(selectedUserForDept.department.id, selectedUserForDept.id);
            if (response?.data?.success) {
                fetchData();
                setIsDeptModalOpen(false);
            }
        } catch (error) {
            console.error('Error removing department:', error);
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'roles', label: 'Roles' },
        { key: 'department', label: 'Department' },
        { key: 'status', label: 'Status' },
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
        department: user.department?.name || 'N/A',
        status: (
            <Chip size="sm" color={user.isActive ? "success" : "danger"} variant="flat">
                {user.isActive ? 'Active' : 'Inactive'}
            </Chip>
        )
    }));

    const rowActions = [
        {
            isDropdown: true,
            items: [
                {
                    label: 'View Details',
                    icon: 'mdi:eye',
                    onClick: (user) => {
                        setSelectedUser(users.find(u => u.id === user.id));
                        onOpen();
                    }
                },
                {
                    label: 'Manage Roles',
                    icon: 'mdi:account-cog',
                    onClick: (user) => openRoleModal(user)
                },
                {
                    label: 'Manage Department',
                    icon: 'mdi:domain',
                    onClick: (user) => openDeptModal(user)
                },
                {
                    label: 'Edit User',
                    icon: 'mdi:pencil',
                    onClick: (user) => console.log('Edit user:', user)
                },
                {
                    label: 'Delete User',
                    icon: 'mdi:delete',
                    color: 'danger',
                    onClick: (user) => console.log('Delete user:', user)
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
                <PageHeader
                    title="User Management"
                    description="Manage users, roles, and permissions"
                    icon="mdi:account-multiple"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Admin', href: '/admin/users' },
                        { label: 'Users' }
                    ]}
                    actions={[
                        {
                            label: 'Add User',
                            icon: 'mdi:plus',
                            color: 'primary',
                            onClick: () => console.log('Add user')
                        }
                    ]}
                />

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
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Users</p>
                                    <p className="text-3xl font-bold text-green-600">{users.filter(u => u.isActive).length}</p>
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

                {/* User Details Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                    <ModalContent>
                        <ModalHeader>User Details</ModalHeader>
                        <ModalBody>
                            {selectedUser && (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                                        <p className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                        <p className="font-semibold">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Roles</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {selectedUser?.userRoles?.map(ur => (
                                                <Chip key={ur.roleId} color="primary" variant="flat">
                                                    {ur.role?.name}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>Close</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Department Management Modal */}
                <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)}>
                    <ModalContent>
                        <ModalHeader>Manage Department</ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <p>Assign <strong>{selectedUserForDept?.firstName} {selectedUserForDept?.lastName}</strong> to a department.</p>
                                <Select
                                    label="Department"
                                    placeholder="Select a department"
                                    selectedKeys={selectedDepartmentId ? [selectedDepartmentId] : []}
                                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                                >
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            {selectedUserForDept?.department && (
                                <Button color="danger" variant="flat" onPress={handleRemoveDepartment}>
                                    Remove from Department
                                </Button>
                            )}
                            <Button color="primary" onPress={handleAssignDepartment}>
                                Assign Department
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Role Management Modal */}
                <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)}>
                    <ModalContent>
                        <ModalHeader>Manage Roles - {selectedUserForRole?.firstName} {selectedUserForRole?.lastName}</ModalHeader>
                        <ModalBody>
                            <div className="space-y-6">
                                {/* Assign Role Section */}
                                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <p className="text-sm font-medium mb-3 text-primary">Assign New Role</p>
                                    {roles.filter(role => !selectedUserForRole?.userRoles?.some(ur => ur.roleId === role.id)).length > 0 ? (
                                        <div className="flex gap-2">
                                            <Select
                                                placeholder="Select role to assign"
                                                selectedKeys={selectedRoleToAdd ? [selectedRoleToAdd] : []}
                                                onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                                                className="flex-1"
                                            >
                                                {roles
                                                    .filter(role => !selectedUserForRole?.userRoles?.some(ur => ur.roleId === role.id))
                                                    .map((role) => (
                                                        <SelectItem key={role.id} value={role.id}>
                                                            {role.name}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </Select>
                                            <Button
                                                color="primary"
                                                onPress={handleAddRole}
                                                isDisabled={!selectedRoleToAdd}
                                            >
                                                Assign
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">All available roles are already assigned to this user.</p>
                                    )}
                                </div>

                                {/* Revoke Role Section */}
                                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <p className="text-sm font-medium mb-3 text-danger">Revoke Role</p>
                                    {selectedUserForRole?.userRoles?.length > 0 ? (
                                        <div className="flex gap-2">
                                            <Select
                                                placeholder="Select role to revoke"
                                                selectedKeys={selectedRoleToRevoke ? [selectedRoleToRevoke] : []}
                                                onChange={(e) => setSelectedRoleToRevoke(e.target.value)}
                                                className="flex-1"
                                            >
                                                {selectedUserForRole.userRoles.map((ur) => (
                                                    <SelectItem key={ur.roleId} value={ur.roleId}>
                                                        {ur.role?.name}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                            <Button
                                                color="danger"
                                                variant="flat"
                                                onPress={handleRevokeRole}
                                                isDisabled={!selectedRoleToRevoke}
                                            >
                                                Revoke
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No roles assigned to revoke.</p>
                                    )}
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={() => setIsRoleModalOpen(false)}>
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
}
