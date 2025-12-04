import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, CardBody, Button, Input, Textarea, Select, SelectItem, Tabs, Tab,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Chip
} from "@heroui/react";
import { learningPathService, courseService } from '@/services';
import { PageHeader, LoadingSpinner } from '@/components/common';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Icon } from "@iconify/react";

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

export default function EditLearningPath() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pathCourses, setPathCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();

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

    const handleRemoveCourse = async (courseId) => {
        if (confirm('Are you sure you want to remove this course from the learning path?')) {
            try {
                await learningPathService.removeCourseFromPath(id, courseId);
                await fetchLearningPath();
            } catch (error) {
                console.error('Error removing course:', error);
            }
        }
    };

    if (loading) return <LoadingSpinner fullPage />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Edit Learning Path"
                    description="Manage learning path details and course assignments."
                    icon="mdi:road-variant"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Learning Paths', href: '/creator/learning-paths' },
                        { label: 'Edit' }
                    ]}
                />

                <div className="mt-8">
                    <Tabs
                        aria-label="Learning Path Options"
                        color="primary"
                        variant="underlined"
                        classNames={{
                            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-primary",
                            tab: "max-w-fit px-0 h-12",
                            tabContent: "group-data-[selected=true]:text-primary font-medium text-base"
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
                            <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
                                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                                    <CardBody className="p-8 gap-8">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Path Details</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Update the basic information for this learning path.
                                            </p>
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
                                                        startContent={<Icon icon="mdi:road-variant" className="text-gray-400" />}
                                                        isInvalid={!!errors.name}
                                                        errorMessage={errors.name?.message}
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
                                                        isRequired
                                                        label="Description"
                                                        placeholder="Describe the learning path..."
                                                        variant="bordered"
                                                        labelPlacement="outside"
                                                        minRows={4}
                                                        isInvalid={!!errors.description}
                                                        errorMessage={errors.description?.message}
                                                        classNames={{
                                                            label: "text-sm font-medium text-gray-700 dark:text-gray-300"
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
                                                            startContent={<Icon icon="mdi:tag-outline" className="text-gray-400" />}
                                                            isInvalid={!!errors.category}
                                                            errorMessage={errors.category?.message}
                                                            classNames={{
                                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
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
                                                            startContent={<Icon icon="mdi:shape-outline" className="text-gray-400" />}
                                                            isInvalid={!!errors.type}
                                                            errorMessage={errors.type?.message}
                                                            classNames={{
                                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                            }}
                                                        >
                                                            <SelectItem key="certification" startContent={<Icon icon="mdi:certificate" className="text-warning" />}>
                                                                Certification
                                                            </SelectItem>
                                                            <SelectItem key="skill_track" startContent={<Icon icon="mdi:trending-up" className="text-success" />}>
                                                                Skill Track
                                                            </SelectItem>
                                                            <SelectItem key="onboarding" startContent={<Icon icon="mdi:account-group" className="text-primary" />}>
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
                                                            startContent={<Icon icon="mdi:clock-outline" className="text-gray-400" />}
                                                            isInvalid={!!errors.duration}
                                                            errorMessage={errors.duration?.message}
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
                                                onPress={() => navigate('/creator/learning-paths')}
                                                className="font-medium"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                color="primary"
                                                isLoading={isSubmitting}
                                                className="font-medium px-8"
                                                startContent={<Icon icon="mdi:content-save-outline" />}
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            </form>
                        </Tab>

                        <Tab
                            key="courses"
                            title={
                                <div className="flex items-center space-x-2">
                                    <Icon icon="mdi:book-multiple-outline" className="text-lg" />
                                    <span>Courses</span>
                                </div>
                            }
                        >
                            <div className="mt-6 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Path Courses</h3>
                                        <p className="text-sm text-gray-500">Manage the courses in this learning path.</p>
                                    </div>
                                    <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={handleAddCourse}>
                                        Add Course
                                    </Button>
                                </div>

                                <div className="grid gap-4">
                                    {pathCourses.length === 0 ? (
                                        <Card className="border border-dashed border-gray-300 dark:border-gray-700 bg-transparent shadow-none">
                                            <CardBody className="py-12 flex flex-col items-center text-center text-gray-500">
                                                <Icon icon="mdi:book-outline" className="text-4xl mb-3 opacity-50" />
                                                <p className="font-medium">No courses assigned yet</p>
                                                <p className="text-sm">Add courses to build this learning path.</p>
                                            </CardBody>
                                        </Card>
                                    ) : (
                                        pathCourses.map((course, index) => (
                                            <Card key={course.id} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                                <CardBody className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex gap-4 items-start flex-1">
                                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                                                                {course.sequenceOrder || index + 1}
                                                            </div>
                                                            <div className="space-y-1 flex-1">
                                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h4>
                                                                <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    {course.isRequired ? (
                                                                        <Chip size="sm" color="danger" variant="flat" startContent={<Icon icon="mdi:star" />}>
                                                                            Required
                                                                        </Chip>
                                                                    ) : (
                                                                        <Chip size="sm" color="default" variant="flat">
                                                                            Optional
                                                                        </Chip>
                                                                    )}
                                                                    {course.level && (
                                                                        <Chip size="sm" variant="flat">
                                                                            {course.level}
                                                                        </Chip>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            color="danger"
                                                            variant="light"
                                                            onPress={() => handleRemoveCourse(course.id)}
                                                        >
                                                            <Icon icon="mdi:trash-can" className="text-lg" />
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>

            {/* Add Course Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalContent>
                    <form onSubmit={handleCourseSubmit(onSubmitCourse)}>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:book-plus-outline" className="text-2xl text-primary" />
                                <span>Add Course to Path</span>
                            </div>
                        </ModalHeader>
                        <ModalBody className="gap-6">
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
                                        startContent={<Icon icon="mdi:book-outline" className="text-gray-400" />}
                                        isInvalid={!!courseErrors.courseId}
                                        errorMessage={courseErrors.courseId?.message}
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
                                            startContent={<Icon icon="mdi:order-numeric-ascending" className="text-gray-400" />}
                                            isInvalid={!!courseErrors.sequenceOrder}
                                            errorMessage={courseErrors.sequenceOrder?.message}
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
                                            startContent={<Icon icon="mdi:flag-outline" className="text-gray-400" />}
                                            isInvalid={!!courseErrors.isRequired}
                                            errorMessage={courseErrors.isRequired?.message}
                                        >
                                            <SelectItem key="true" startContent={<Icon icon="mdi:star" className="text-danger" />}>
                                                Required
                                            </SelectItem>
                                            <SelectItem key="false" startContent={<Icon icon="mdi:circle-outline" />}>
                                                Optional
                                            </SelectItem>
                                        </Select>
                                    )}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" color="primary" isLoading={isCourseSaving}>
                                Add Course
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </div>
    );
}
