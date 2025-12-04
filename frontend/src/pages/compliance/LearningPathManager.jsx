import React, { useEffect, useState } from 'react';
import { learningPathService, complianceService, courseService, departmentService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable, EmptyState, ConfirmModal } from '@/components/common';
import {
    Card,
    CardBody,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Textarea,
    Select,
    SelectItem,
    Chip,
    useDisclosure,
    addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod Schemas
const pathSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    type: z.string().default('compliance'),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});

const assignSchema = z.object({
    departmentIds: z.array(z.string()).min(1, 'Please select at least one department'),
    dueDate: z.string().optional(),
});

export default function LearningPathManager() {
    const [loading, setLoading] = useState(true);
    const [paths, setPaths] = useState([]);
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedPath, setSelectedPath] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pathToDelete, setPathToDelete] = useState(null);

    // Path form
    const {
        control: pathControl,
        handleSubmit: handlePathSubmit,
        reset: resetPath,
        setValue: setPathValue,
        formState: { errors: pathErrors, isSubmitting: isPathSubmitting }
    } = useForm({
        resolver: zodResolver(pathSchema),
        defaultValues: {
            name: '',
            description: '',
            type: 'compliance',
            difficulty: 'beginner',
        }
    });

    // Assignment form
    const {
        control: assignControl,
        handleSubmit: handleAssignSubmit,
        reset: resetAssign,
        formState: { errors: assignErrors, isSubmitting: isAssignSubmitting }
    } = useForm({
        resolver: zodResolver(assignSchema),
        defaultValues: {
            departmentIds: [],
            dueDate: '',
        }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pathsRes, coursesRes, deptsRes] = await Promise.all([
                learningPathService.getAllLearningPaths({ type: 'compliance' }),
                courseService.getAllCourses({ status: 'published' }),
                departmentService.getAllDepartments({ flat: true }),
            ]);

            if (pathsRes?.data?.success) {
                setPaths(pathsRes.data.data);
            }
            if (coursesRes?.data?.success) {
                setCourses(coursesRes.data.data.courses || coursesRes.data.data);
            }
            if (deptsRes?.data?.success) {
                setDepartments(deptsRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            addToast({ title: "Error!", description: 'Failed to load data', color: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const onSubmitPath = async (data) => {
        try {
            const response = selectedPath
                ? await learningPathService.updateLearningPath(selectedPath.id, data)
                : await learningPathService.createLearningPath(data);

            if (response?.data?.success) {
                addToast({ title: "Success!", description: selectedPath ? 'Learning path updated successfully' : 'Learning path created successfully', color: 'success' });
                fetchData();
                handleCloseModal();
            } else {
                addToast({ title: "Error!", description: response?.data?.message || 'Operation failed', color: 'danger' });
            }
        } catch (error) {
            console.error('Error saving learning path:', error);
            addToast({ title: "Error!", description: 'Failed to save learning path', color: 'danger' });
        }
    };

    const handleDelete = (id) => {
        setPathToDelete(id);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!pathToDelete) return;

        try {
            const response = await learningPathService.deleteLearningPath(pathToDelete);
            if (response?.data?.success) {
                addToast({ title: "Success!", description: 'Learning path deleted successfully', color: 'success' });
                fetchData();
            } else {
                addToast({ title: "Error!", description: response?.data?.message || 'Failed to delete', color: 'danger' });
            }
        } catch (error) {
            console.error('Error deleting learning path:', error);
            addToast({ title: "Error!", description: 'Failed to delete learning path', color: 'danger' });
        } finally {
            setShowConfirmModal(false);
            setPathToDelete(null);
        }
    };

    const onSubmitAssignment = async (data) => {
        if (!selectedPath) {
            addToast({ title: "Error!", description: 'Please select a learning path', color: 'danger' });
            return;
        }

        try {
            const response = await complianceService.bulkAssignCompliancePath({
                pathId: selectedPath.id,
                departmentIds: data.departmentIds,
                dueDate: data.dueDate || null,
            });

            if (response?.data?.success) {
                addToast({ title: "Success!", description: 'Path assigned to users successfully', color: 'success' });
                handleCloseAssignModal();
            } else {
                addToast({ title: "Error!", description: response?.data?.message || 'Assignment failed', color: 'danger' });
            }
        } catch (error) {
            console.error('Error assigning path:', error);
            addToast({ title: "Error!", description: 'Failed to assign path', color: 'danger' });
        }
    };

    const handleOpenModal = (path = null) => {
        if (path) {
            setSelectedPath(path);
            setPathValue('name', path.name);
            setPathValue('description', path.description || '');
            setPathValue('type', path.type || 'compliance');
            setPathValue('difficulty', path.difficulty || 'beginner');
        } else {
            setSelectedPath(null);
            resetPath();
        }
        onOpen();
    };

    const handleCloseModal = () => {
        setSelectedPath(null);
        resetPath();
        onClose();
    };

    const handleOpenAssignModal = (path) => {
        setSelectedPath(path);
        resetAssign();
        onAssignOpen();
    };

    const handleCloseAssignModal = () => {
        setSelectedPath(null);
        resetAssign();
        onAssignClose();
    };

    const columns = [
        {
            key: 'name',
            label: 'NAME',
            render: (path) => (
                <div>
                    <p className="font-medium">{path.name}</p>
                    <p className="text-sm text-gray-500">{path.description}</p>
                </div>
            ),
        },
        {
            key: 'type',
            label: 'TYPE',
            render: (path) => (
                <Chip color="primary" variant="flat" size="sm">
                    {path.type || 'compliance'}
                </Chip>
            ),
        },
        {
            key: 'difficulty',
            label: 'DIFFICULTY',
            render: (path) => (
                <Chip
                    color={path.difficulty === 'beginner' ? 'success' : path.difficulty === 'intermediate' ? 'warning' : 'danger'}
                    variant="flat"
                    size="sm"
                >
                    {path.difficulty || 'beginner'}
                </Chip>
            ),
        },
        {
            key: 'courses',
            label: 'COURSES',
            render: (path) => <span>{path.courses?.length || 0} courses</span>,
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            render: (path) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        isIconOnly
                        onPress={() => handleOpenModal(path)}
                    >
                        <Icon icon="mdi:pencil" width="18" />
                    </Button>
                    <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        isIconOnly
                        onPress={() => handleOpenAssignModal(path)}
                    >
                        <Icon icon="mdi:account-multiple-plus" width="18" />
                    </Button>
                    <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        isIconOnly
                        onPress={() => handleDelete(path.id)}
                    >
                        <Icon icon="mdi:delete" width="18" />
                    </Button>
                </div>
            ),
        },
    ];

    if (loading) return <LoadingSpinner fullPage />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Compliance Learning Paths"
                    description="Create and manage compliance-focused learning paths"
                    icon="mdi:road-variant"
                    action={
                        <Button
                            color="primary"
                            startContent={<Icon icon="mdi:plus" width="20" />}
                            onPress={() => handleOpenModal()}
                        >
                            Create Learning Path
                        </Button>
                    }
                />

                <Card>
                    <CardBody>
                        {paths.length > 0 ? (
                            <DataTable columns={columns} data={paths} />
                        ) : (
                            <EmptyState
                                icon="mdi:road-variant"
                                title="No compliance paths found"
                                description="Create your first compliance learning path to get started"
                                action={
                                    <Button color="primary" onPress={() => handleOpenModal()}>
                                        Create Learning Path
                                    </Button>
                                }
                            />
                        )}
                    </CardBody>
                </Card>

                {/* Create/Edit Modal */}
                <Modal isOpen={isOpen} onClose={handleCloseModal} size="2xl">
                    <ModalContent>
                        <form onSubmit={handlePathSubmit(onSubmitPath)}>
                            <ModalHeader>
                                <h2 className="text-xl font-semibold">
                                    {selectedPath ? 'Edit Learning Path' : 'Create Learning Path'}
                                </h2>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <Controller
                                        name="name"
                                        control={pathControl}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Path Name"
                                                placeholder="Enter learning path name"
                                                isRequired
                                                isInvalid={!!pathErrors.name}
                                                errorMessage={pathErrors.name?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="description"
                                        control={pathControl}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                label="Description"
                                                placeholder="Enter description"
                                                minRows={3}
                                                isInvalid={!!pathErrors.description}
                                                errorMessage={pathErrors.description?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="difficulty"
                                        control={pathControl}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                label="Difficulty Level"
                                                placeholder="Select difficulty"
                                                selectedKeys={field.value ? [field.value] : []}
                                                onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                                isInvalid={!!pathErrors.difficulty}
                                                errorMessage={pathErrors.difficulty?.message}
                                            >
                                                <SelectItem key="beginner" value="beginner">Beginner</SelectItem>
                                                <SelectItem key="intermediate" value="intermediate">Intermediate</SelectItem>
                                                <SelectItem key="advanced" value="advanced">Advanced</SelectItem>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" onPress={handleCloseModal}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit" isLoading={isPathSubmitting}>
                                    {selectedPath ? 'Update' : 'Create'}
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>

                {/* Assign Modal */}
                <Modal isOpen={isAssignOpen} onClose={handleCloseAssignModal} size="2xl">
                    <ModalContent>
                        <form onSubmit={handleAssignSubmit(onSubmitAssignment)}>
                            <ModalHeader>
                                <h2 className="text-xl font-semibold">Assign Learning Path</h2>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Assigning: <strong>{selectedPath?.name}</strong>
                                    </p>
                                    <Controller
                                        name="departmentIds"
                                        control={assignControl}
                                        render={({ field }) => (
                                            <Select
                                                label="Select Departments"
                                                placeholder="Choose departments"
                                                selectionMode="multiple"
                                                selectedKeys={field.value}
                                                onSelectionChange={(keys) => field.onChange(Array.from(keys))}
                                                isRequired
                                                isInvalid={!!assignErrors.departmentIds}
                                                errorMessage={assignErrors.departmentIds?.message}
                                            >
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    <Controller
                                        name="dueDate"
                                        control={assignControl}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="date"
                                                label="Due Date (Optional)"
                                                isInvalid={!!assignErrors.dueDate}
                                                errorMessage={assignErrors.dueDate?.message}
                                            />
                                        )}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" onPress={handleCloseAssignModal}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit" isLoading={isAssignSubmitting}>
                                    Assign Path
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>

                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={confirmDelete}
                    title="Delete Learning Path"
                    message="Are you sure you want to delete this learning path? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    confirmColor="danger"
                    icon="mdi:delete-alert"
                />
            </div>
        </div>
    );
}
