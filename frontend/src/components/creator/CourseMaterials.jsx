import React, { useState } from 'react';
import {
    Card, CardBody, Button, Input, Select, SelectItem,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Tooltip, Chip, useDisclosure
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { courseService } from '@/services';

export default function CourseMaterials({ courseId, materials = [], onUpdate }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
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

    const handleSubmit = async (onClose) => {
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

            const response = await courseService.uploadCourseMaterial(courseId, data);
            if (response?.data?.success) {
                onUpdate();
                onClose();
                setFormData({ title: '', description: '', type: 'video', url: '', file: null });
            }
        } catch (error) {
            console.error('Error uploading material:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (materialId) => {
        if (confirm('Are you sure you want to delete this material?')) {
            try {
                await courseService.deleteCourseMaterial(courseId, materialId);
                onUpdate();
            } catch (error) {
                console.error('Error deleting material:', error);
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Course Materials</h3>
                <Button color="primary" startContent={<Icon icon="mdi:upload" />} onPress={onOpen}>
                    Add Material
                </Button>
            </div>

            {materials.length === 0 ? (
                <Card>
                    <CardBody>
                        <p className="text-gray-500 text-center py-8">No materials uploaded yet.</p>
                    </CardBody>
                </Card>
            ) : (
                <Table aria-label="Course materials table">
                    <TableHeader>
                        <TableColumn>TYPE</TableColumn>
                        <TableColumn>TITLE</TableColumn>
                        <TableColumn>SIZE/DURATION</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {materials.map((material) => (
                            <TableRow key={material.id}>
                                <TableCell>
                                    <Chip
                                        startContent={<Icon icon={getIconForType(material.type)} />}
                                        variant="flat"
                                        color="primary"
                                    >
                                        {material.type.toUpperCase()}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-semibold">{material.title}</p>
                                        <p className="text-tiny text-gray-500">{material.description}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {material.duration ? `${material.duration} min` :
                                        material.fileSize ? `${(material.fileSize / 1024 / 1024).toFixed(2)} MB` : '-'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Tooltip content="Delete">
                                            <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(material.id)}>
                                                <Icon icon="mdi:trash-can" />
                                            </span>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Add Course Material</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Title"
                                    placeholder="Material title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                                <Input
                                    label="Description"
                                    placeholder="Brief description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                <Select
                                    label="Type"
                                    selectedKeys={[formData.type]}
                                    onSelectionChange={(keys) => setFormData({ ...formData, type: Array.from(keys)[0] })}
                                >
                                    <SelectItem key="video">Video</SelectItem>
                                    <SelectItem key="pdf">PDF Document</SelectItem>
                                    <SelectItem key="scorm">SCORM Package</SelectItem>
                                    <SelectItem key="link">External Link</SelectItem>
                                </Select>

                                {formData.type === 'link' ? (
                                    <Input
                                        label="URL"
                                        placeholder="https://..."
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    />
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm">Upload File</label>
                                        <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={() => handleSubmit(onClose)} isLoading={uploading}>
                                    Upload
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
