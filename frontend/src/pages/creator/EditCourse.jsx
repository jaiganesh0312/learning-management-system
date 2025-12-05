import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem } from "@heroui/react";
import { courseService } from '@/services';
import { LoadingSpinner } from '@/components/common';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';

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
    const [currentThumbnail, setCurrentThumbnail] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

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
                setCurrentThumbnail(course.thumbnail);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            // Validate file type
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                alert('Only JPEG, PNG, and WebP images are allowed');
                return;
            }
            setThumbnailFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview(null);
    };

    const onSubmit = async (data) => {
        try {
            await courseService.updateCourse(id, data);

            // Upload new thumbnail if provided
            if (thumbnailFile) {
                await courseService.uploadCourseThumbnail(id, thumbnailFile);
            }

            navigate('/creator/courses');
        } catch (error) {
            console.error('Error updating course:', error);
        }
    };

    if (loading) return <LoadingSpinner fullPage />;

    return (
        <motion.div
            className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Custom Header */}
                <motion.div
                    variants={itemVariants}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <Icon icon="mdi:book-edit" className="text-white text-lg" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Edit Course
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Update your course information and details.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    variants={itemVariants}
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Card className="border border-gray-200/60 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />
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
                                                description="A catchy and descriptive title for your course."
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
                                                placeholder="Describe the course"
                                                description="Detailed overview of the course content and objectives."
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
                                                    isRequired
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
                                                    isRequired
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
                                                    isRequired
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

                                    {/* Thumbnail Upload */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Course Thumbnail
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Upload an image to represent your course (Max 5MB, JPEG/PNG/WebP)
                                        </p>

                                        {thumbnailPreview || currentThumbnail ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={thumbnailPreview || `${import.meta.env.VITE_API_URL}${currentThumbnail}`}
                                                    alt="Course thumbnail"
                                                    className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                                />
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    color="danger"
                                                    variant="flat"
                                                    className="absolute top-2 right-2"
                                                    onPress={removeThumbnail}
                                                >
                                                    <Icon icon="mdi:close" />
                                                </Button>
                                                {!thumbnailPreview && (
                                                    <Button
                                                        as="label"
                                                        htmlFor="thumbnail-upload-edit"
                                                        size="sm"
                                                        variant="flat"
                                                        className="absolute bottom-2 right-2 cursor-pointer"
                                                        startContent={<Icon icon="mdi:pencil" />}
                                                    >
                                                        Change
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    as="label"
                                                    htmlFor="thumbnail-upload-edit"
                                                    variant="bordered"
                                                    startContent={<Icon icon="mdi:image-plus" />}
                                                    className="cursor-pointer"
                                                >
                                                    Choose Image
                                                </Button>
                                            </div>
                                        )}
                                        <input
                                            id="thumbnail-upload-edit"
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleThumbnailChange}
                                            className="hidden"
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
                                        isLoading={isSubmitting}
                                        className="font-medium px-8 bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
                                        startContent={<Icon icon="mdi:content-save-outline" />}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
}
