import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { assessmentService } from '@/services';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from 'framer-motion';

const questionSchema = z.object({
    questionText: z.string().min(5, "Question must be at least 5 characters"),
    questionType: z.enum(['multiple_choice', 'true_false', 'short_answer']),
    options: z.array(z.string()).min(2, "At least 2 options required").optional(),
    correctAnswer: z.string().min(1, "Correct answer is required"),
    points: z.coerce.number().min(1, "Points must be at least 1"),
    explanation: z.string().optional(),
});

export default function CreateQuizQuestion() {
    const { id, quizId } = useParams();
    const navigate = useNavigate();

    const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            questionText: '',
            questionType: 'multiple_choice',
            options: ['', '', '', ''],
            correctAnswer: '',
            points: 10,
            explanation: ''
        }
    });

    const questionType = watch('questionType');

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                points: parseInt(data.points),
                options: data.questionType === 'multiple_choice' ? data.options.filter(opt => opt.trim()) : [],
            };

            await assessmentService.addQuestion(quizId, payload);
            navigate(`/creator/courses/${id}/quizzes/${quizId}/questions`);
        } catch (error) {
            console.error('Error creating question:', error);
        }
    };

    const onError = (error) => {
        console.error('Error creating question:', error);
    };

    return (
        <motion.div
            className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
        >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
                >
                    <Button
                        variant="light"
                        startContent={<Icon icon="mdi:arrow-left" className="text-xl" />}
                        onPress={() => navigate(`/creator/courses/${id}/quizzes/${quizId}/edit`)}
                        className="mb-4 text-gray-600 dark:text-gray-400"
                    >
                        Back to Edit Quiz
                    </Button>
                </motion.div>

                {/* Header */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <Icon icon="mdi:help-circle-outline" className="text-white text-lg" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Add Question
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Create a new question for this quiz
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
                >
                    <form onSubmit={handleSubmit(onSubmit, onError)}>
                        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                            <CardBody className="p-8 gap-6">
                                <Controller
                                    name="questionText"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            isRequired
                                            label="Question"
                                            placeholder="Enter your question here..."
                                            variant="bordered"
                                            labelPlacement="outside"
                                            minRows={2}
                                            isInvalid={!!errors.questionText}
                                            errorMessage={errors.questionText?.message}
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                            }}
                                        />
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Controller
                                        name="questionType"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                label="Question Type"
                                                placeholder="Select type"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                selectedKeys={field.value ? [field.value] : []}
                                                onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                                startContent={<Icon icon="mdi:format-list-bulleted-type" className="text-gray-400" />}
                                                isInvalid={!!errors.questionType}
                                                errorMessage={errors.questionType?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            >
                                                <SelectItem key="multiple_choice" startContent={<Icon icon="mdi:checkbox-multiple-marked-circle-outline" />}>
                                                    Multiple Choice
                                                </SelectItem>
                                                <SelectItem key="true_false" startContent={<Icon icon="mdi:check-decagram-outline" />}>
                                                    True/False
                                                </SelectItem>
                                                <SelectItem key="short_answer" startContent={<Icon icon="mdi:text-box-outline" />}>
                                                    Short Answer
                                                </SelectItem>
                                            </Select>
                                        )}
                                    />

                                    <Controller
                                        name="points"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                label="Points"
                                                placeholder="10"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:star-outline" className="text-gray-400" />}
                                                isInvalid={!!errors.points}
                                                errorMessage={errors.points?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                {questionType === 'multiple_choice' && (
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Answer Options</label>
                                        {[0, 1, 2, 3].map((idx) => (
                                            <Controller
                                                key={idx}
                                                name={`options.${idx}`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        placeholder={`Option ${idx + 1}`}
                                                        variant="bordered"
                                                        startContent={
                                                            <Chip size="sm" variant="flat" className="mr-1">
                                                                {String.fromCharCode(65 + idx)}
                                                            </Chip>
                                                        }
                                                    />
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}

                                <Controller
                                    name="correctAnswer"
                                    control={control}
                                    render={({ field }) => (
                                        questionType === 'multiple_choice' ? (
                                            <Select
                                                {...field}
                                                label="Correct Answer"
                                                placeholder="Select correct option"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:check-circle-outline" className="text-success" />}
                                                isInvalid={!!errors.correctAnswer}
                                                errorMessage={errors.correctAnswer?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            >
                                                {watch('options')?.filter(opt => opt?.trim()).map((opt, idx) => ({ label: String.fromCharCode(65 + idx) + ': ' + opt, value: opt })).map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        ) : questionType === 'true_false' ? (
                                            <Select
                                                {...field}
                                                label="Correct Answer"
                                                placeholder="Select answer"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:check-circle-outline" className="text-success" />}
                                                isInvalid={!!errors.correctAnswer}
                                                errorMessage={errors.correctAnswer?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            >
                                                <SelectItem key="true">True</SelectItem>
                                                <SelectItem key="false">False</SelectItem>
                                            </Select>
                                        ) : (
                                            <Input
                                                {...field}
                                                label="Correct Answer"
                                                placeholder="Enter the correct answer"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:check-circle-outline" className="text-success" />}
                                                isInvalid={!!errors.correctAnswer}
                                                errorMessage={errors.correctAnswer?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            />
                                        )
                                    )}
                                />

                                <Controller
                                    name="explanation"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            label="Explanation (Optional)"
                                            placeholder="Explain why this is the correct answer..."
                                            variant="bordered"
                                            labelPlacement="outside"
                                            description="Shown to learners after quiz submission"
                                            minRows={2}
                                            isInvalid={!!errors.explanation}
                                            errorMessage={errors.explanation?.message}
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                            }}
                                        />
                                    )}
                                />

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <Button
                                        variant="flat"
                                        color="default"
                                        onPress={() => navigate(`/creator/courses/${id}/quizzes/${quizId}/edit`)}
                                        className="font-medium"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isLoading={isSubmitting}
                                        className="font-medium px-8"
                                        startContent={!isSubmitting && <Icon icon="mdi:plus" />}
                                    >
                                        Add Question
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
}
