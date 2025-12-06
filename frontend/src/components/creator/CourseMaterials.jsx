import React, { useState } from 'react';
import {
    Card, CardBody, Button, Tooltip, Chip, addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';
import { courseService } from '@/services';
import { motion } from 'framer-motion';
import { ConfirmModal, EmptyState } from '@/components/common';
import CreatorPageHeader from '@/components/creator/CreatorPageHeader';
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

function SortableMaterialCard({ material, index, onDelete, getIconForType, getColorForType }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: material.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="border border-gray-200 dark:border-gray-800 
                       hover:bg-gray-50/50 dark:hover:bg-gray-800/50
                       transition-colors"
        >
            <CardBody className="p-4">
                {/* Main wrapper: column on mobile, row on desktop */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">

                    {/* Drag + Type group */}
                    <div className="flex items-center gap-3">
                        <Button
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing p-1 
                                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            isIconOnly
                            size="sm"
                            style={{ touchAction: "none" }}
                            aria-label="Drag to reorder"
                        >
                            <Icon icon="mdi:drag-vertical" className="text-gray-400 text-xl" />
                        </Button>

                        <Chip
                            startContent={<Icon icon={getIconForType(material.type)} />}
                            variant="flat"
                            size="sm"
                            className={getColorForType(material.type)}
                        >
                            {material.type.toUpperCase()}
                        </Chip>
                    </div>

                    {/* Title + description */}
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                            {material.title}
                        </p>
                        {material.description && (
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {material.description}
                            </p>
                        )}
                    </div>

                    {/* Duration + Delete (push below on mobile) */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {material.duration
                                ? `${material.duration} min`
                                : material.fileSize
                                    ? `${(material.fileSize / 1024 / 1024).toFixed(2)} MB`
                                    : "-"}
                        </span>

                        <Tooltip content="Delete">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                onPress={() => onDelete(material.id)}
                                aria-label="Delete Material"
                            >
                                <Icon icon="mdi:trash-can" className="text-lg" />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}


export default function CourseMaterials({ courseId, materials = [] }) {
    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedMaterialId, setSelectedMaterialId] = useState(null);
    const [localMaterials, setLocalMaterials] = useState(materials);
    const [isReordering, setIsReordering] = useState(false);

    // Update local materials when prop changes
    React.useEffect(() => {
        setLocalMaterials(materials);
    }, [materials]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDelete = (materialId) => {
        setSelectedMaterialId(materialId);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        try {
            await courseService.deleteCourseMaterial(courseId, selectedMaterialId);
            addToast({ title: 'Success', description: 'Material deleted successfully', color: 'success' });
        } catch (error) {
            console.error('Error deleting material:', error);
            addToast({ title: 'Error', description: 'Failed to delete material', color: 'danger' });
        } finally {
            setShowConfirmModal(false);
            setSelectedMaterialId(null);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = localMaterials.findIndex((m) => m.id === active.id);
            const newIndex = localMaterials.findIndex((m) => m.id === over.id);

            const newMaterials = arrayMove(localMaterials, oldIndex, newIndex);
            setLocalMaterials(newMaterials);

            // Update order in backend
            try {
                setIsReordering(true);
                const materialsWithOrder = newMaterials.map((material, index) => ({
                    id: material.id,
                    order: index
                }));
                await courseService.updateMaterialOrder(courseId, materialsWithOrder);
                addToast({ title: 'Success', description: 'Order updated', color: 'success' });
            } catch (error) {
                console.error('Error updating material order:', error);
                addToast({ title: 'Error', description: 'Failed to update order', color: 'danger' });
                // Revert on error
                setLocalMaterials(materials);
            } finally {
                setIsReordering(false);
            }
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
            <CreatorPageHeader
                title="Course Materials"
                subtitle="Manage and organize course content and resources"
                icon="mdi:folder-multiple"
                variant="material"
                actions={[
                    {
                        label: "Add Material",
                        icon: "mdi:upload",
                        onClick: () => navigate(`/creator/courses/${courseId}/materials/create`),
                        color: "primary",
                        className: "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
                    }
                ]}
            />

            {localMaterials.length === 0 ? (
                <motion.div variants={itemVariants}>
                    <EmptyState
                        icon="mdi:folder-open-outline"
                        title="No materials uploaded yet"
                        description="Upload videos, documents, or links for your course"
                        actionLabel="Upload First Material"
                        onAction={() => navigate(`/creator/courses/${courseId}/materials/create`)}
                    />
                </motion.div>
            ) : (
                <motion.div variants={itemVariants}>
                    <Card className="border border-gray-200/60 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />
                        <CardBody className="p-2 lg:p-4">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={localMaterials.map(m => m.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {localMaterials.map((material, index) => (
                                            <SortableMaterialCard
                                                key={material.id}
                                                material={material}
                                                index={index}
                                                onDelete={handleDelete}
                                                getIconForType={getIconForType}
                                                getColorForType={getColorForType}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </CardBody>
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
