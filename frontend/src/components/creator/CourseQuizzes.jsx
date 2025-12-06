import React, { useState } from 'react';
import {
    Card, CardBody, Button,
    Chip, Tooltip, addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { assessmentService } from '@/services';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ConfirmModal, EmptyState } from '@/components/common';
import CreatorPageHeader from '@/components/creator/CreatorPageHeader';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function CourseQuizzes({ courseId, quizzes = [], onUpdate }) {
    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState(null);

    const handleDeleteQuiz = (id) => {
        setSelectedQuizId(id);
        setShowConfirmModal(true);
    };

    const confirmDeleteQuiz = async () => {
        try {
            await assessmentService.deleteQuiz(selectedQuizId);
            addToast({ title: 'Success', description: 'Quiz deleted successfully', color: 'success' });
            onUpdate();
        } catch (error) {
            console.error('Error deleting quiz:', error);
            addToast({ title: 'Error', description: 'Failed to delete quiz', color: 'danger' });
        } finally {
            setShowConfirmModal(false);
            setSelectedQuizId(null);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
        >
            <CreatorPageHeader
                title="Quizzes"
                subtitle="Create and manage course quizzes and assessments."
                icon="mdi:quiz"
                variant="quiz"
                actions={[
                    {
                        label: "Create Quiz",
                        icon: "mdi:plus",
                        onClick: () => navigate(`/creator/courses/${courseId}/quizzes/create`),
                        color: "secondary",
                        className: "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
                    }
                ]}
            />

            <motion.div variants={containerVariants} className="grid gap-4">
                {quizzes.length === 0 ? (
                    <motion.div variants={itemVariants}>
                        <EmptyState
                            icon="mdi:quiz"
                            title="No quizzes yet"
                            description="Create a quiz to assess your students."
                            actionLabel="Create First Quiz"
                            onAction={() => navigate(`/creator/courses/${courseId}/quizzes/create`)}
                        />
                    </motion.div>
                ) : (
                    quizzes.map((quiz, index) => (
                        <motion.div key={quiz.id} variants={itemVariants}>
                            <Card className="border border-gray-200/60 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
                                <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardBody className="p-5">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2 flex-1">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{quiz.title}</h4>
                                            <p className="text-sm text-gray-500 line-clamp-2">{quiz.description}</p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                                    startContent={<Icon icon="mdi:check-circle-outline" className="text-xs" />}
                                                >
                                                    Pass: {quiz.passingScore}%
                                                </Chip>
                                                {quiz.timeLimit && (
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                                        startContent={<Icon icon="mdi:timer-outline" className="text-xs" />}
                                                    >
                                                        {quiz.timeLimit} min
                                                    </Chip>
                                                )}
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                                                    startContent={<Icon icon="mdi:help-circle-outline" className="text-xs" />}
                                                >
                                                    {quiz.questionCount || 0} Questions
                                                </Chip>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Tooltip content="Manage Questions">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    onPress={() => navigate(`/creator/courses/${courseId}/quizzes/${quiz.id}/questions`)}
                                                    aria-label="Manage Questions"
                                                >
                                                    <Icon icon="mdi:format-list-checks" className="text-lg" />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="Edit Quiz">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    className="text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                                                    onPress={() => navigate(`/creator/courses/${courseId}/quizzes/${quiz.id}/edit`)}
                                                    aria-label="Edit Quiz"
                                                >
                                                    <Icon icon="mdi:pencil" className="text-lg" />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="Delete Quiz">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                    onPress={() => handleDeleteQuiz(quiz.id)}
                                                    aria-label="Delete Quiz"
                                                >
                                                    <Icon icon="mdi:trash-can" className="text-lg" />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmDeleteQuiz}
                title="Delete Quiz"
                message="Are you sure you want to delete this quiz? All questions will also be deleted."
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="danger"
                icon="mdi:quiz"
            />
        </motion.div>
    );
}
