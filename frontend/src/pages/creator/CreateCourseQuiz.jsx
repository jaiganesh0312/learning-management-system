import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input, Textarea, Checkbox } from "@heroui/react";
import { Icon } from "@iconify/react";
import { assessmentService } from '@/services';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from 'framer-motion';

const quizSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    passingScore: z.coerce.number().min(0).max(100, "Passing score must be between 0 and 100"),
    timeLimit: z.coerce.number().min(1, "Time limit must be at least 1 minute").optional().or(z.literal('')),
    maxAttempts: z.coerce.number().min(1, "Max attempts must be at least 1").optional().or(z.literal('')),
    isRequired: z.boolean().default(false),
    randomizeQuestions: z.boolean().default(false),
    showCorrectAnswers: z.boolean().default(true),
    availableFrom: z.string().optional().or(z.literal('')),
    availableUntil: z.string().optional().or(z.literal('')),
});

export default function CreateCourseQuiz() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(quizSchema),
        defaultValues: {
            title: '',
            description: '',
            passingScore: 70,
            timeLimit: '',
            maxAttempts: '',
            isRequired: false,
            randomizeQuestions: false,
            showCorrectAnswers: true,
            availableFrom: '',
            availableUntil: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                courseId: id,
                passingScore: parseInt(data.passingScore),
                timeLimit: data.timeLimit ? parseInt(data.timeLimit) : null,
                maxAttempts: data.maxAttempts ? parseInt(data.maxAttempts) : null,
                availableFrom: data.availableFrom || null,
                availableUntil: data.availableUntil || null,
            };

            const response = await assessmentService.createQuiz(payload);
            if (response?.data?.success) {
                navigate(`/creator/courses/${id}/quizzes`);
            }
        } catch (error) {
            console.error('Error creating quiz:', error);
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
                        onPress={() => navigate(`/creator/courses/${id}/quizzes`)}
                        className="mb-4 text-gray-600 dark:text-gray-400"
                    >
                        Back to Course Quizzes
                    </Button>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                            <Icon icon="mdi:quiz" className="text-4xl text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Create New Quiz
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Create an assessment to test your students' knowledge
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
                                            label="Quiz Title"
                                            placeholder="e.g., Module 1 Assessment"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            startContent={<Icon icon="mdi:format-title" className="text-gray-400" />}
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
                                            label="Description"
                                            placeholder="Brief overview of what this quiz covers..."
                                            variant="bordered"
                                            labelPlacement="outside"
                                            minRows={3}
                                            isInvalid={!!errors.description}
                                            errorMessage={errors.description?.message}
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                            }}
                                        />
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Controller
                                        name="passingScore"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                label="Passing Score (%)"
                                                placeholder="70"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:percent-outline" className="text-gray-400" />}
                                                isInvalid={!!errors.passingScore}
                                                errorMessage={errors.passingScore?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="timeLimit"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                label="Time Limit (minutes)"
                                                placeholder="30"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:timer-outline" className="text-gray-400" />}
                                                endContent={<span className="text-gray-400 text-sm">min</span>}
                                                isInvalid={!!errors.timeLimit}
                                                errorMessage={errors.timeLimit?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Advanced Settings */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Icon icon="mdi:cog-outline" />
                                        Advanced Settings
                                    </h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Controller
                                            name="maxAttempts"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    label="Max Attempts"
                                                    placeholder="Unlimited"
                                                    variant="bordered"
                                                    labelPlacement="outside"
                                                    description="Leave empty for unlimited attempts"
                                                    startContent={<Icon icon="mdi:repeat" className="text-gray-400" />}
                                                    isInvalid={!!errors.maxAttempts}
                                                    errorMessage={errors.maxAttempts?.message}
                                                    classNames={{
                                                        label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    }}
                                                />
                                            )}
                                        />

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quiz Options</label>
                                            <div className="grid gap-2 pt-2">
                                                <Controller
                                                    name="isRequired"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Checkbox
                                                            isSelected={field.value}
                                                            onValueChange={field.onChange}
                                                        >
                                                            Required
                                                        </Checkbox>
                                                    )}
                                                />
                                                <Controller
                                                    name="randomizeQuestions"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Checkbox
                                                            isSelected={field.value}
                                                            onValueChange={field.onChange}
                                                        >
                                                            Randomize Questions
                                                        </Checkbox>
                                                    )}
                                                />
                                                <Controller
                                                    name="showCorrectAnswers"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Checkbox
                                                            isSelected={field.value}
                                                            onValueChange={field.onChange}
                                                        >
                                                            Show Correct Answers
                                                        </Checkbox>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Controller
                                            name="availableFrom"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="date"
                                                    label="Available From"
                                                    variant="bordered"
                                                    labelPlacement="outside"
                                                    description="Leave empty for immediate availability"
                                                    startContent={<Icon icon="mdi:calendar-start" className="text-gray-400" />}
                                                    isInvalid={!!errors.availableFrom}
                                                    errorMessage={errors.availableFrom?.message}
                                                    classNames={{
                                                        label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    }}
                                                />
                                            )}
                                        />

                                        <Controller
                                            name="availableUntil"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="date"
                                                    label="Available Until"
                                                    variant="bordered"
                                                    labelPlacement="outside"
                                                    description="Leave empty for no end date"
                                                    startContent={<Icon icon="mdi:calendar-end" className="text-gray-400" />}
                                                    isInvalid={!!errors.availableUntil}
                                                    errorMessage={errors.availableUntil?.message}
                                                    classNames={{
                                                        label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <Button
                                        variant="flat"
                                        color="default"
                                        onPress={() => navigate(`/creator/courses/${id}/quizzes`)}
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
                                        Create Quiz
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
