import React, { useState } from 'react';
import { Card, CardBody, Button, Input, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/common';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

const profileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal(''))
});

export default function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phone: user?.phone || ''
        }
    });

    const onSubmit = async (data) => {
        try {
            // TODO: Call API to update profile
            // await userService.updateProfile(data);
            console.log('Updating profile:', data);

            setUpdateSuccess(true);
            setEditing(false);
            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleCancel = () => {
        reset({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phone: user?.phone || ''
        });
        setEditing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="My Profile"
                    description="Manage your account settings and personal information"
                    icon="mdi:account"
                />

                {updateSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
                    >
                        <Icon icon="mdi:check-circle" className="text-xl text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-600 dark:text-green-400">Profile updated successfully!</p>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <Card className="lg:col-span-1 border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6 text-center">
                            <Avatar
                                className="w-24 h-24 mx-auto mb-4"
                                name={`${user?.firstName} ${user?.lastName}`}
                                classNames={{
                                    base: "bg-gradient-to-br from-blue-600 to-purple-600",
                                    name: "text-white font-semibold"
                                }}
                            />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {user?.firstName} {user?.lastName}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 flex items-center justify-center gap-1">
                                <Icon icon="mdi:email-outline" className="text-sm" />
                                {user?.email}
                            </p>
                            <Button
                                color="primary"
                                variant="flat"
                                className="w-full"
                                startContent={<Icon icon="mdi:camera" />}
                            >
                                Change Photo
                            </Button>
                        </CardBody>
                    </Card>

                    {/* Info Card */}
                    <Card className="lg:col-span-2 border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your personal details</p>
                                </div>
                                {!editing && (
                                    <Button
                                        size="sm"
                                        color="primary"
                                        variant="flat"
                                        startContent={<Icon icon="mdi:pencil" />}
                                        onPress={() => setEditing(true)}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller
                                        name="firstName"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="First Name"
                                                placeholder="John"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                isDisabled={!editing}
                                                startContent={<Icon icon="mdi:account-outline" className="text-gray-400" />}
                                                isInvalid={!!errors.firstName}
                                                errorMessage={errors.firstName?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            />
                                        )}
                                    />


                                    <Controller
                                        name="lastName"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Last Name"
                                                placeholder="Doe"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                isDisabled={!editing}
                                                startContent={<Icon icon="mdi:account-outline" className="text-gray-400" />}
                                                isInvalid={!!errors.lastName}
                                                errorMessage={errors.lastName?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <Input
                                        label="Email"
                                        value={user?.email || ''}
                                        variant="bordered"
                                        labelPlacement="outside"
                                        isDisabled
                                        startContent={<Icon icon="mdi:email-outline" className="text-gray-400" />}
                                        description="Email cannot be changed"
                                        classNames={{
                                            label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                        }}
                                    />

                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Phone Number"
                                                placeholder="+1 (555) 000-0000"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                isDisabled={!editing}
                                                startContent={<Icon icon="mdi:phone-outline" className="text-gray-400" />}
                                                isInvalid={!!errors.phone}
                                                errorMessage={errors.phone?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                {editing && (
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <Button
                                            variant="flat"
                                            color="default"
                                            onPress={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            color="primary"
                                            isLoading={isSubmitting}
                                            isDisabled={!isDirty}
                                            startContent={!isSubmitting && <Icon icon="mdi:content-save-outline" />}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardBody>
                    </Card>
                </div>

                {/* Additional Settings Card */}
                <Card className="mt-6 border border-gray-200 dark:border-gray-800">
                    <CardBody className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Account Actions</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="flat"
                                color="warning"
                                startContent={<Icon icon="mdi:lock-reset" />}
                                onPress={() => navigate('/change-password')}
                            >
                                Change Password
                            </Button>
                            <Button
                                variant="flat"
                                color="danger"
                                startContent={<Icon icon="mdi:delete-forever" />}
                            >
                                Delete Account
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

