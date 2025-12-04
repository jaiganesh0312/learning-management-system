import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem, Tabs, Tab } from "@heroui/react";
import { courseService } from '@/services';
import { PageHeader, LoadingSpinner } from '@/components/common';
import CourseMaterials from '@/components/creator/CourseMaterials';
import CourseQuizzes from '@/components/creator/CourseQuizzes';
import CourseAssignments from '@/components/creator/CourseAssignments';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Icon } from "@iconify/react";

const courseSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().min(2, "Category must be at least 2 characters"),
    duration: z.coerce.number().min(0, "Duration must be a positive number"),
    level: z.enum(['beginner', 'intermediate', 'advanced'], {
        errorMap: () => ({ message: "Please select a valid level" })
    })
});

export default function EditCourse() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: '',
            description: '',
            category: '',
            duration: '',
            level: ''
        }
    });

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await courseService.getCourse(id);
            if (response?.data?.success) {
                const course = response.data.data;
                reset({
                    title: course.title,
                    description: course.description || '',
                    category: course.category || '',
                    duration: course.duration || '',
                    level: course.level || ''
                });
                setMaterials(course.materials || []);
                setQuizzes(course.quizzes || []);
                setAssignments(course.assignments || []);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            await courseService.updateCourse(id, data);
            navigate('/creator/courses');
        } catch (error) {
            console.error('Error updating course:', error);
        }
    };

    if (loading) return <LoadingSpinner fullPage />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Edit Course"
                    description="Manage course content, quizzes, and assignments."
                    icon="mdi:book-edit"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Courses', href: '/creator/courses' },
                        { label: 'Edit' }
                    ]}
                />

                <div className="mt-8">
                    <Tabs
                        aria-label="Course Options"
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
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Course Details</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Update the basic information for this course.
                                            </p>
                                        </div>

                                        <div className="grid gap-6">
                                            <Controller
                                                name="title"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        isRequired
                                                        label="Course Title"
                                                        placeholder="Enter course title"
                                                        variant="bordered"
                                                        labelPlacement="outside"
                                                        isInvalid={!!errors.title}
                                                        errorMessage={errors.title?.message}
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
                                                        label="Description"
                                                        placeholder="Describe the course"
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
                                                            placeholder="e.g., Programming"
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
                                                    name="duration"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            label="Duration"
                                                            placeholder="e.g., 10"
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

                                                <Controller
                                                    name="level"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            label="Level"
                                                            placeholder="Select level"
                                                            variant="bordered"
                                                            labelPlacement="outside"
                                                            selectedKeys={field.value ? [field.value] : []}
                                                            onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                                            startContent={<Icon icon="mdi:stairs" className="text-gray-400" />}
                                                            isInvalid={!!errors.level}
                                                            errorMessage={errors.level?.message}
                                                            classNames={{
                                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                            }}
                                                        >
                                                            <SelectItem key="beginner">Beginner</SelectItem>
                                                            <SelectItem key="intermediate">Intermediate</SelectItem>
                                                            <SelectItem key="advanced">Advanced</SelectItem>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                                            <Button
                                                variant="flat"
                                                color="default"
                                                onPress={() => navigate('/creator/courses')}
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
                            key="materials"
                            title={
                                <div className="flex items-center space-x-2">
                                    <Icon icon="mdi:file-document-multiple-outline" className="text-lg" />
                                    <span>Materials</span>
                                </div>
                            }
                        >
                            <div className="mt-6">
                                <CourseMaterials courseId={id} materials={materials} onUpdate={fetchCourse} />
                            </div>
                        </Tab>
                        <Tab
                            key="quizzes"
                            title={
                                <div className="flex items-center space-x-2">
                                    <Icon icon="mdi:format-list-checks" className="text-lg" />
                                    <span>Quizzes</span>
                                </div>
                            }
                        >
                            <div className="mt-6">
                                <CourseQuizzes courseId={id} quizzes={quizzes} onUpdate={fetchCourse} />
                            </div>
                        </Tab>
                        <Tab
                            key="assignments"
                            title={
                                <div className="flex items-center space-x-2">
                                    <Icon icon="mdi:clipboard-text-clock-outline" className="text-lg" />
                                    <span>Assignments</span>
                                </div>
                            }
                        >
                            <div className="mt-6">
                                <CourseAssignments courseId={id} assignments={assignments} onUpdate={fetchCourse} />
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
