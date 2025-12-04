import React, { useState } from 'react';
import { Card, CardBody, Button, Input, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { PageHeader } from '@/components/common';
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator';
import { authService } from '@/services';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function ChangePassword() {
    const navigate = useNavigate();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { control, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    const newPassword = watch('newPassword');

    const onSubmit = async (data) => {
        try {
            const response = await authService.updatePassword({
                oldPassword: data.currentPassword,
                newPassword: data.newPassword
            });

            if (response?.data?.success) {
                addToast({ title: 'Success!', description: 'Password updated successfully', color: 'success' });
                reset();
                // Navigate back to profile after a short delay
                setTimeout(() => {
                    navigate(-1);
                }, 1500);
            } else {
                addToast({ title: 'Error!', description: response?.data?.message || 'Failed to update password', color: 'danger' });
            }
        } catch (error) {
            console.error('Error updating password:', error);
            addToast({ title: 'Error!', description: error.response?.data?.message || 'Failed to update password', color: 'danger' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Change Password"
                    description="Update your account password"
                    icon="mdi:lock-reset"
                />

                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardBody className="p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Current Password */}
                            <Controller
                                name="currentPassword"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Current Password"
                                        placeholder="Enter your current password"
                                        type={showCurrentPassword ? "text" : "password"}
                                        variant="bordered"
                                        labelPlacement="outside"
                                        isInvalid={!!errors.currentPassword}
                                        errorMessage={errors.currentPassword?.message}
                                        startContent={<Icon icon="mdi:lock-outline" className="text-xl text-gray-400" />}
                                        endContent={
                                            <button
                                                className="focus:outline-none"
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                <Icon
                                                    icon={showCurrentPassword ? "mdi:eye-off" : "mdi:eye"}
                                                    className="text-2xl text-gray-400 cursor-pointer"
                                                />
                                            </button>
                                        }
                                        classNames={{
                                            label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                        }}
                                    />
                                )}
                            />

                            {/* New Password */}
                            <div className="grid gap-4">
                                <Controller
                                    name="newPassword"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="New Password"
                                            placeholder="Enter your new password"
                                            type={showNewPassword ? "text" : "password"}
                                            variant="bordered"
                                            labelPlacement="outside"
                                            isInvalid={!!errors.newPassword}
                                            errorMessage={errors.newPassword?.message}
                                            startContent={<Icon icon="mdi:lock-outline" className="text-xl text-gray-400" />}
                                            endContent={
                                                <button
                                                    className="focus:outline-none"
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    <Icon
                                                        icon={showNewPassword ? "mdi:eye-off" : "mdi:eye"}
                                                        className="text-2xl text-gray-400 cursor-pointer"
                                                    />
                                                </button>
                                            }
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                            }}
                                        />
                                    )}
                                />

                                {/* Password Strength Indicator */}
                                {newPassword && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <PasswordStrengthIndicator password={newPassword} showTips={true} />
                                    </motion.div>
                                )}

                                {/* Confirm Password */}
                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Confirm New Password"
                                            placeholder="Confirm your new password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            variant="bordered"
                                            labelPlacement="outside"
                                            isInvalid={!!errors.confirmPassword}
                                            errorMessage={errors.confirmPassword?.message}
                                            startContent={<Icon icon="mdi:lock-check-outline" className="text-xl text-gray-400" />}
                                            endContent={
                                                <button
                                                    className="focus:outline-none"
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    <Icon
                                                        icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"}
                                                        className="text-2xl text-gray-400 cursor-pointer"
                                                    />
                                                </button>
                                            }
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                            }}
                                        />
                                    )}
                                />
                            </div>


                            {/* Password Requirements Info */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <Icon icon="mdi:information-outline" className="text-xl text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                    <div className="text-sm text-blue-600 dark:text-blue-400">
                                        <p className="font-medium mb-1">Password Requirements:</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li>At least 6 characters long</li>
                                            <li>Mix of uppercase and lowercase letters</li>
                                            <li>Include at least one number</li>
                                            <li>Include at least one special character</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    variant="flat"
                                    color="default"
                                    onPress={() => navigate(-1)}
                                    isDisabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    isLoading={isSubmitting}
                                    startContent={!isSubmitting && <Icon icon="mdi:lock-check" />}
                                >
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>

                {/* Security Tip */}
                <Card className="mt-6 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                    <CardBody className="p-4">
                        <div className="flex gap-3">
                            <Icon icon="mdi:shield-alert" className="text-xl text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                            <div className="text-sm text-yellow-600 dark:text-yellow-400">
                                <p className="font-medium mb-1">Security Tip</p>
                                <p className="text-xs">
                                    Use a strong, unique password that you don't use for other accounts.
                                    Consider using a password manager to generate and store complex passwords securely.
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div >
    );
}
