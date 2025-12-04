import React, { useState } from 'react';
import {
    Card, CardBody, Button, Input, Textarea, Select, SelectItem, Checkbox,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Chip, Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { assessmentService } from '@/services';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const assignmentSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    instructions: z.string().min(10, "Instructions must be at least 10 characters"),
    maxScore: z.coerce.number().min(1, "Max score must be at least 1"),
    dueDate: z.string().refine((val) => !val || new Date(val) > new Date(), {
        message: "Due date must be in the future"
    }).optional().or(z.literal('')),
    submissionType: z.enum(['file', 'text', 'both']).default('both'),
    allowedFileTypes: z.string().optional(), // Comma-separated
    maxFileSize: z.coerce.number().optional(), // in MB
    isRequired: z.boolean().default(false),
});

export default function CourseAssignments({ courseId, assignments = [], onUpdate }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            title: '',
            description: '',
            instructions: '',
            maxScore: 100,
            dueDate: '',
            submissionType: 'both',
            allowedFileTypes: '',
            maxFileSize: '',
            isRequired: false
        }
    });

    const handleEdit = (assignment) => {
        setSelectedAssignment(assignment);
        reset({
            title: assignment.title,
            description: assignment.description || '',
            instructions: assignment.instructions || '',
            maxScore: assignment.maxScore,
            dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
            submissionType: assignment.submissionType || 'both',
            allowedFileTypes: assignment.allowedFileTypes?.join(',') || '',
            maxFileSize: assignment.maxFileSize || '',
            isRequired: assignment.isRequired || false
        });
        onOpen();
    };

    const handleCreate = () => {
        setSelectedAssignment(null);
        reset({
            title: '',
            description: '',
            instructions: '',
            maxScore: 100,
            dueDate: '',
            submissionType: 'both',
            allowedFileTypes: '',
            maxFileSize: '',
            isRequired: false
        });
        onOpen();
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                courseId,
                maxScore: parseInt(data.maxScore),
                allowedFileTypes: data.allowedFileTypes ? data.allowedFileTypes.split(',').map(t => t.trim()).filter(Boolean) : [],
                maxFileSize: data.maxFileSize ? parseInt(data.maxFileSize) : null,
            };

            if (selectedAssignment) {
                await assessmentService.updateAssignment(selectedAssignment.id, payload);
            } else {
                await assessmentService.createAssignment(payload);
            }
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error saving assignment:', error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this assignment?')) {
            try {
                await assessmentService.deleteAssignment(id);
                onUpdate();
            } catch (error) {
                console.error('Error deleting assignment:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assignments</h3>
                    <p className="text-sm text-gray-500">Manage course assignments and tasks.</p>
                </div>
                <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={handleCreate}>
                    Create Assignment
                </Button>
            </div>

            <div className="grid gap-4">
                {assignments.length === 0 ? (
                    <Card className="border border-dashed border-gray-300 dark:border-gray-700 bg-transparent shadow-none">
                        <CardBody className="py-12 flex flex-col items-center text-center text-gray-500">
                            <Icon icon="mdi:clipboard-text-outline" className="text-4xl mb-3 opacity-50" />
                            <p className="font-medium">No assignments yet</p>
                            <p className="text-sm">Create an assignment for your students.</p>
                        </CardBody>
                    </Card>
                ) : (
                    assignments.map((assignment) => (
                        <Card key={assignment.id} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                            <CardBody className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{assignment.title}</h4>
                                        <p className="text-sm text-gray-500 line-clamp-2">{assignment.description}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Chip size="sm" variant="flat" color="primary" startContent={<Icon icon="mdi:star-outline" />}>
                                                Max Score: {assignment.maxScore}
                                            </Chip>
                                            {assignment.dueDate && (
                                                <Chip size="sm" variant="flat" color="warning" startContent={<Icon icon="mdi:calendar-clock" />}>
                                                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                </Chip>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button isIconOnly size="sm" variant="light" onPress={() => handleEdit(assignment)}>
                                            <Icon icon="mdi:pencil" className="text-lg text-gray-500" />
                                        </Button>
                                        <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => handleDelete(assignment.id)}>
                                            <Icon icon="mdi:trash-can" className="text-lg" />
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                )}
            </div>

            <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="outside">
                <ModalContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ModalHeader className="flex flex-col gap-1">
                            {selectedAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                        </ModalHeader>
                        <ModalBody className="gap-6">
                            <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        isRequired
                                        label="Title"
                                        placeholder="e.g., Final Project Submission"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        isInvalid={!!errors.title}
                                        errorMessage={errors.title?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        label="Description (Brief)"
                                        placeholder="Short summary of the assignment..."
                                        variant="bordered"
                                        labelPlacement="outside"
                                        description="Brief overview for assignment listing"
                                        minRows={2}
                                        isInvalid={!!errors.description}
                                        errorMessage={errors.description?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="instructions"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        isRequired
                                        label="Instructions (Detailed)"
                                        placeholder="Detailed instructions for completing the assignment..."
                                        variant="bordered"
                                        labelPlacement="outside"
                                        description="Full requirements and guidelines for students"
                                        minRows={4}
                                        isInvalid={!!errors.instructions}
                                        errorMessage={errors.instructions?.message}
                                    />
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    name="maxScore"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            label="Max Score"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            isInvalid={!!errors.maxScore}
                                            errorMessage={errors.maxScore?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name="dueDate"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="date"
                                            label="Due Date"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            isInvalid={!!errors.dueDate}
                                            errorMessage={errors.dueDate?.message}
                                        />
                                    )}
                                />
                            </div>

                            {/* Submission Settings */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Icon icon="mdi:upload" />
                                    Submission Settings
                                </h4>

                                <div className="grid grid-cols-2 gap-3">
                                    <Controller
                                        name="submissionType"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                label="Submission Type"
                                                placeholder="Select type"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                selectedKeys={field.value ? [field.value] : []}
                                                onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                                isInvalid={!!errors.submissionType}
                                                errorMessage={errors.submissionType?.message}
                                            >
                                                <SelectItem key="file" startContent={<Icon icon="mdi:file-upload" />}>
                                                    File Upload Only
                                                </SelectItem>
                                                <SelectItem key="text" startContent={<Icon icon="mdi:text-box" />}>
                                                    Text Submission Only
                                                </SelectItem>
                                                <SelectItem key="both" startContent={<Icon icon="mdi:file-document-multiple" />}>
                                                    File Upload + Text
                                                </SelectItem>
                                            </Select>
                                        )}
                                    />

                                    <Controller
                                        name="maxFileSize"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                label="Max File Size (MB)"
                                                placeholder="10"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                description="Leave empty for no limit"
                                                endContent={<span className="text-gray-400 text-sm">MB</span>}
                                                isInvalid={!!errors.maxFileSize}
                                                errorMessage={errors.maxFileSize?.message}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="allowedFileTypes"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Allowed File Types"
                                                placeholder="pdf, docx, pptx, zip"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                description="Comma-separated file extensions (e.g., pdf, docx, zip)"
                                                startContent={<Icon icon="mdi:file-check" className="text-gray-400" />}
                                                isInvalid={!!errors.allowedFileTypes}
                                                errorMessage={errors.allowedFileTypes?.message}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="isRequired"
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                {...field}

                                            >
                                                Required Assignment
                                            </Checkbox>
                                        )}
                                    />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" color="primary" isLoading={isSubmitting}>
                                {selectedAssignment ? 'Update Assignment' : 'Create Assignment'}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </div>
    );
}
