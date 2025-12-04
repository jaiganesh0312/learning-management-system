import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem, Textarea, Checkbox, CheckboxGroup, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';
import { reportingService, enrollmentService, notificationService, learningPathService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable } from '@/components/common';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod Schemas
const reminderSchema = z.object({
    message: z.string().min(10, 'Message must be at least 10 characters'),
    priority: z.enum(['low', 'medium', 'high']),
});

const assignmentSchema = z.object({
    learningPathId: z.string().min(1, 'Please select a learning path'),
});

export default function TeamManagement() {
    const [loading, setLoading] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const [learningPaths, setLearningPaths] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const { isOpen: isReminderOpen, onOpen: onReminderOpen, onClose: onReminderClose } = useDisclosure();
    const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();

    // Reminder form
    const {
        control: reminderControl,
        handleSubmit: handleReminderSubmit,
        reset: resetReminder,
        formState: { errors: reminderErrors, isSubmitting: isReminderSubmitting }
    } = useForm({
        resolver: zodResolver(reminderSchema),
        defaultValues: {
            message: '',
            priority: 'medium',
        }
    });

    // Assignment form
    const {
        control: assignControl,
        handleSubmit: handleAssignSubmit,
        reset: resetAssign,
        formState: { errors: assignErrors, isSubmitting: isAssignSubmitting }
    } = useForm({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            learningPathId: '',
        }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await reportingService.getDepartmentManagerDashboard();
            if (response?.data?.success) {
                setTeamMembers(response.data.data.teamMembers || []);
                setLearningPaths(response.data.data.learningPaths || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            addToast({ title: 'Error!', description: 'Failed to fetch team data', color: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const onSubmitReminder = async (data) => {
        if (selectedMembers.length === 0) {
            addToast({ title: 'Error!', description: 'Please select at least one team member', color: 'danger' });
            return;
        }

        try {
            const response = await notificationService.sendNotification({
                userIds: selectedMembers,
                message: data.message,
                title: 'Reminder from Manager',
                type: 'reminder',
                priority: data.priority
            });

            if (response?.data?.success) {
                addToast({ title: 'Success!', description: `Reminder sent to ${selectedMembers.length} team member(s)`, color: 'success' });
                resetReminder();
                setSelectedMembers([]);
                onReminderClose();
            } else {
                addToast({ title: 'Error!', description: response?.data?.message || 'Failed to send reminder', color: 'danger' });
            }
        } catch (error) {
            console.error('Error sending reminder:', error);
            addToast({ title: 'Error!', description: 'Failed to send reminder', color: 'danger' });
        }
    };

    const onSubmitAssignment = async (data) => {
        if (selectedMembers.length === 0) {
            addToast({ title: 'Error!', description: 'Please select at least one team member', color: 'danger' });
            return;
        }

        try {
            // Assign learning path to each selected member
            await Promise.all(
                selectedMembers.map(userId =>
                    enrollmentService.enrollUser({
                        userId,
                        learningPathId: data.learningPathId
                    })
                )
            );

            addToast({ title: 'Success!', description: `Learning path assigned to ${selectedMembers.length} team member(s)`, color: 'success' });
            resetAssign();
            setSelectedMembers([]);
            onAssignClose();
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error assigning learning path:', error);
            addToast({ title: 'Error!', description: 'Failed to assign learning path', color: 'danger' });
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Name',
            render: (item) => `${item.firstName} ${item.lastName}`
        },
        { key: 'email', label: 'Email' },
        {
            key: 'activeCourses',
            label: 'Active Courses',
            render: (item) => item.activeCourses || 0
        },
        {
            key: 'completedCourses',
            label: 'Completed',
            render: (item) => item.completedCourses || 0
        },
        {
            key: 'averageProgress',
            label: 'Avg Progress',
            render: (item) => `${item.averageProgress || 0}%`
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
                    title="Team Management"
                    description="Manage your team members' learning"
                    icon="mdi:account-group"
                />

                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardBody className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Team Members ({teamMembers.length})
                            </h3>
                            <div className="flex gap-2">
                                <Button
                                    color="primary"
                                    variant="flat"
                                    startContent={<Icon icon="mdi:bell" className="text-xl" />}
                                    onPress={() => {
                                        if (selectedMembers.length === 0) {
                                            addToast({ title: 'Error!', description: 'Please select team members first', color: 'danger' });
                                        } else {
                                            onReminderOpen();
                                        }
                                    }}
                                    isDisabled={selectedMembers.length === 0}
                                >
                                    Send Reminder
                                </Button>
                                <Button
                                    color="secondary"
                                    variant="flat"
                                    startContent={<Icon icon="mdi:book-plus" className="text-xl" />}
                                    onPress={() => {
                                        if (selectedMembers.length === 0) {
                                            addToast({ title: 'Error!', description: 'Please select team members first', color: 'danger' });
                                        } else {
                                            onAssignOpen();
                                        }
                                    }}
                                    isDisabled={selectedMembers.length === 0}
                                >
                                    Assign Learning Path
                                </Button>
                            </div>
                        </div>

                        <DataTable
                            data={teamMembers}
                            columns={columns}
                            searchPlaceholder="Search team members..."
                            emptyContent="No team members found"
                            selectable
                            onSelectionChange={setSelectedMembers}
                        />
                    </CardBody>
                </Card>

                {/* Send Reminder Modal */}
                <Modal isOpen={isReminderOpen} onClose={onReminderClose} size="lg">
                    <ModalContent>
                        <form onSubmit={handleReminderSubmit(onSubmitReminder)}>
                            <ModalHeader>Send Reminder to Team Members</ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            Sending to {selectedMembers.length} team member(s)
                                        </p>
                                    </div>

                                    <Controller
                                        name="message"
                                        control={reminderControl}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                label="Reminder Message"
                                                placeholder="Enter your reminder message..."
                                                minRows={4}
                                                isRequired
                                                isInvalid={!!reminderErrors.message}
                                                errorMessage={reminderErrors.message?.message}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="priority"
                                        control={reminderControl}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                label="Priority"
                                                selectedKeys={field.value ? [field.value] : []}
                                                onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                                isInvalid={!!reminderErrors.priority}
                                                errorMessage={reminderErrors.priority?.message}
                                            >
                                                <SelectItem key="low">Low</SelectItem>
                                                <SelectItem key="medium">Medium</SelectItem>
                                                <SelectItem key="high">High</SelectItem>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onReminderClose}>Cancel</Button>
                                <Button
                                    color="primary"
                                    type="submit"
                                    isLoading={isReminderSubmitting}
                                >
                                    Send Reminder
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>

                {/* Assign Learning Path Modal */}
                <Modal isOpen={isAssignOpen} onClose={onAssignClose} size="lg">
                    <ModalContent>
                        <form onSubmit={handleAssignSubmit(onSubmitAssignment)}>
                            <ModalHeader>Assign Learning Path</ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            Assigning to {selectedMembers.length} team member(s)
                                        </p>
                                    </div>

                                    <Controller
                                        name="learningPathId"
                                        control={assignControl}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                label="Select Learning Path"
                                                placeholder="Choose a learning path"
                                                selectedKeys={field.value ? [field.value] : []}
                                                onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                                isRequired
                                                isInvalid={!!assignErrors.learningPathId}
                                                errorMessage={assignErrors.learningPathId?.message}
                                            >
                                                {learningPaths.map(lp => (
                                                    <SelectItem key={lp.id} value={lp.id}>
                                                        {lp.name}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onAssignClose}>Cancel</Button>
                                <Button
                                    color="primary"
                                    type="submit"
                                    isLoading={isAssignSubmitting}
                                >
                                    Assign
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>
            </motion.div>
        </div>
    );
}
