import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Chip, Skeleton, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { assessmentService } from '@/services';
import { ConfirmModal, EmptyState } from '@/components/common';
import CreatorPageHeader from '@/components/creator/CreatorPageHeader';
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
                            aria-label="Drag to reorder"
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
                        aria-label="Delete question"
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
            addToast({ title: 'Error', description: 'Failed to fetch questions', color: 'danger' });
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
            addToast({ title: 'Success', description: 'Question deleted successfully', color: 'success' });
            fetchQuestions();
        } catch (error) {
            console.error('Error deleting question:', error);
            addToast({ title: 'Error', description: 'Failed to delete question', color: 'danger' });
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
                addToast({ title: 'Success', description: 'Order updated', color: 'success' });
            } catch (error) {
                console.error('Error updating question order:', error);
                addToast({ title: 'Error', description: 'Failed to update order', color: 'danger' });
                // Revert on error
                setLocalQuestions(questions);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                            <Skeleton className="rounded-xl w-10 h-10" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-40 rounded-lg" />
                                <Skeleton className="h-4 w-60 rounded-lg" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-32 rounded-lg" />
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                    </div>
                </div>
            </div>
        );
    }

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
                <CreatorPageHeader
                    title="Quiz Questions"
                    subtitle="Manage and reorder quiz questions"
                    icon="mdi:help-circle-multiple"
                    backUrl={`/creator/courses/${id}/quizzes`}
                    backLabel="Back to Quizzes"
                    variant="quiz"
                    actions={[
                        {
                            label: "Add Question",
                            icon: "mdi:plus",
                            onClick: () => navigate(`/creator/courses/${id}/quizzes/${quizId}/questions/create`),
                            color: "primary"
                        }
                    ]}
                />

                {/* Questions List */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
                >
                    {localQuestions.length === 0 ? (
                        <EmptyState
                            icon="mdi:help-circle-outline"
                            title="No questions added yet"
                            description="Create a question to start building your quiz."
                            actionLabel="Add First Question"
                            onAction={() => navigate(`/creator/courses/${id}/quizzes/${quizId}/questions/create`)}
                        />
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
        </motion.div>
    );
}
