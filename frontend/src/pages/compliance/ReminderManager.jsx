import React, { useState, useEffect } from 'react';
import { complianceService, departmentService, learningPathService, roleService } from '@/services';
import { PageHeader, LoadingSpinner } from '@/components/common';
import {
    Card,
    CardBody,
    Button,
    Input,
    Textarea,
    Select,
    SelectItem,
    RadioGroup,
    Radio,
    Tabs,
    Tab,
    Chip,
    addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod Schemas
const reminderSchema = z.object({
    reminderType: z.enum(['overdue', 'upcoming', 'all']),
    departmentIds: z.array(z.string()).optional(),
    userIds: z.array(z.string()).optional(),
    pathId: z.string().optional(),
    message: z.string().min(10, 'Message must be at least 10 characters'),
    title: z.string().optional(),
});

const escalationSchema = z.object({
    departmentId: z.string().optional(),
    pathId: z.string().optional(),
    daysOverdue: z.number().min(1, 'Must be at least 1 day').max(365, 'Must be less than 365 days'),
});

export default function ReminderManager() {
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [paths, setPaths] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedTab, setSelectedTab] = useState('individual');

    // Reminder form
    const {
        control: reminderControl,
        handleSubmit: handleReminderSubmit,
        reset: resetReminder,
        watch: watchReminder,
        formState: { errors: reminderErrors, isSubmitting: isReminderSubmitting }
    } = useForm({
        resolver: zodResolver(reminderSchema),
        defaultValues: {
            reminderType: 'overdue',
            departmentIds: [],
            userIds: [],
            pathId: '',
            message: '',
            title: '',
        }
    });

    // Escalation form
    const {
        control: escalationControl,
        handleSubmit: handleEscalationSubmit,
        reset: resetEscalation,
        formState: { errors: escalationErrors, isSubmitting: isEscalationSubmitting }
    } = useForm({
        resolver: zodResolver(escalationSchema),
        defaultValues: {
            departmentId: '',
            pathId: '',
            daysOverdue: 7,
        }
    });

    const reminderType = watchReminder('reminderType');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [deptsRes, pathsRes, usersRes] = await Promise.all([
                departmentService.getAllDepartments({ flat: true }),
                learningPathService.getAllLearningPaths({ type: 'compliance' }),
                roleService.getAllUsersWithRoles(),
            ]);

            if (deptsRes?.data?.success) {
                setDepartments(deptsRes.data.data);
            }
            if (pathsRes?.data?.success) {
                setPaths(pathsRes.data.data.learningPaths);
            }
            if (usersRes?.data?.success) {
                setUsers(usersRes.data.data.users || usersRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const onSubmitReminder = async (data) => {
        if (selectedTab === 'individual' && (!data.userIds || data.userIds.length === 0)) {
            addToast({ title: "Error!", description: 'Please select at least one user', color: 'danger' });
            return;
        }
        if (selectedTab === 'bulk' && (!data.departmentIds || data.departmentIds.length === 0)) {
            addToast({ title: "Error!", description: 'Please select at least one department', color: 'danger' });
            return;
        }

        try {
            setLoading(true);
            const response = await complianceService.sendComplianceReminders(data);

            if (response?.data?.success) {
                addToast({ title: "Success!", description: response.data.message || 'Reminders sent successfully', color: 'success' });
                resetReminder();
            } else {
                addToast({ title: "Error!", description: response?.data?.message || 'Failed to send reminders', color: 'danger' });
            }
        } catch (error) {
            console.error('Error sending reminders:', error);
            addToast({ title: "Error!", description: 'Failed to send reminders', color: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const onSubmitEscalation = async (data) => {
        try {
            setLoading(true);
            const response = await complianceService.escalateOverdueTraining(data);

            if (response?.data?.success) {
                addToast({ title: "Success!", description: response.data.message || 'Escalations sent successfully', color: 'success' });
                resetEscalation();
            } else {
                addToast({ title: "Error!", description: response?.data?.message || 'Failed to escalate', color: 'danger' });
            }
        } catch (error) {
            console.error('Error escalating:', error);
            addToast({ title: "Error!", description: 'Failed to escalate overdue training', color: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const getDefaultMessage = () => {
        switch (reminderData.reminderType) {
            case 'overdue':
                return 'You have overdue compliance training that requires immediate attention. Please complete it as soon as possible.';
            case 'upcoming':
                return 'You have upcoming compliance training deadlines. Please ensure you complete the training before the due date.';
            case 'all':
                return 'This is a reminder about your assigned compliance training. Please check your progress and complete any pending courses.';
            default:
                return '';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Reminders & Escalations"
                    description="Send compliance reminders and escalate overdue training"
                    icon="mdi:bell-alert"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardBody>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:email-send" width="24" />
                                    Send Reminders
                                </h3>

                                <Tabs
                                    selectedKey={selectedTab}
                                    onSelectionChange={setSelectedTab}
                                    className="mb-6"
                                >
                                    <Tab key="individual" title="Individual Users" />
                                    <Tab key="bulk" title="Bulk by Department" />
                                </Tabs>

                                <div className="space-y-4">
                                    {/* Reminder Type */}
                                    <RadioGroup
                                        label="Reminder Type"
                                        value={reminderData.reminderType}
                                        onValueChange={(value) =>
                                            setReminderData({ ...reminderData, reminderType: value })
                                        }
                                        orientation="horizontal"
                                    >
                                        <Radio value="overdue">Overdue Training</Radio>
                                        <Radio value="upcoming">Upcoming Deadlines</Radio>
                                        <Radio value="all">All Assigned Training</Radio>
                                    </RadioGroup>

                                    {/* Path Selection */}
                                    <Select
                                        label="Learning Path (Optional)"
                                        placeholder="All Compliance Paths"
                                        selectedKeys={reminderData.pathId ? [reminderData.pathId] : []}
                                        onChange={(e) =>
                                            setReminderData({ ...reminderData, pathId: e.target.value })
                                        }
                                    >
                                        {paths.map((path) => (
                                            <SelectItem key={path.id} value={path.id}>
                                                {path.name}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    {/* Target Selection */}
                                    {selectedTab === 'individual' && (
                                        <Select
                                            label="Select Users"
                                            placeholder="Choose users"
                                            selectionMode="multiple"
                                            selectedKeys={reminderData.userIds}
                                            onChange={(e) =>
                                                setReminderData({
                                                    ...reminderData,
                                                    userIds: Array.from(e.target.value.split(',')).filter(Boolean),
                                                })
                                            }
                                            description={`${reminderData.userIds.length} user(s) selected`}
                                        >
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.firstName} {user.lastName} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    )}

                                    {selectedTab === 'bulk' && (
                                        <Select
                                            label="Select Departments"
                                            placeholder="Choose departments"
                                            selectionMode="multiple"
                                            selectedKeys={reminderData.departmentIds}
                                            onChange={(e) =>
                                                setReminderData({
                                                    ...reminderData,
                                                    departmentIds: Array.from(e.target.value.split(',')).filter(
                                                        Boolean
                                                    ),
                                                })
                                            }
                                            description={`${reminderData.departmentIds.length} department(s) selected`}
                                        >
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    )}

                                    {/* Message */}
                                    <Input
                                        label="Email Subject/Title"
                                        placeholder="Enter subject"
                                        value={reminderData.title}
                                        onChange={(e) =>
                                            setReminderData({ ...reminderData, title: e.target.value })
                                        }
                                    />

                                    <Textarea
                                        label="Message"
                                        placeholder={getDefaultMessage()}
                                        value={reminderData.message}
                                        onChange={(e) =>
                                            setReminderData({ ...reminderData, message: e.target.value })
                                        }
                                        minRows={4}
                                        description="Leave blank to use default message"
                                    />

                                    <div className="flex gap-3">
                                        <Button
                                            color="primary"
                                            isLoading={loading}
                                            onPress={handleSendReminder}
                                            startContent={<Icon icon="mdi:send" width="20" />}
                                            className="flex-1"
                                        >
                                            Send Reminders
                                        </Button>
                                        <Button
                                            variant="flat"
                                            onPress={() =>
                                                setReminderData({
                                                    reminderType: 'overdue',
                                                    departmentIds: [],
                                                    userIds: [],
                                                    pathId: '',
                                                    message: '',
                                                    title: '',
                                                })
                                            }
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Escalation Panel */}
                    <div>
                        <Card>
                            <CardBody>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:alert-octagon" width="24" className="text-red-600" />
                                    Escalate to Managers
                                </h3>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Automatically send escalation notifications to department managers about overdue
                                    training.
                                </p>

                                <div className="space-y-4">
                                    <Select
                                        label="Department (Optional)"
                                        placeholder="All Departments"
                                        selectedKeys={escalationData.departmentId ? [escalationData.departmentId] : []}
                                        onChange={(e) =>
                                            setEscalationData({ ...escalationData, departmentId: e.target.value })
                                        }
                                    >
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label="Learning Path (Optional)"
                                        placeholder="All Paths"
                                        selectedKeys={escalationData.pathId ? [escalationData.pathId] : []}
                                        onChange={(e) =>
                                            setEscalationData({ ...escalationData, pathId: e.target.value })
                                        }
                                    >
                                        {paths.map((path) => (
                                            <SelectItem key={path.id} value={path.id}>
                                                {path.name}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Input
                                        type="number"
                                        label="Minimum Days Overdue"
                                        value={escalationData.daysOverdue.toString()}
                                        onChange={(e) =>
                                            setEscalationData({
                                                ...escalationData,
                                                daysOverdue: parseInt(e.target.value) || 7,
                                            })
                                        }
                                        min={1}
                                        description="Escalate training overdue by at least this many days"
                                    />

                                    <Button
                                        color="danger"
                                        isLoading={loading}
                                        onPress={handleEscalate}
                                        startContent={<Icon icon="mdi:alert-octagon" width="20" />}
                                        className="w-full"
                                    >
                                        Escalate Now
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Quick Stats */}
                        <Card className="mt-4">
                            <CardBody>
                                <h4 className="font-semibold mb-3">Quick Stats</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
                                        <Chip size="sm" variant="flat">{users.length}</Chip>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Departments</span>
                                        <Chip size="sm" variant="flat">{departments.length}</Chip>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Compliance Paths</span>
                                        <Chip size="sm" variant="flat">{paths.length}</Chip>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
