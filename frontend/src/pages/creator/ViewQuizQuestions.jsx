import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { assessmentService } from '@/services';
import { LoadingSpinner, ConfirmModal } from '@/components/common';
import { motion } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Question Card Component
function SortableQuestionCard({ question, index, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="border border-gray-200 dark:border-gray-800"
        >
            <CardBody className="p-4">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3 flex-1">
                        <button
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mt-1"
                            style={{
                                touchAction: 'none',
                            }}
                        >
                            <Icon icon="mdi:drag-vertical" className="text-gray-400 text-xl" />
                        </button>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                                <span className="text-gray-400 mr-2">{index + 1}.</span>
                                {question.questionText}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <Chip size="sm" variant="flat">
                                    {question.questionType?.replace('_', ' ')}
                                </Chip>
                                <Chip size="sm" variant="flat" color="primary">
                                    {question.points} pts
                                </Chip>
                            </div>
                            {question.questionType === 'multiple_choice' && question.options && (
                                <div className="mt-3 space-y-1">
                                    {question.options.map((option, idx) => (
                                        <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <span className="font-medium">{String.fromCharCode(65 + idx)}:</span>
                                            <span>{option}</span>
                                            {option === question.correctAnswer && (
                                                <Icon icon="mdi:check-circle" className="text-success" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => onDelete(question.id)}
                    >
                        <Icon icon="mdi:trash-can" className="text-lg" />
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}

export default function ViewQuizQuestions() {
    const { id, quizId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [localQuestions, setLocalQuestions] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchQuestions();
    }, [quizId]);

    useEffect(() => {
        setLocalQuestions(questions);
    }, [questions]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await assessmentService.getQuizQuestions(quizId);
            if (response?.data?.success) {
                setQuestions(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            setQuestions([]);
        } finally {
            setLoading(false);
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

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = localQuestions.findIndex((q) => q.id === active.id);
            const newIndex = localQuestions.findIndex((q) => q.id === over.id);

            const newQuestions = arrayMove(localQuestions, oldIndex, newIndex);
            setLocalQuestions(newQuestions);

            // Update order in backend
            try {
                const questionsWithOrder = newQuestions.map((question, index) => ({
                    id: question.id,
                    order: index
                }));
                await assessmentService.updateQuestionOrder(quizId, questionsWithOrder);
            } catch (error) {
                console.error('Error updating question order:', error);
                // Revert on error
                setLocalQuestions(questions);
            }
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
                        onPress={() => navigate(`/creator/courses/${id}/quizzes/${quizId}/edit`)}
                        className="mb-4 text-gray-600 dark:text-gray-400"
                    >
                        Back to Edit Quiz
                    </Button>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                            <Icon icon="mdi:help-circle-multiple" className="text-4xl text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Quiz Questions
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage and reorder quiz questions
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
                </motion.div>

                {/* Questions List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {localQuestions.length === 0 ? (
                        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent shadow-none">
                            <CardBody className="py-16 flex flex-col items-center text-center">
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
                            </CardBody>
                        </Card>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={localQuestions.map(q => q.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    {localQuestions.map((q, idx) => (
                                        <SortableQuestionCard
                                            key={q.id}
                                            question={q}
                                            index={idx}
                                            onDelete={handleDeleteQuestion}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
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
