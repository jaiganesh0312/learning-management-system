import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { courseService } from '@/services';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod validation schema with conditional validation
const createMaterialSchema = z.object({
    title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
    description: z.string().min(1, 'Description is required').min(10, 'Description must be at least 10 characters'),
    type: z.enum(['video', 'pdf', 'scorm', 'link'], {
        required_error: 'Material type is required',
    }),
    url: z.string().optional(),
    file: z.any().optional(),
}).superRefine((data, ctx) => {
    // Conditional validation based on type
    if (data.type === 'link') {
        if (!data.url || data.url.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'URL is required for link type',
                path: ['url'],
            });
        } else if (!/^https?:\/\/.+/.test(data.url)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'URL must be a valid HTTP/HTTPS URL',
                path: ['url'],
            });
        }
    } else {
        if (!data.file || (data.file instanceof FileList && data.file.length === 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'File is required for this material type',
                path: ['file'],
            });
        }
    }
});

export default function CreateCourseMaterial() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(createMaterialSchema),
        defaultValues: {
            title: '',
            description: '',
            type: 'video',
            url: '',
            file: null,
        },
    });

    const materialType = watch('type');

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };
    const handleFileRemove = () => {
        setSelectedFile(null);
        setValue('file', null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setValue('file', file, { shouldValidate: true });
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const onSubmit = async (data) => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('type', data.type);

            if (data.type === 'link') {
                formData.append('fileUrl', data.url);
            } else if (data.file) {
                formData.append('file', data.file);
            }

            const response = await courseService.uploadCourseMaterial(id, formData);
            if (response?.data?.success) {
                navigate(`/creator/courses/${id}/materials`);
            }
        } catch (error) {
            console.error('Error uploading material:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
        >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
                >
                    <Button
                        variant="light"
                        startContent={<Icon icon="mdi:arrow-left" className="text-xl" />}
                        onPress={() => navigate(`/creator/courses/${id}/materials`)}
                        className="mb-4 text-gray-600 dark:text-gray-400"
                    >
                        Back to Course Materials
                    </Button>
                </motion.div>

                {/* Header */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                            <Icon icon="mdi:upload" className="text-white text-lg" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Add Course Material
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Upload course content and resources
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                            <CardBody className="p-8 gap-6">
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Title"
                                            placeholder="Material title"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            startContent={<Icon icon="mdi:format-title" />}
                                            isInvalid={!!errors.title}
                                            errorMessage={errors.title?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Description"
                                            placeholder="Brief description"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            startContent={<Icon icon="mdi:text" />}
                                            isInvalid={!!errors.description}
                                            errorMessage={errors.description?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Type"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            selectedKeys={[field.value]}
                                            onSelectionChange={(keys) => {
                                                const value = Array.from(keys)[0];
                                                field.onChange(value);
                                                // Reset file/url when type changes
                                                setSelectedFile(null);
                                                setValue('file', null);
                                                setValue('url', '');
                                            }}
                                            startContent={<Icon icon="mdi:shape-outline" />}
                                            isInvalid={!!errors.type}
                                            errorMessage={errors.type?.message}
                                        >
                                            <SelectItem key="video" startContent={<Icon icon="mdi:video" className="text-rose-500" />}>Video</SelectItem>
                                            <SelectItem key="pdf" startContent={<Icon icon="mdi:file-pdf-box" className="text-amber-500" />}>PDF Document</SelectItem>
                                            <SelectItem key="scorm" startContent={<Icon icon="mdi:package-variant-closed" className="text-violet-500" />}>SCORM Package</SelectItem>
                                            <SelectItem key="link" startContent={<Icon icon="mdi:link" className="text-cyan-500" />}>External Link</SelectItem>
                                        </Select>
                                    )}
                                />

                                {materialType === 'link' ? (
                                    <Controller
                                        name="url"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="URL"
                                                placeholder="https://..."
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:link" className="text-cyan-500" />}
                                                isInvalid={!!errors.url}
                                                errorMessage={errors.url?.message}
                                            />
                                        )}
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Upload File
                                        </label>

                                        {/* Hidden File Input */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept={
                                                materialType === "video"
                                                    ? "video/*"
                                                    : materialType === "pdf"
                                                        ? "application/pdf"
                                                        : materialType === "scorm"
                                                            ? ".zip"
                                                            : "*"
                                            }
                                        />

                                        {/* Upload Button + File Info */}
                                        <div className="flex items-center gap-3">
                                            <Button
                                                type="button"
                                                variant="shadow"
                                                color="success"
                                                onPress={handleFileSelect}
                                                startContent={<Icon icon="mdi:upload" className="text-lg" />}
                                            >
                                                Choose File
                                            </Button>

                                            {/* File Name + Size */}
                                            {selectedFile && (
                                                <div className="flex items-center gap-3 p-2 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-700 rounded-md">
                                                    <div className="flex flex-col leading-tight ">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                                                            {selectedFile.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatFileSize(selectedFile.size)}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        isIconOnly
                                                        color='danger'
                                                        size='sm'
                                                        variant='flat'
                                                        onPress={handleFileRemove}
                                                    >
                                                        <Icon icon="mdi:delete" className='w-4 h-4' />
                                                    </Button>
                                                </div>

                                            )}
                                        </div>

                                        {/* Validation Error */}
                                        {errors.file && (
                                            <p className="text-xs text-danger mt-1">
                                                {errors.file.message}
                                            </p>
                                        )}
                                    </div>

                                )}

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <Button
                                        variant="flat"
                                        color="default"
                                        onPress={() => navigate(`/creator/courses/${id}/materials`)}
                                        className="font-medium"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        isLoading={uploading}
                                        className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25 font-medium px-8"
                                        startContent={!uploading && <Icon icon="mdi:upload" />}
                                    >
                                        Upload Material
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
