import React, { useEffect, useState } from 'react';
import { roleService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable } from '@/components/common';
import { Card, CardBody, Button, Input, Chip, addToast } from '@heroui/react';
import { Icon } from '@iconify/react'; import { useNavigate } from 'react-router-dom';

export default function UserAccessManager() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, search]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await roleService.getAllUsersWithRoles({
                page: pagination.page,
                limit: pagination.limit,
                search,
            });

            if (response?.data?.success) {
                setUsers(response.data.data.users);
                setPagination({
                    ...pagination,
                    total: response.data.data.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            addToast({ title: "Error!", description: 'Failed to load users', color: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const exportUsers = () => {
        // Generate CSV
        const headers = ['Name', 'Email', 'Department', 'Roles', 'Created At'];
        const rows = users.map((user) => [
            `${user.firstName} ${user.lastName}`,
            user.email,
            user.department?.name || 'N/A',
            user.userRoles?.map((ur) => ur.role?.displayName).join('; ') || 'None',
            new Date(user.createdAt).toLocaleDateString(),
        ]);

        const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        addToast({ title: "Success!", description: 'Users exported successfully', color: 'success' });
    };

    const columns = [
        {
            key: 'user',
            label: 'USER',
            render: (user) => (
                <div>
                    <p className="font-medium">
                        {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
            ),
        },
        {
            key: 'department',
            label: 'DEPARTMENT',
            render: (user) => (
                <span>{user.department?.name || <span className="text-gray-400">No Department</span>}</span>
            ),
        },
        {
            key: 'roles',
            label: 'ROLES',
            render: (user) => (
                <div className="flex gap-1 flex-wrap">
                    {user.userRoles?.length > 0 ? (
                        user.userRoles.map((ur) => (
                            <Chip key={ur.id} size="sm" variant="flat" color="primary">
                                {ur.role?.displayName}
                            </Chip>
                        ))
                    ) : (
                        <Chip size="sm" variant="flat" color="default">
                            No Roles
                        </Chip>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (user) => (
                <Chip size="sm" variant="flat" color={user.isActive ? 'success' : 'default'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                </Chip>
            ),
        },
        {
            key: 'createdAt',
            label: 'JOINED',
            render: (user) => <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>,
        },
    ];

    if (loading && users.length === 0) return <LoadingSpinner fullPage />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="User Access Management"
                    description="View and manage all users in the system"
                    icon="mdi:account-group"
                    action={
                        <Button
                            color="primary"
                            variant="flat"
                            startContent={<Icon icon="mdi:download" width="20" />}
                            onPress={exportUsers}
                        >
                            Export Users
                        </Button>
                    }
                />

                <Card className="mb-6">
                    <CardBody>
                        <div className="flex gap-4">
                            <Input
                                className="flex-1"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                startContent={<Icon icon="mdi:magnify" width="20" />}
                            />
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Total Users: <strong>{pagination.total}</strong>
                            </p>
                        </div>

                        <DataTable columns={columns} data={users} />

                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
                                users
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
