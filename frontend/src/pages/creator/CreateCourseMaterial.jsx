import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { courseService } from '@/services';
import { motion } from 'framer-motion';

export default function CreateCourseMaterial() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'video',
        url: '',
        file: null
    });

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('type', formData.type);

            if (formData.type === 'link') {
                data.append('fileUrl', formData.url);
            } else if (formData.file) {
                data.append('file', formData.file);
            }

            const response = await courseService.uploadCourseMaterial(id, data);
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <Button
                        variant="light"
                        startContent={<Icon icon="mdi:arrow-left" className="text-xl" />}
                        onPress={() => navigate(`/creator/courses/${id}/materials`)}
                        className="mb-4 text-gray-600 dark:text-gray-400"
                    >
                        Back to Course Materials
                    </Button>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl shadow-lg">
                            <Icon icon="mdi:upload" className="text-4xl text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Add Course Material
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Upload content for your course
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <form onSubmit={handleSubmit}>
                        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                            <CardBody className="p-8 gap-6">
                                <Input
                                    label="Title"
                                    placeholder="Material title"
                                    variant="bordered"
                                    labelPlacement="outside"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    startContent={<Icon icon="mdi:format-title" className="text-cyan-500" />}
                                    classNames={{
                                        inputWrapper: "hover:border-cyan-400 focus-within:!border-cyan-500",
                                        label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }}
                                    isRequired
                                />

                                <Input
                                    label="Description"
                                    placeholder="Brief description"
                                    variant="bordered"
                                    labelPlacement="outside"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    startContent={<Icon icon="mdi:text" className="text-teal-500" />}
                                    classNames={{
                                        inputWrapper: "hover:border-teal-400 focus-within:!border-teal-500",
                                        label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }}
                                />

                                <Select
                                    label="Type"
                                    variant="bordered"
                                    labelPlacement="outside"
                                    selectedKeys={[formData.type]}
                                    onSelectionChange={(keys) => setFormData({ ...formData, type: Array.from(keys)[0] })}
                                    startContent={<Icon icon="mdi:shape-outline" className="text-emerald-500" />}
                                    classNames={{
                                        trigger: "hover:border-emerald-400 focus:border-emerald-500",
                                        label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }}
                                >
                                    <SelectItem key="video" startContent={<Icon icon="mdi:video" className="text-rose-500" />}>Video</SelectItem>
                                    <SelectItem key="pdf" startContent={<Icon icon="mdi:file-pdf-box" className="text-amber-500" />}>PDF Document</SelectItem>
                                    <SelectItem key="scorm" startContent={<Icon icon="mdi:package-variant-closed" className="text-violet-500" />}>SCORM Package</SelectItem>
                                    <SelectItem key="link" startContent={<Icon icon="mdi:link" className="text-cyan-500" />}>External Link</SelectItem>
                                </Select>

                                {formData.type === 'link' ? (
                                    <Input
                                        label="URL"
                                        placeholder="https://..."
                                        variant="bordered"
                                        labelPlacement="outside"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        startContent={<Icon icon="mdi:link" className="text-cyan-500" />}
                                        classNames={{
                                            inputWrapper: "hover:border-cyan-400 focus-within:!border-cyan-500",
                                            label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                        }}
                                        isRequired
                                    />
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload File</label>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-cyan-400 transition-colors">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="block w-full text-sm text-gray-500 
                                                    file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 
                                                    file:text-sm file:font-semibold 
                                                    file:bg-gradient-to-r file:from-cyan-500 file:to-teal-600 file:text-white 
                                                    hover:file:shadow-lg hover:file:shadow-cyan-500/25 file:transition-all file:cursor-pointer"
                                                required
                                            />
                                            {formData.file && (
                                                <p className="mt-2 text-sm text-cyan-600 dark:text-cyan-400">
                                                    <Icon icon="mdi:check-circle" className="inline mr-1" />
                                                    {formData.file.name}
                                                </p>
                                            )}
                                        </div>
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
        </div>
    );
}
