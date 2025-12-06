import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, CardBody, Button, Input, Textarea, Select, SelectItem, Tabs, Tab,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Chip
} from "@heroui/react";
import { learningPathService, courseService } from '@/services';
import { LoadingSpinner, ConfirmModal } from '@/components/common';
import CreatorPageHeader from '@/components/creator/CreatorPageHeader';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from 'framer-motion';

const learningPathSchema = z.object({
    name: z.string().min(5, "Name must be at least 5 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().min(2, "Category must be at least 2 characters"),
    type: z.enum(['certification', 'skill_track', 'onboarding']),
    duration: z.coerce.number().min(0, "Duration must be a positive number")
});

const courseAssignmentSchema = z.object({
    courseId: z.string().min(1, "Please select a course"),
    sequenceOrder: z.coerce.number().min(1, "Order must be at least 1"),
    isRequired: z.enum(['true', 'false'])
});

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

export default function EditLearningPath() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pathCourses, setPathCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(learningPathSchema),
        defaultValues: {
            name: '',
            description: '',
            category: '',
            type: 'certification',
            duration: ''
        }
    });

    const { control: courseControl, handleSubmit: handleCourseSubmit, reset: resetCourse, formState: { errors: courseErrors, isSubmitting: isCourseSaving } } = useForm({
        resolver: zodResolver(courseAssignmentSchema),
        defaultValues: {
            courseId: '',
            sequenceOrder: 1,
            isRequired: 'true'
        }
    });

    useEffect(() => {
        fetchLearningPath();
        fetchAvailableCourses();
    }, [id]);

    const fetchLearningPath = async () => {
        try {
            setLoading(true);
            const response = await learningPathService.getLearningPath(id);
            if (response?.data?.success) {
                const path = response.data.data;
                reset({
                    name: path.name,
                    description: path.description || '',
                    category: path.category || '',
                    type: path.type || 'certification',
                    duration: path.duration || ''
                });
                setPathCourses(path.courses || []);
            }
        } catch (error) {
            console.error('Error fetching learning path:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableCourses = async () => {
        try {
            const response = await courseService.getCourses();
            if (response?.data?.success) {
                setAvailableCourses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const onSubmit = async (data) => {
        try {
            await learningPathService.updateLearningPath(id, data);
            navigate('/creator/learning-paths');
        } catch (error) {
            console.error('Error updating learning path:', error);
        }
    };

    const handleAddCourse = () => {
        resetCourse({
            courseId: '',
            sequenceOrder: pathCourses.length + 1,
            isRequired: 'true'
        });
        onOpen();
    };

    const onSubmitCourse = async (data) => {
        try {
            await learningPathService.addCourseToPath(id, {
                courseId: data.courseId,
                sequenceOrder: parseInt(data.sequenceOrder),
                isRequired: data.isRequired === 'true'
            });
            await fetchLearningPath();
            onClose();
        } catch (error) {
            console.error('Error adding course:', error);
        }
    };

    const handleRemoveCourse = (courseId) => {
        setSelectedCourseId(courseId);
        setShowConfirmModal(true);
    };

    const confirmRemoveCourse = async () => {
        try {
            await learningPathService.removeCourseFromPath(id, selectedCourseId);
            await fetchLearningPath();
        } catch (error) {
            console.error('Error removing course:', error);
        } finally {
            setShowConfirmModal(false);
            setSelectedCourseId(null);
        }
    };

    if (loading) return <LoadingSpinner fullPage />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/20 py-8">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <motion.div variants={itemVariants}>
                    <CreatorPageHeader
                        title="Edit Learning Path"
                        subtitle="Manage learning path details and course assignments"
                        icon="mdi:road-variant"
                        variant="learningPath"
                        backUrl="/creator/learning-paths"
                        backLabel="Back to Learning Paths"
                    />
                </motion.div>

                <motion.div variants={itemVariants} className="mt-8">
                    <Tabs
                        aria-label="Learning Path Options"
                        color="secondary"
                        variant="underlined"
                        classNames={{
                            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-gradient-to-r from-purple-600 to-violet-600",
                            tab: "max-w-fit px-0 h-12",
                            tabContent: "group-data-[selected=true]:text-purple-600 dark:group-data-[selected=true]:text-purple-400 font-medium text-base"
                        }}
                    >
                        <Tab
                            key="details"
                            title={
                                <div className="flex items-center space-x-2">
                                    <Icon icon="mdi:information-outline" className="text-lg" />
                                    <span>Details</span>
                                </div>
                            }
                        >
                            <motion.form
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleSubmit(onSubmit)}
                                className="mt-6"
                            >
                                <Card className="border border-gray-200/60 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                                    <div className="h-1.5 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500" />
                                    <CardBody className="p-8 gap-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                                                <Icon icon="mdi:pencil-outline" className="text-2xl text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Path Details</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Update the basic information for this learning path.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-6">
                                            <Controller
                                                name="name"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        isRequired
                                                        label="Path Name"
                                                        placeholder="e.g., Full Stack Development"
                                                        variant="bordered"
                                                        labelPlacement="outside"
                                                        startContent={<Icon icon="mdi:road-variant" className="text-purple-500" />}
                                                        isInvalid={!!errors.name}
                                                        errorMessage={errors.name?.message}
                                                        classNames={{
                                                            label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                            inputWrapper: "hover:border-purple-400 focus-within:!border-purple-500"
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
                                                        isRequired
                                                        label="Description"
                                                        placeholder="Describe the learning path..."
                                                        variant="bordered"
                                                        labelPlacement="outside"
                                                        minRows={4}
                                                        isInvalid={!!errors.description}
                                                        errorMessage={errors.description?.message}
                                                        classNames={{
                                                            label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                            inputWrapper: "hover:border-purple-400 focus-within:!border-purple-500"
                                                        }}
                                                    />
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <Controller
                                                    name="category"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Category"
                                                            placeholder="e.g., Development"
                                                            variant="bordered"
                                                            labelPlacement="outside"
                                                            startContent={<Icon icon="mdi:tag-outline" className="text-violet-500" />}
                                                            isInvalid={!!errors.category}
                                                            errorMessage={errors.category?.message}
                                                            classNames={{
                                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                                inputWrapper: "hover:border-violet-400 focus-within:!border-violet-500"
                                                            }}
                                                        />
                                                    )}
                                                />

                                                <Controller
                                                    name="type"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            label="Type"
                                                            placeholder="Select type"
                                                            variant="bordered"
                                                            labelPlacement="outside"
                                                            selectedKeys={field.value ? [field.value] : []}
                                                            onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                                            startContent={<Icon icon="mdi:shape-outline" className="text-fuchsia-500" />}
                                                            isInvalid={!!errors.type}
                                                            errorMessage={errors.type?.message}
                                                            classNames={{
                                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                                trigger: "hover:border-fuchsia-400 focus:border-fuchsia-500"
                                                            }}
                                                        >
                                                            <SelectItem key="certification" startContent={<Icon icon="mdi:certificate" className="text-amber-500" />}>
                                                                Certification
                                                            </SelectItem>
                                                            <SelectItem key="skill_track" startContent={<Icon icon="mdi:trending-up" className="text-emerald-500" />}>
                                                                Skill Track
                                                            </SelectItem>
                                                            <SelectItem key="onboarding" startContent={<Icon icon="mdi:account-group" className="text-blue-500" />}>
                                                                Onboarding
                                                            </SelectItem>
                                                        </Select>
                                                    )}
                                                />

                                                <Controller
                                                    name="duration"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            label="Duration"
                                                            placeholder="e.g., 40"
                                                            variant="bordered"
                                                            labelPlacement="outside"
                                                            endContent={<span className="text-gray-400 text-sm">Hours</span>}
                                                            startContent={<Icon icon="mdi:clock-outline" className="text-purple-500" />}
                                                            isInvalid={!!errors.duration}
                                                            errorMessage={errors.duration?.message}
                                                            classNames={{
                                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                                inputWrapper: "hover:border-purple-400 focus-within:!border-purple-500"
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
                                                onPress={() => navigate('/creator/learning-paths')}
                                                className="font-medium"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                isLoading={isSubmitting}
                                                className="font-medium px-8 bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
                                                startContent={!isSubmitting && <Icon icon="mdi:content-save-outline" />}
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.form>
                        </Tab>

                        <Tab
                            key="courses"
                            title={
                                <div className="flex items-center space-x-2">
                                    <Icon icon="mdi:book-multiple-outline" className="text-lg" />
                                    <span>Courses</span>
                                    {pathCourses.length > 0 && (
                                        <Chip size="sm" variant="flat" className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                            {pathCourses.length}
                                        </Chip>
                                    )}
                                </div>
                            }
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-6 space-y-6"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Path Courses</h3>
                                        <p className="text-sm text-gray-500">Manage the courses in this learning path.</p>
                                    </div>
                                    <Button
                                        startContent={<Icon icon="mdi:plus" />}
                                        onPress={handleAddCourse}
                                        className="bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
                                    >
                                        Add Course
                                    </Button>
                                </div>

                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid gap-4"
                                >
                                    {pathCourses.length === 0 ? (
                                        <motion.div variants={cardVariants}>
                                            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent shadow-none">
                                                <CardBody className="py-16 flex flex-col items-center text-center">
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 flex items-center justify-center mb-4">
                                                        <Icon icon="mdi:book-outline" className="text-3xl text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No courses assigned yet</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add courses to build this learning path.</p>
                                                    <Button
                                                        variant="flat"
                                                        startContent={<Icon icon="mdi:plus" />}
                                                        onPress={handleAddCourse}
                                                        className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                                                    >
                                                        Add First Course
                                                    </Button>
                                                </CardBody>
                                            </Card>
                                        </motion.div>
                                    ) : (
                                        pathCourses.map((course, index) => (
                                            <motion.div key={course.id} variants={cardVariants}>
                                                <Card className="border border-gray-200/60 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300 group">
                                                    <CardBody className="p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex gap-4 items-start flex-1">
                                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold text-lg shadow-lg shadow-purple-500/25">
                                                                    {course.sequenceOrder || index + 1}
                                                                </div>
                                                                <div className="space-y-1 flex-1">
                                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h4>
                                                                    <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        {course.isRequired ? (
                                                                            <Chip size="sm" variant="flat" className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" startContent={<Icon icon="mdi:star" className="text-xs" />}>
                                                                                Required
                                                                            </Chip>
                                                                        ) : (
                                                                            <Chip size="sm" variant="flat" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                                                Optional
                                                                            </Chip>
                                                                        )}
                                                                        {course.level && (
                                                                            <Chip size="sm" variant="flat" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                                                {course.level}
                                                                            </Chip>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                                className="text-rose-600 opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                                                                onPress={() => handleRemoveCourse(course.id)}
                                                            >
                                                                <Icon icon="mdi:trash-can" className="text-lg" />
                                                            </Button>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </motion.div>
                                        ))
                                    )}
                                </motion.div>
                            </motion.div>
                        </Tab>
                    </Tabs>
                </motion.div>
            </motion.div>

            {/* Add Course Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg" backdrop="blur">
                <ModalContent>
                    <form onSubmit={handleCourseSubmit(onSubmitCourse)}>
                        <ModalHeader className="flex flex-col gap-1 pb-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                                    <Icon icon="mdi:book-plus-outline" className="text-xl text-white" />
                                </div>
                                <div>
                                    <span className="text-lg font-semibold">Add Course to Path</span>
                                    <p className="text-sm text-gray-500 font-normal">Select a course to include in this learning path</p>
                                </div>
                            </div>
                        </ModalHeader>
                        <ModalBody className="gap-6 py-6">
                            <Controller
                                name="courseId"
                                control={courseControl}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        isRequired
                                        label="Select Course"
                                        placeholder="Choose a course"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        selectedKeys={field.value ? [field.value] : []}
                                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                        startContent={<Icon icon="mdi:book-outline" className="text-purple-500" />}
                                        isInvalid={!!courseErrors.courseId}
                                        errorMessage={courseErrors.courseId?.message}
                                        classNames={{
                                            trigger: "hover:border-purple-400 focus:border-purple-500"
                                        }}
                                    >
                                        {availableCourses.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.title}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    name="sequenceOrder"
                                    control={courseControl}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            label="Sequence Order"
                                            placeholder="1"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            startContent={<Icon icon="mdi:order-numeric-ascending" className="text-violet-500" />}
                                            isInvalid={!!courseErrors.sequenceOrder}
                                            errorMessage={courseErrors.sequenceOrder?.message}
                                            classNames={{
                                                inputWrapper: "hover:border-violet-400 focus-within:!border-violet-500"
                                            }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="isRequired"
                                    control={courseControl}
                                    render={({ field }) => (
                                        <Select
                                            label="Requirement"
                                            placeholder="Select"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            selectedKeys={field.value ? [field.value] : []}
                                            onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                            startContent={<Icon icon="mdi:flag-outline" className="text-fuchsia-500" />}
                                            isInvalid={!!courseErrors.isRequired}
                                            errorMessage={courseErrors.isRequired?.message}
                                            classNames={{
                                                trigger: "hover:border-fuchsia-400 focus:border-fuchsia-500"
                                            }}
                                        >
                                            <SelectItem key="true" startContent={<Icon icon="mdi:star" className="text-rose-500" />}>
                                                Required
                                            </SelectItem>
                                            <SelectItem key="false" startContent={<Icon icon="mdi:circle-outline" className="text-gray-400" />}>
                                                Optional
                                            </SelectItem>
                                        </Select>
                                    )}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter className="border-t border-gray-100 dark:border-gray-800">
                            <Button variant="flat" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isCourseSaving}
                                className="bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25"
                            >
                                Add Course
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmRemoveCourse}
                title="Remove Course"
                message="Are you sure you want to remove this course from the learning path?"
                confirmText="Remove"
                cancelText="Cancel"
                confirmColor="danger"
                icon="mdi:book-remove"
            />
        </div>
    );
}
