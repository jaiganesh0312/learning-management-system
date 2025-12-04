import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardBody, CardHeader, Button, Textarea, Divider, Chip, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import assessmentService from '@/services/assessmentService';
import { ConfirmModal } from '@/components/common';

const createSubmissionSchema = (assignment) => {
    const hasTextSubmission = assignment.submissionType === 'text' || assignment.submissionType === 'both';
    const hasFileSubmission = assignment.submissionType === 'file' || assignment.submissionType === 'both';

    return z.object({
        submissionText: hasTextSubmission
            ? z.string().min(10, "Submission text must be at least 10 characters")
            : z.string().optional(),
        file: hasFileSubmission && assignment.submissionType !== 'both'
            ? z.any().refine((val) => val && val.length > 0, "File is required")
            : z.any().optional(),
    });
};

export default function AssignmentSubmissionForm({ assignment, onSuccess, isOverdue }) {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const submissionSchema = createSubmissionSchema(assignment);

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(submissionSchema),
        defaultValues: {
            submissionText: '',
            file: null,
        }
    });

    const validateFile = (file) => {
        if (!file) return true;

        // Check file size
        if (assignment.maxFileSize) {
            const maxSizeBytes = assignment.maxFileSize * 1024 * 1024; // Convert MB to bytes
            if (file.size > maxSizeBytes) {
                addToast({
                    title: 'File size exceeds limit',
                    description: `File size exceeds ${assignment.maxFileSize}MB limit`,
                    color: 'danger',
                })
                return false;
            }
        }

        // Check file type
        if (assignment.allowedFileTypes && assignment.allowedFileTypes.length > 0) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const allowedTypes = assignment.allowedFileTypes.map(type => type.toLowerCase());

            if (!allowedTypes.includes(fileExtension)) {
                addToast({
                    title: 'File type not allowed',
                    description: `Only ${allowedTypes.join(', ')} files are allowed`,
                    color: 'danger',
                })
                return false;
            }
        }

        return true;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && validateFile(file)) {
            setUploadedFile(file);
        } else {
            e.target.value = '';
            setUploadedFile(null);
        }
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
    };

    const onSubmit = async (data) => {
        if (isOverdue) {
            setShowConfirmModal(true);
            return;
        }
        await submitAssignment(data);
    };

    const submitAssignment = async (data) => {

        try {
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append('assignmentId', assignment.id);

            if (data.submissionText) {
                formData.append('submissionText', data.submissionText);
            }

            if (uploadedFile) {
                formData.append('file', uploadedFile);
            }

            const response = await assessmentService.submitAssignment(formData);

            if (response?.data?.success) {
                addToast({
                    title: 'Assignment submitted successfully',
                    description: 'Your assignment has been submitted successfully!',
                    color: 'success',
                })
                reset();
                setUploadedFile(null);
                onSuccess?.();
            } else {
                addToast({
                    title: 'Failed to submit assignment',
                    description: response?.data?.message || 'Failed to submit assignment',
                    color: 'danger',
                })
            }
        } catch (error) {
            console.error('Error submitting assignment:', error);
            addToast({
                title: 'Failed to submit assignment',
                description: 'Failed to submit assignment',
                color: 'danger',
            })
        } finally {
            setIsSubmitting(false);
            setShowConfirmModal(false);
        }
    };

    const showTextArea = assignment.submissionType === 'text' || assignment.submissionType === 'both';
    const showFileUpload = assignment.submissionType === 'file' || assignment.submissionType === 'both';

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Icon icon="mdi:clipboard-text" className="text-primary" />
                    Your Submission
                </h3>
            </CardHeader>
            <Divider />
            <CardBody>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Text Submission */}
                    {showTextArea && (
                        <div>
                            <Controller
                                name="submissionText"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        label="Submission Text"
                                        placeholder="Enter your submission here..."
                                        variant="bordered"
                                        labelPlacement="outside"
                                        minRows={8}
                                        isRequired={assignment.submissionType === 'text'}
                                        description={`${assignment.submissionType === 'both' ? 'Optional: ' : ''}Write your submission response`}
                                        isInvalid={!!errors.submissionText}
                                        errorMessage={errors.submissionText?.message}
                                    />
                                )}
                            />
                        </div>
                    )}

                    {/* File Upload */}
                    {showFileUpload && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Upload File {assignment.submissionType === 'file' && <span className="text-danger">*</span>}
                                </label>

                                {/* Upload Area */}
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary transition-colors">
                                    <input
                                        id="file-upload"
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept={assignment.allowedFileTypes?.map(t => `.${t}`).join(',')}
                                    />

                                    {!uploadedFile ? (
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <Icon icon="mdi:cloud-upload" className="text-6xl text-gray-400 mx-auto mb-3" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                Click to upload or drag and drop
                                            </p>
                                            {assignment.allowedFileTypes?.length > 0 && (
                                                <p className="text-xs text-gray-500">
                                                    Allowed: {assignment.allowedFileTypes.join(', ')}
                                                </p>
                                            )}
                                            {assignment.maxFileSize && (
                                                <p className="text-xs text-gray-500">
                                                    Max size: {assignment.maxFileSize}MB
                                                </p>
                                            )}
                                        </label>
                                    ) : (
                                        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <Icon icon="mdi:file-document" className="text-3xl text-primary" />
                                                <div className="text-left">
                                                    <p className="font-medium">{uploadedFile.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(uploadedFile.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                isIconOnly
                                                color="danger"
                                                variant="light"
                                                size="sm"
                                                onPress={handleRemoveFile}
                                            >
                                                <Icon icon="mdi:close" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {errors.file && (
                                    <p className="text-danger text-sm mt-1">{errors.file.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Overdue Warning */}
                    {isOverdue && (
                        <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Icon icon="mdi:alert" className="text-warning text-xl flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-warning-800 dark:text-warning-300">
                                        This assignment is overdue
                                    </p>
                                    <p className="text-sm text-warning-700 dark:text-warning-400">
                                        Late submissions may receive a penalty or may not be accepted.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="submit"
                            color="primary"
                            size="lg"
                            isLoading={isSubmitting}
                            startContent={!isSubmitting && <Icon icon="mdi:send" />}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                        </Button>
                    </div>
                </form>
            </CardBody>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    const formData = control._formValues;
                    submitAssignment(formData);
                }}
                title="Late Submission"
                message="This assignment is overdue. Your submission will be marked as late. Continue?"
                confirmText="Submit Anyway"
                cancelText="Cancel"
                confirmColor="warning"
                icon="mdi:clock-alert"
            />
        </Card>
    );
}
