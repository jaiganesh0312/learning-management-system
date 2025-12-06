import React from 'react';
import {
    Card, CardBody, Button,
    Chip
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { assessmentService } from '@/services';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ConfirmModal } from '@/components/common';
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

export default function CourseAssignments({ courseId, assignments = [], onUpdate }) {
    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

    const handleDelete = (id) => {
        setSelectedAssignmentId(id);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        try {
            await assessmentService.deleteAssignment(selectedAssignmentId);
            onUpdate();
        } catch (error) {
            console.error('Error deleting assignment:', error);
        } finally {
            setShowConfirmModal(false);
            setSelectedAssignmentId(null);
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
                title="Assignments"
                subtitle="Create and manage course assignments and projects"
                icon="mdi:clipboard-text"
                variant="assignment"
                actions={[
                    {
                        label: "Create Assignment",
                        icon: "mdi:plus",
                        onClick: () => navigate(`/creator/courses/${courseId}/assignments/create`),
                        className: "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow"
                    }
                ]}
            />

            <motion.div variants={containerVariants} className="grid gap-4">
                {assignments.length === 0 ? (
                    <motion.div variants={itemVariants}>
                        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent shadow-none">
                            <CardBody className="py-16 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mb-4">
                                    <Icon icon="mdi:clipboard-text" className="text-3xl text-amber-600 dark:text-amber-400" />
                                </div>
                                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No assignments yet</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create an assignment for your students to submit.</p>
                                <Button
                                    variant="flat"
                                    startContent={<Icon icon="mdi:plus" />}
                                    onPress={() => navigate(`/creator/courses/${courseId}/assignments/create`)}
                                    className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                >
                                    Create First Assignment
                                </Button>
                            </CardBody>
                        </Card>
                    </motion.div>
                ) : (
                    assignments.map((assignment, index) => (
                        <motion.div key={assignment.id} variants={itemVariants}>
                            <Card className="border border-gray-200/60 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
                                <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardBody className="p-5">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2 flex-1">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{assignment.title}</h4>
                                            <p className="text-sm text-gray-500 line-clamp-2">{assignment.description || assignment.instructions}</p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                                    startContent={<Icon icon="mdi:star-outline" className="text-xs" />}
                                                >
                                                    {assignment.maxScore} points
                                                </Chip>
                                                {assignment.dueDate && (
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                                        startContent={<Icon icon="mdi:calendar-clock" className="text-xs" />}
                                                    >
                                                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                    </Chip>
                                                )}
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                                    startContent={<Icon icon="mdi:file-upload" className="text-xs" />}
                                                >
                                                    {assignment.submissionType}
                                                </Chip>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                onPress={() => navigate(`/creator/courses/${courseId}/assignments/${assignment.id}/edit`)}
                                            >
                                                <Icon icon="mdi:pencil" className="text-lg" />
                                            </Button>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                onPress={() => handleDelete(assignment.id)}
                                            >
                                                <Icon icon="mdi:trash-can" className="text-lg" />
                                            </Button>
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
                onConfirm={confirmDelete}
                title="Delete Assignment"
                message="Are you sure you want to delete this assignment? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="danger"
                icon="mdi:clipboard-remove"
            />
        </motion.div>
    );
}
