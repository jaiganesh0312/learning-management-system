import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Textarea, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';
import { departmentService, roleService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable, ConfirmModal } from '@/components/common';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
const departmentSchema = z.object({
    name: z.string()
        .min(2, "Department name must be at least 2 characters")
        .max(100, "Department name must not exceed 100 characters"),
    description: z.string()
        .max(500, "Description must not exceed 500 characters")
        .optional()
        .or(z.literal('')),
    parentDepartmentId: z.string().optional().nullable(),
    managerId: z.string().optional().nullable()
});

export default function DepartmentManagement() {
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingId, setEditingId] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deptToDelete, setDeptToDelete] = useState(null);

    const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            name: '',
            description: '',
            parentDepartmentId: null,
            managerId: null
        }
    });

    const description = watch('description');
    const descriptionLength = description?.length || 0;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptResponse, usersResponse] = await Promise.all([
                departmentService.getAllDepartments(),
                roleService.getAllUsersWithSpecificRoles(['department_manager'])
            ]);

            if (deptResponse?.data?.success) {
                setDepartments(deptResponse.data.data);
            }
            if (usersResponse?.data?.success) {
                setUsers(usersResponse.data.data.users);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (editingId) {
                await departmentService.updateDepartment(editingId, data);
            } else {
                await departmentService.createDepartment(data);
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving department:', error);
        }
    };

    const handleEdit = (dept) => {
        reset({
            name: dept.name,
            description: dept.description || '',
            parentDepartmentId: dept.parentDepartmentId ? String(dept.parentDepartmentId) : null,
            managerId: dept.managerId ? String(dept.managerId) : null
        });
        setEditingId(dept.id);
        onOpen();
    };

    const handleCloseModal = () => {
        onClose();
        reset({ name: '', description: '', parentDepartmentId: null, managerId: null });
        setEditingId(null);
    };

    const handleDelete = (id) => {
        setDeptToDelete(id);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!deptToDelete) return;

        try {
            await departmentService.deleteDepartment(deptToDelete);
            fetchData();
        } catch (error) {
            console.error('Error deleting department:', error);
        } finally {
            setShowConfirmModal(false);
            setDeptToDelete(null);
        }
    };

    const columns = [
        { key: 'name', label: 'Department Name' },
        { key: 'members', label: 'Members' },
        { key: 'description', label: 'Description' },
        { key: 'actions', label: 'Actions' }
    ];

    const tableData = departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        members: dept.users?.length || 0,
        description: dept.description || 'N/A'
    }));

    const rowActions = [
        {
            label: 'Edit',
            icon: 'mdi:pencil',
            variant: 'light',
            onClick: handleEdit
        },
        {
            label: 'Delete',
            icon: 'mdi:delete',
            variant: 'light',
            color: 'danger',
            onClick: (dept) => handleDelete(dept.id)
        }
    ];

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
                    title="Department Management"
                    description="Manage organizational departments"
                    icon="mdi:office-building"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Admin', href: '/admin/departments' },
                        { label: 'Departments' }
                    ]}
                    actions={[
                        {
                            label: 'Add Department',
                            icon: 'mdi:plus',
                            color: 'primary',
                            onClick: onOpen
                        }
                    ]}
                />

                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardBody className="p-6">
                        <DataTable
                            data={tableData}
                            columns={columns}
                            searchPlaceholder="Search departments..."
                            searchKeys={['name', 'description']}
                            rowActions={rowActions}
                        />
                    </CardBody>
                </Card>

                {/* Create/Edit Modal */}
                <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
                    <ModalContent>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:office-building" className="text-2xl text-primary" />
                                    <span>{editingId ? 'Edit' : 'Add'} Department</span>
                                </div>
                                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    {editingId ? 'Update department information' : 'Create a new department'}
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                isRequired
                                                label="Department Name"
                                                placeholder="e.g., Information Technology"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:office-building-outline" className="text-gray-400" />}
                                                isInvalid={!!errors.name}
                                                errorMessage={errors.name?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            />
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="parentDepartmentId"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    label="Parent Department"
                                                    placeholder="Select parent department"
                                                    variant="bordered"
                                                    labelPlacement="outside"
                                                    selectedKeys={field.value ? [field.value] : []}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    startContent={<Icon icon="mdi:domain" className="text-gray-400" />}
                                                    classNames={{
                                                        label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    }}
                                                >
                                                    {departments
                                                        .filter(d => d.id !== editingId) // Prevent selecting self as parent
                                                        .map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.id} textValue={dept.name}>
                                                                {dept.name}
                                                            </SelectItem>
                                                        ))}
                                                </Select>
                                            )}
                                        />

                                        <Controller
                                            name="managerId"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    label="Manager"
                                                    placeholder="Select manager"
                                                    variant="bordered"
                                                    labelPlacement="outside"
                                                    selectedKeys={field.value ? [field.value] : []}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    startContent={<Icon icon="mdi:account-tie" className="text-gray-400" />}
                                                    classNames={{
                                                        label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    }}
                                                >
                                                    {users.map((user) => (
                                                        <SelectItem key={user.id} value={user.id} textValue={`${user.firstName} ${user.lastName}`}>
                                                            {user.firstName} {user.lastName} ({user.email})
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                label="Description"
                                                placeholder="Provide a brief description of the department's role and responsibilities..."
                                                variant="bordered"
                                                labelPlacement="outside"
                                                minRows={4}
                                                description={`${descriptionLength}/500 characters`}
                                                isInvalid={!!errors.description}
                                                errorMessage={errors.description?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    variant="flat"
                                    color="default"
                                    onPress={handleCloseModal}
                                    startContent={<Icon icon="mdi:close" />}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    isLoading={isSubmitting}
                                    startContent={!isSubmitting && <Icon icon={editingId ? "mdi:content-save" : "mdi:plus"} />}
                                >
                                    {isSubmitting ? 'Saving...' : (editingId ? 'Update Department' : 'Create Department')}
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>

                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={confirmDelete}
                    title="Delete Department"
                    message="Are you sure you want to delete this department? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    confirmColor="danger"
                    icon="mdi:office-building-remove"
                />
            </motion.div>
        </div>
    );
}
