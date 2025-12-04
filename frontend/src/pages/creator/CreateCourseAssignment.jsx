import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem, Checkbox } from "@heroui/react";
import { Icon } from "@iconify/react";
import { assessmentService } from '@/services';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from 'framer-motion';

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

export default function CreateCourseAssignment() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
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

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                courseId: id,
                maxScore: parseInt(data.maxScore),
                allowedFileTypes: data.allowedFileTypes ? data.allowedFileTypes.split(',').map(t => t.trim()).filter(Boolean) : [],
                maxFileSize: data.maxFileSize ? parseInt(data.maxFileSize) : null,
            };

            await assessmentService.createAssignment(payload);
            navigate(`/creator/courses/${id}/assignments`);
        } catch (error) {
            console.error('Error creating assignment:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <Button
                        variant="light"
                        startContent={<Icon icon="mdi:arrow-left" className="text-xl" />}
                        onPress={() => navigate(`/creator/courses/${id}/assignments`)}
                        className="mb-4 text-gray-600 dark:text-gray-400"
                    >
                        Back to Course Assignments
                    </Button>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                            <Icon icon="mdi:clipboard-plus" className="text-4xl text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Create New Assignment
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Configure assignment details and requirements
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                            <CardBody className="p-8 gap-6">
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
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                            }}
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
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                            }}
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
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                            }}
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
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
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
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
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
                                                    classNames={{
                                                        label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    }}
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
                                                    classNames={{
                                                        label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    }}
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
                                                    description="Comma-separated file extensions"
                                                    startContent={<Icon icon="mdi:file-check" className="text-gray-400" />}
                                                    isInvalid={!!errors.allowedFileTypes}
                                                    errorMessage={errors.allowedFileTypes?.message}
                                                    classNames={{
                                                        label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    }}
                                                />
                                            )}
                                        />

                                        <Controller
                                            name="isRequired"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center pt-6">
                                                    <Checkbox
                                                        isSelected={field.value}
                                                        onValueChange={field.onChange}
                                                    >
                                                        Required Assignment
                                                    </Checkbox>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <Button
                                        variant="flat"
                                        color="default"
                                        onPress={() => navigate(`/creator/courses/${id}/assignments`)}
                                        className="font-medium"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isLoading={isSubmitting}
                                        className="font-medium px-8"
                                        startContent={!isSubmitting && <Icon icon="mdi:check" />}
                                    >
                                        Create Assignment
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
