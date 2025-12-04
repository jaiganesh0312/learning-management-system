import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem } from "@heroui/react";
import { learningPathService } from '@/services';
import { PageHeader } from '@/components/common';
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

export default function CreateLearningPath() {
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(learningPathSchema),
        defaultValues: {
            name: '',
            description: '',
            category: '',
            type: 'certification',
            duration: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            const response = await learningPathService.createLearningPath({
                ...data,
                duration: data.duration ? parseFloat(data.duration) : 0
            });
            if (response?.data?.success) {
                navigate(`/creator/learning-paths/${response.data.data.id}/edit`);
            }
        } catch (error) {
            console.error('Error creating learning path:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Create Learning Path"
                    description="Define a new learning path or curriculum"
                    icon="mdi:road-variant"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Learning Paths', href: '/creator/learning-paths' },
                        { label: 'Create' }
                    ]}
                />

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
                    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                        <CardBody className="p-8 gap-8">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Path Information</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Create a structured learning journey for your students.
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
                                            description="A clear and concise name for the learning path."
                                            variant="bordered"
                                            labelPlacement="outside"
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
                                            description="Explain the goals and outcomes of this path."
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    endContent={<Icon icon="mdi:arrow-right" />}
                                >
                                    Create & Continue
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </form>
            </div>
        </div>
    );
}
