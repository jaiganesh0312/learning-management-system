import React from 'react';
import {
    Card, CardBody, Button,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Tooltip, Chip
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';
import { courseService } from '@/services';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ConfirmModal } from '@/components/common';

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

export default function CourseMaterials({ courseId, materials = [], onUpdate }) {
    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedMaterialId, setSelectedMaterialId] = useState(null);

    const handleDelete = (materialId) => {
        setSelectedMaterialId(materialId);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        try {
            await courseService.deleteCourseMaterial(courseId, selectedMaterialId);
            onUpdate();
        } catch (error) {
            console.error('Error deleting material:', error);
        } finally {
            setShowConfirmModal(false);
            setSelectedMaterialId(null);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'video': return 'mdi:video';
            case 'pdf': return 'mdi:file-pdf-box';
            case 'scorm': return 'mdi:package-variant-closed';
            case 'link': return 'mdi:link';
            default: return 'mdi:file';
        }
    };

    const getColorForType = (type) => {
        switch (type) {
            case 'video': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
            case 'pdf': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
            case 'scorm': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300';
            case 'link': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
        >
            <motion.div variants={itemVariants} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                        <Icon icon="mdi:folder-multiple" className="text-white text-lg" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Course Materials</h3>
                        <p className="text-sm text-gray-500">Upload and manage course content</p>
                    </div>
                </div>
                <Button
                    startContent={<Icon icon="mdi:upload" />}
                    onPress={() => navigate(`/creator/courses/${courseId}/materials/create`)}
                    className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
                >
                    Add Material
                </Button>
            </motion.div>

            {materials.length === 0 ? (
                <motion.div variants={itemVariants}>
                    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent shadow-none">
                        <CardBody className="py-16 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4">
                                <Icon icon="mdi:folder-open-outline" className="text-3xl text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No materials uploaded yet</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload videos, documents, or links for your course</p>
                            <Button
                                variant="flat"
                                startContent={<Icon icon="mdi:upload" />}
                                onPress={() => navigate(`/creator/courses/${courseId}/materials/create`)}
                                className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300"
                            >
                                Upload First Material
                            </Button>
                        </CardBody>
                    </Card>
                </motion.div>
            ) : (
                <motion.div variants={itemVariants}>
                    <Card className="border border-gray-200/60 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />
                        <Table aria-label="Course materials table" classNames={{
                            th: "bg-gray-50/80 dark:bg-gray-800/50"
                        }}>
                            <TableHeader>
                                <TableColumn>TYPE</TableColumn>
                                <TableColumn>TITLE</TableColumn>
                                <TableColumn>SIZE/DURATION</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {materials.map((material, index) => (
                                    <TableRow key={material.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <TableCell>
                                            <Chip
                                                startContent={<Icon icon={getIconForType(material.type)} />}
                                                variant="flat"
                                                className={getColorForType(material.type)}
                                            >
                                                {material.type.toUpperCase()}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{material.title}</p>
                                                <p className="text-tiny text-gray-500">{material.description}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {material.duration ? `${material.duration} min` :
                                                    material.fileSize ? `${(material.fileSize / 1024 / 1024).toFixed(2)} MB` : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Tooltip content="Delete">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                        onPress={() => handleDelete(material.id)}
                                                    >
                                                        <Icon icon="mdi:trash-can" className="text-lg" />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </motion.div>
            )}

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmDelete}
                title="Delete Material"
                message="Are you sure you want to delete this material? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="danger"
                icon="mdi:file-remove"
            />
        </motion.div>
    );
}
