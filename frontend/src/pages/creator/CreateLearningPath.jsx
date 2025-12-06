import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem } from "@heroui/react";
import { learningPathService } from '@/services';
import CreatorPageHeader from '@/components/creator/CreatorPageHeader';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';

const learningPathSchema = z.object({
    name: z.string().min(5, "Name must be at least 5 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().min(2, "Category must be at least 2 characters"),
    type: z.enum(['certification', 'skill_track', 'onboarding']),
    duration: z.coerce.number().min(0, "Duration must be a positive number")
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20 py-8">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <motion.div variants={itemVariants}>
                    <CreatorPageHeader
                        title="Create Learning Path"
                        subtitle="Define a new learning path or curriculum"
                        icon="mdi:road-variant"
                        variant="learningPath"
                        backUrl="/creator/learning-paths"
                        backLabel="Back to Learning Paths"
                    />
                </motion.div>

                <motion.form
                    variants={itemVariants}
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-8"
                >
                    <Card className="border border-gray-200/60 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                        {/* Gradient Header Accent */}
                        <div className="h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

                        <CardBody className="p-8 gap-8">
                            <motion.div
                                variants={itemVariants}
                                className="space-y-2"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                        <Icon icon="mdi:road-variant" className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Path Information</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Create a structured learning journey for your students.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={containerVariants} className="grid gap-6">
                                <motion.div variants={itemVariants}>
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
                                                startContent={<Icon icon="mdi:text-short" className="text-emerald-500" />}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                    inputWrapper: "hover:border-emerald-400 focus-within:!border-emerald-500"
                                                }}
                                            />
                                        )}
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants}>
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
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                    inputWrapper: "hover:border-emerald-400 focus-within:!border-emerald-500"
                                                }}
                                            />
                                        )}
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                startContent={<Icon icon="mdi:tag-outline" className="text-teal-500" />}
                                                isInvalid={!!errors.category}
                                                errorMessage={errors.category?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                    inputWrapper: "hover:border-teal-400 focus-within:!border-teal-500"
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
                                                startContent={<Icon icon="mdi:shape-outline" className="text-cyan-500" />}
                                                isInvalid={!!errors.type}
                                                errorMessage={errors.type?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                    trigger: "hover:border-cyan-400 focus:border-cyan-500"
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
                                </motion.div>

                                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                startContent={<Icon icon="mdi:clock-outline" className="text-teal-500" />}
                                                isInvalid={!!errors.duration}
                                                errorMessage={errors.duration?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                    inputWrapper: "hover:border-teal-400 focus-within:!border-teal-500"
                                                }}
                                            />
                                        )}
                                    />
                                </motion.div>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800"
                            >
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
                                    className="font-medium px-8 bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
                                    endContent={!isSubmitting && <Icon icon="mdi:arrow-right" />}
                                >
                                    Create & Continue
                                </Button>
                            </motion.div>
                        </CardBody>
                    </Card>
                </motion.form>
            </motion.div>
        </div>
    );
}
