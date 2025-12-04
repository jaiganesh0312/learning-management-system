import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input, Textarea, Checkbox, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { assessmentService } from '@/services';
import { LoadingSpinner, ConfirmModal } from '@/components/common';
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

export default function EditCourseQuiz() {
    const { id, quizId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
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

    useEffect(() => {
        fetchQuiz();
        fetchQuestions();
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const response = await assessmentService.getQuiz(quizId);
            if (response?.data?.success) {
                const quiz = response.data.data;
                reset({
                    title: quiz.title,
                    description: quiz.description || '',
                    passingScore: quiz.passingScore || 70,
                    timeLimit: quiz.timeLimit || '',
                    maxAttempts: quiz.maxAttempts || '',
                    isRequired: quiz.isRequired || false,
                    randomizeQuestions: quiz.randomizeQuestions || false,
                    showCorrectAnswers: quiz.showCorrectAnswers !== undefined ? quiz.showCorrectAnswers : true,
                    availableFrom: quiz.availableFrom ? new Date(quiz.availableFrom).toISOString().split('T')[0] : '',
                    availableUntil: quiz.availableUntil ? new Date(quiz.availableUntil).toISOString().split('T')[0] : ''
                });
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await assessmentService.getQuizQuestions(quizId);
            if (response?.data?.success) {
                setQuestions(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            setQuestions([]);
        }
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                passingScore: parseInt(data.passingScore),
                timeLimit: data.timeLimit ? parseInt(data.timeLimit) : null,
                maxAttempts: data.maxAttempts ? parseInt(data.maxAttempts) : null,
                availableFrom: data.availableFrom || null,
                availableUntil: data.availableUntil || null,
            };

            await assessmentService.updateQuiz(quizId, payload);
            navigate(`/creator/courses/${id}/quizzes`);
        } catch (error) {
            console.error('Error updating quiz:', error);
        }
    };

    const handleDeleteQuestion = (questionId) => {
        setSelectedQuestionId(questionId);
        setShowConfirmModal(true);
    };

    const confirmDeleteQuestion = async () => {
        try {
            await assessmentService.deleteQuestion(selectedQuestionId);
            fetchQuestions();
        } catch (error) {
            console.error('Error deleting question:', error);
        } finally {
            setShowConfirmModal(false);
            setSelectedQuestionId(null);
        }
    };

    if (loading) return <LoadingSpinner fullPage />;

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
                            <Icon icon="mdi:pencil" className="text-4xl text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Edit Quiz
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Update quiz details and manage questions
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="space-y-6"
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
                                        startContent={!isSubmitting && <Icon icon="mdi:content-save" />}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </form>

                    {/* Questions Section */}
                    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                        <CardBody className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Questions</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Manage quiz questions and their answers
                                    </p>
                                </div>
                                <Button
                                    color="primary"
                                    startContent={<Icon icon="mdi:plus" />}
                                    onPress={() => navigate(`/creator/courses/${id}/quizzes/${quizId}/questions/create`)}
                                    className="font-medium"
                                >
                                    Add Question
                                </Button>
                            </div>

                            {questions.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                    <Icon icon="mdi:help-circle-outline" className="text-4xl text-gray-400 mb-2" />
                                    <p className="text-gray-500 dark:text-gray-400 mb-3">No questions added yet</p>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="primary"
                                        startContent={<Icon icon="mdi:plus" />}
                                        onPress={() => navigate(`/creator/courses/${id}/quizzes/${quizId}/questions/create`)}
                                    >
                                        Add First Question
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {questions.map((q, idx) => (
                                        <Card key={q.id} className="border border-gray-200 dark:border-gray-800">
                                            <CardBody className="p-4">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            <span className="text-gray-400 mr-2">{idx + 1}.</span>
                                                            {q.questionText}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Chip size="sm" variant="flat">
                                                                {q.questionType?.replace('_', ' ')}
                                                            </Chip>
                                                            <Chip size="sm" variant="flat" color="primary">
                                                                {q.points} pts
                                                            </Chip>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        color="danger"
                                                        variant="light"
                                                        onPress={() => handleDeleteQuestion(q.id)}
                                                    >
                                                        <Icon icon="mdi:trash-can" className="text-lg" />
                                                    </Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmDeleteQuestion}
                title="Delete Question"
                message="Are you sure you want to delete this question? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="danger"
                icon="mdi:help-circle-remove"
            />
        </div>
    );
}
