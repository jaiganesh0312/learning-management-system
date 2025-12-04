import React, { useState } from 'react';
import {
    Card, CardBody, Button, Input, Textarea, Select, SelectItem,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Chip, Divider, Checkbox
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { assessmentService } from '@/services';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

const questionSchema = z.object({
    questionText: z.string().min(5, "Question must be at least 5 characters"),
    questionType: z.enum(['multiple_choice', 'true_false', 'short_answer']),
    options: z.array(z.string()).min(2, "At least 2 options required").optional(),
    correctAnswer: z.string().min(1, "Correct answer is required"),
    points: z.coerce.number().min(1, "Points must be at least 1"),
    order: z.coerce.number().optional(),
    explanation: z.string().optional(),
});

export default function CourseQuizzes({ courseId, quizzes = [], onUpdate }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isQuestionOpen, onOpen: onQuestionOpen, onClose: onQuestionClose } = useDisclosure();
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [editingQuiz, setEditingQuiz] = useState(null);

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

    const { control: questionControl, handleSubmit: handleQuestionSubmit, reset: resetQuestion, watch, formState: { errors: questionErrors, isSubmitting: isQuestionSubmitting } } = useForm({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            questionText: '',
            questionType: 'multiple_choice',
            options: ['', '', '', ''],
            correctAnswer: '',
            points: 10,
            order: 0,
            explanation: ''
        }
    });

    const questionType = watch('questionType');

    const handleCreateQuiz = () => {
        setEditingQuiz(null);
        setQuestions([]);
        reset({
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
        });
        onOpen();
    };

    const handleEditQuiz = async (quiz) => {
        setEditingQuiz(quiz);
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

        // Fetch questions for this quiz
        try {
            const response = await assessmentService.getQuizQuestions(quiz.id);
            if (response?.data?.success) {
                setQuestions(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching quiz questions:', error);
            setQuestions([]);
        }

        onOpen();
    };

    const onSubmitQuiz = async (data) => {
        try {
            const payload = {
                ...data,
                courseId,
                passingScore: parseInt(data.passingScore),
                timeLimit: data.timeLimit ? parseInt(data.timeLimit) : null,
                maxAttempts: data.maxAttempts ? parseInt(data.maxAttempts) : null,
                availableFrom: data.availableFrom || null,
                availableUntil: data.availableUntil || null,
            };

            if (editingQuiz) {
                await assessmentService.updateQuiz(editingQuiz.id, payload);
            } else {
                const response = await assessmentService.createQuiz(payload);
                if (response?.data?.success) {
                    setSelectedQuiz(response.data.data);
                }
            }

            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error saving quiz:', error);
        }
    };

    const handleDeleteQuiz = async (id) => {
        if (confirm('Are you sure you want to delete this quiz? All questions will also be deleted.')) {
            try {
                await assessmentService.deleteQuiz(id);
                onUpdate();
            } catch (error) {
                console.error('Error deleting quiz:', error);
            }
        }
    };

    const handleAddQuestion = () => {
        resetQuestion({
            questionText: '',
            questionType: 'multiple_choice',
            options: ['', '', '', ''],
            correctAnswer: '',
            points: 10,
            order: questions.length + 1,
            explanation: ''
        });
        onQuestionOpen();
    };

    const onSubmitQuestion = async (data) => {
        try {
            const payload = {
                ...data,
                quizId: editingQuiz?.id || selectedQuiz?.id,
                points: parseInt(data.points),
                options: data.questionType === 'multiple_choice' ? data.options.filter(opt => opt.trim()) : [],
                order: data.order || (questions.length + 1),
            };

            await assessmentService.createQuestion(payload);

            // Refresh questions
            const response = await assessmentService.getQuizQuestions(editingQuiz?.id || selectedQuiz?.id);
            if (response?.data?.success) {
                setQuestions(response.data.data || []);
            }

            onQuestionClose();
        } catch (error) {
            console.error('Error saving question:', error);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (confirm('Are you sure you want to delete this question?')) {
            try {
                await assessmentService.deleteQuestion(questionId);

                // Refresh questions
                const response = await assessmentService.getQuizQuestions(editingQuiz?.id || selectedQuiz?.id);
                if (response?.data?.success) {
                    setQuestions(response.data.data || []);
                }
            } catch (error) {
                console.error('Error deleting question:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quizzes</h3>
                    <p className="text-sm text-gray-500">Create and manage course quizzes and assessments.</p>
                </div>
                <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={handleCreateQuiz}>
                    Create Quiz
                </Button>
            </div>

            <div className="grid gap-4">
                {quizzes.length === 0 ? (
                    <Card className="border border-dashed border-gray-300 dark:border-gray-700 bg-transparent shadow-none">
                        <CardBody className="py-12 flex flex-col items-center text-center text-gray-500">
                            <Icon icon="mdi:quiz" className="text-4xl mb-3 opacity-50" />
                            <p className="font-medium">No quizzes yet</p>
                            <p className="text-sm">Create a quiz to assess your students.</p>
                        </CardBody>
                    </Card>
                ) : (
                    quizzes.map((quiz) => (
                        <Card key={quiz.id} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                            <CardBody className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1 flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{quiz.title}</h4>
                                        <p className="text-sm text-gray-500 line-clamp-2">{quiz.description}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Chip size="sm" variant="flat" color="success" startContent={<Icon icon="mdi:check-circle-outline" />}>
                                                Pass: {quiz.passingScore}%
                                            </Chip>
                                            {quiz.timeLimit && (
                                                <Chip size="sm" variant="flat" color="warning" startContent={<Icon icon="mdi:timer-outline" />}>
                                                    {quiz.timeLimit} min
                                                </Chip>
                                            )}
                                            <Chip size="sm" variant="flat" color="primary" startContent={<Icon icon="mdi:help-circle-outline" />}>
                                                {quiz.questionCount || 0} Questions
                                            </Chip>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button isIconOnly size="sm" variant="light" onPress={() => handleEditQuiz(quiz)}>
                                            <Icon icon="mdi:pencil" className="text-lg text-gray-500" />
                                        </Button>
                                        <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => handleDeleteQuiz(quiz.id)}>
                                            <Icon icon="mdi:trash-can" className="text-lg" />
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                )}
            </div>

            {/* Quiz Creation/Edit Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="outside">
                <ModalContent>
                    <form onSubmit={handleSubmit(onSubmitQuiz)}>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:quiz" className="text-2xl text-primary" />
                                <span>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</span>
                            </div>
                        </ModalHeader>
                        <ModalBody className="gap-6">
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
                                                        {...field}
                                                        checked={field.value}
                                                        onChange={field.onChange}

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
                                                        {...field}

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
                                                        {...field}
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
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            {editingQuiz && (
                                <>
                                    <Divider className="my-2" />

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">Questions</h4>
                                            <Button size="sm" color="primary" variant="flat" startContent={<Icon icon="mdi:plus" />} onPress={handleAddQuestion}>
                                                Add Question
                                            </Button>
                                        </div>

                                        {questions.length === 0 ? (
                                            <div className="text-center py-6 text-gray-500">
                                                <Icon icon="mdi:help-circle-outline" className="text-3xl mb-2 opacity-50" />
                                                <p className="text-sm">No questions added yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {questions.map((q, idx) => (
                                                    <Card key={q.id} className="border border-gray-200 dark:border-gray-800">
                                                        <CardBody className="p-3">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-sm">
                                                                        <span className="text-gray-400 mr-2">{idx + 1}.</span>
                                                                        {q.questionText}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <Chip size="sm" variant="flat">{q.questionType?.replace('_', ' ')}</Chip>
                                                                        <Chip size="sm" variant="flat" color="primary">{q.points} pts</Chip>
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
                                    </div>
                                </>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" color="primary" isLoading={isSubmitting}>
                                {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>

            {/* Question Modal */}
            <Modal isOpen={isQuestionOpen} onClose={onQuestionClose} size="xl" >
                <ModalContent>
                    <form onSubmit={handleQuestionSubmit(onSubmitQuestion)}>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:help-circle-outline" className="text-2xl text-primary" />
                                <span>Add Question</span>
                            </div>
                        </ModalHeader>
                        <ModalBody className="gap-6">
                            <Controller
                                name="questionText"
                                control={questionControl}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        isRequired
                                        label="Question"
                                        placeholder="Enter your question here..."
                                        variant="bordered"
                                        labelPlacement="outside"
                                        minRows={2}
                                        isInvalid={!!questionErrors.questionText}
                                        errorMessage={questionErrors.questionText?.message}
                                    />
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    name="questionType"
                                    control={questionControl}
                                    render={({ field }) => (
                                        <Select
                                            label="Question Type"
                                            placeholder="Select type"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            selectedKeys={field.value ? [field.value] : []}
                                            onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                            startContent={<Icon icon="mdi:format-list-bulleted-type" className="text-gray-400" />}
                                            isInvalid={!!questionErrors.questionType}
                                            errorMessage={questionErrors.questionType?.message}
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
                                    control={questionControl}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            label="Points"
                                            placeholder="10"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            startContent={<Icon icon="mdi:star-outline" className="text-gray-400" />}
                                            isInvalid={!!questionErrors.points}
                                            errorMessage={questionErrors.points?.message}
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
                                            control={questionControl}
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
                                control={questionControl}
                                render={({ field }) => (
                                    questionType === 'multiple_choice' ? (
                                        <Select
                                            {...field}
                                            label="Correct Answer"
                                            placeholder="Select correct option"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            selectedKeys={field.value ? [field.value] : []}
                                            onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                            startContent={<Icon icon="mdi:check-circle-outline" className="text-success" />}
                                            isInvalid={!!questionErrors.correctAnswer}
                                            errorMessage={questionErrors.correctAnswer?.message}
                                        >
                                            {watch('options')?.filter(opt => opt?.trim()).map((opt, idx) => (
                                                <SelectItem key={opt} value={opt}>
                                                    {String.fromCharCode(65 + idx)}: {opt}
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
                                            selectedKeys={field.value ? [field.value] : []}
                                            onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                            startContent={<Icon icon="mdi:check-circle-outline" className="text-success" />}
                                            isInvalid={!!questionErrors.correctAnswer}
                                            errorMessage={questionErrors.correctAnswer?.message}
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
                                            isInvalid={!!questionErrors.correctAnswer}
                                            errorMessage={questionErrors.correctAnswer?.message}
                                        />
                                    )
                                )}
                            />

                            <Controller
                                name="explanation"
                                control={questionControl}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        label="Explanation (Optional)"
                                        placeholder="Explain why this is the correct answer..."
                                        variant="bordered"
                                        labelPlacement="outside"
                                        description="Shown to learners after quiz submission"
                                        minRows={2}
                                        isInvalid={!!questionErrors.explanation}
                                        errorMessage={questionErrors.explanation?.message}
                                    />
                                )}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onQuestionClose}>
                                Cancel
                            </Button>
                            <Button type="submit" color="primary" isLoading={isQuestionSubmitting}>
                                Add Question
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </div>
    );
}


