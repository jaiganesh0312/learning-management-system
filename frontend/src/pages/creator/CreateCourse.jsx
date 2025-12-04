import React from 'react';
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem } from "@heroui/react";
import { useNavigate } from 'react-router-dom';
import { courseService } from '@/services';
import { PageHeader } from '@/components/common';
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

export default function CreateCourse() {
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: '',
            description: '',
            category: '',
            duration: '',
            level: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            const response = await courseService.createCourse(data);
            if (response?.data?.success) {
                navigate(`/creator/courses/${response.data.data.id}/edit`);
            }
        } catch (error) {
            console.error('Error creating course:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Create New Course"
                    description="Start building your curriculum by defining the basic course details."
                    icon="mdi:book-plus"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Courses', href: '/creator/courses' },
                        { label: 'Create' }
                    ]}
                />

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
                    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                        <CardBody className="p-8 gap-8">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Course Information</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Provide a clear title and description to help students understand what they'll learn.
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
                                            placeholder="e.g., Advanced React Patterns"
                                            description="A catchy and descriptive title for your course."
                                            variant="bordered"
                                            labelPlacement="outside"
                                            isInvalid={!!errors.title}
                                            errorMessage={errors.title?.message}
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                input: "text-base"
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
                                            placeholder="What will students learn in this course?"
                                            description="Detailed overview of the course content and objectives."
                                            variant="bordered"
                                            labelPlacement="outside"
                                            minRows={4}
                                            isInvalid={!!errors.description}
                                            errorMessage={errors.description?.message}
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                input: "text-base"
                                            }}
                                        />
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Controller
                                        name="category"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                isRequired
                                                label="Category"
                                                placeholder="e.g., Web Development"
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
                                        name="level"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                label="Difficulty Level"
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
                                                <SelectItem key="beginner" startContent={<Icon icon="mdi:signal-cellular-1" className="text-success" />}>
                                                    Beginner
                                                </SelectItem>
                                                <SelectItem key="intermediate" startContent={<Icon icon="mdi:signal-cellular-2" className="text-warning" />}>
                                                    Intermediate
                                                </SelectItem>
                                                <SelectItem key="advanced" startContent={<Icon icon="mdi:signal-cellular-3" className="text-danger" />}>
                                                    Advanced
                                                </SelectItem>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Controller
                                        name="duration"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                label="Estimated Duration"
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
                                    endContent={<Icon icon="mdi:arrow-right" />}
                                >
                                    Create Course
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </form>
            </div>
        </div>
    );
}
