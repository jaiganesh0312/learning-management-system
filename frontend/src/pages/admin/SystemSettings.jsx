import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Input, Switch, Tabs, Tab, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { PageHeader, LoadingSpinner } from '@/components/common';
import { systemSettingsService } from '@/services';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";

const settingsSchema = z.object({
    // General
    systemName: z.string().min(2, "System name is required"),
    timezone: z.string().min(1, "Timezone is required"),
    language: z.string().min(1, "Language is required"),

    // Email
    smtpHost: z.string().optional(),
    smtpPort: z.string().optional(),
    smtpUser: z.string().optional(),
    smtpSecure: z.boolean(),
    fromEmail: z.string().email("Invalid email").optional(),
    fromName: z.string().optional(),

    // Security
    minPasswordLength: z.number().min(6).max(20),
    requireUppercase: z.boolean(),
    requireLowercase: z.boolean(),
    requireNumbers: z.boolean(),
    requireSpecialChars: z.boolean(),
    sessionTimeout: z.number().min(5).max(480),
    maxLoginAttempts: z.number().min(1).max(10),

    // Learning
    defaultCertificateTemplate: z.string(),
    minCompletionPercentage: z.number().min(0).max(100),
    enableDiscussions: z.boolean(),
    enableRatings: z.boolean(),
});

export default function SystemSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            systemName: '',
            timezone: 'UTC',
            language: 'en',
            smtpHost: '',
            smtpPort: '587',
            smtpUser: '',
            smtpSecure: true,
            fromEmail: '',
            fromName: '',
            minPasswordLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            defaultCertificateTemplate: 'standard',
            minCompletionPercentage: 80,
            enableDiscussions: true,
            enableRatings: true,
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await systemSettingsService.getSettings();
            if (response?.data?.success) {
                const settings = response.data.data;
                reset({
                    systemName: settings.general.systemName,
                    timezone: settings.general.timezone,
                    language: settings.general.language,
                    smtpHost: settings.email.smtpHost,
                    smtpPort: settings.email.smtpPort,
                    smtpUser: settings.email.smtpUser,
                    smtpSecure: settings.email.smtpSecure,
                    fromEmail: settings.email.fromEmail,
                    fromName: settings.email.fromName,
                    minPasswordLength: settings.security.minPasswordLength,
                    requireUppercase: settings.security.requireUppercase,
                    requireLowercase: settings.security.requireLowercase,
                    requireNumbers: settings.security.requireNumbers,
                    requireSpecialChars: settings.security.requireSpecialChars,
                    sessionTimeout: settings.security.sessionTimeout,
                    maxLoginAttempts: settings.security.maxLoginAttempts,
                    defaultCertificateTemplate: settings.learning.defaultCertificateTemplate,
                    minCompletionPercentage: settings.learning.minCompletionPercentage,
                    enableDiscussions: settings.learning.enableDiscussions,
                    enableRatings: settings.learning.enableRatings,
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            addToast({ title: 'Error!', description: 'Failed to load settings', color: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setSaving(true);
            const payload = {
                general: {
                    systemName: data.systemName,
                    timezone: data.timezone,
                    language: data.language,
                },
                email: {
                    smtpHost: data.smtpHost,
                    smtpPort: data.smtpPort,
                    smtpUser: data.smtpUser,
                    smtpSecure: data.smtpSecure,
                    fromEmail: data.fromEmail,
                    fromName: data.fromName,
                },
                security: {
                    minPasswordLength: data.minPasswordLength,
                    requireUppercase: data.requireUppercase,
                    requireLowercase: data.requireLowercase,
                    requireNumbers: data.requireNumbers,
                    requireSpecialChars: data.requireSpecialChars,
                    sessionTimeout: data.sessionTimeout,
                    maxLoginAttempts: data.maxLoginAttempts,
                },
                learning: {
                    defaultCertificateTemplate: data.defaultCertificateTemplate,
                    minCompletionPercentage: data.minCompletionPercentage,
                    enableDiscussions: data.enableDiscussions,
                    enableRatings: data.enableRatings,
                },
            };

            const response = await systemSettingsService.updateSettings(payload);
            if (response?.data?.success) {
                addToast({ title: 'Success!', description: 'Settings saved successfully', color: 'success' });
                reset(data);
            } else {
                addToast({ title: 'Error!', description: 'Failed to save settings', color: 'danger' });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            addToast({ title: 'Error!', description: 'Failed to save settings', color: 'danger' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner fullPage />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="System Settings"
                    description="Configure system-wide settings and preferences"
                    icon="mdi:cog"
                />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Tabs aria-label="Settings sections" color="primary" variant="underlined">
                        {/* General Settings */}
                        <Tab key="general" title={
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:cog-outline" className="text-lg" />
                                <span>General</span>
                            </div>
                        }>
                            <Card className="mt-4 border border-gray-200 dark:border-gray-800">
                                <CardBody className="p-6 grid gap-2">
                                    <Controller
                                        name="systemName"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="System Name"
                                                placeholder="Learning Management System"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:application" className="text-gray-400" />}
                                                isInvalid={!!errors.systemName}
                                                errorMessage={errors.systemName?.message}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="timezone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Timezone"
                                                placeholder="UTC"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:clock-outline" className="text-gray-400" />}
                                                isInvalid={!!errors.timezone}
                                                errorMessage={errors.timezone?.message}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="language"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Default Language"
                                                placeholder="en"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:translate" className="text-gray-400" />}
                                                isInvalid={!!errors.language}
                                                errorMessage={errors.language?.message}
                                            />
                                        )}
                                    />
                                </CardBody>
                            </Card>
                        </Tab>

                        {/* Email Settings */}
                        <Tab key="email" title={
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:email-outline" className="text-lg" />
                                <span>Email</span>
                            </div>
                        }>
                            <Card className="mt-4 border border-gray-200 dark:border-gray-800">
                                <CardBody className="p-6 grid gap-2">
                                    <Controller
                                        name="smtpHost"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="SMTP Host"
                                                placeholder="smtp.gmail.com"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:server" className="text-gray-400" />}
                                            />
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="smtpPort"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="SMTP Port"
                                                    placeholder="587"
                                                    variant="bordered"
                                                    labelPlacement="outside"
                                                    startContent={<Icon icon="mdi:lan" className="text-gray-400" />}
                                                />
                                            )}
                                        />

                                        <Controller
                                            name="smtpSecure"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center gap-3 pt-6">
                                                    <Switch
                                                        isSelected={field.value}
                                                        onValueChange={field.onChange}
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Use SSL/TLS</span>
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <Controller
                                        name="smtpUser"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="SMTP Username"
                                                placeholder="user@example.com"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:account" className="text-gray-400" />}
                                            />
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="fromEmail"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="From Email"
                                                    placeholder="noreply@lms.com"
                                                    type="email"
                                                    variant="bordered"
                                                    labelPlacement="outside"
                                                    startContent={<Icon icon="mdi:email" className="text-gray-400" />}
                                                    isInvalid={!!errors.fromEmail}
                                                    errorMessage={errors.fromEmail?.message}
                                                />
                                            )}
                                        />

                                        <Controller
                                            name="fromName"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="From Name"
                                                    placeholder="LMS"
                                                    variant="bordered"
                                                    labelPlacement="outside"
                                                    startContent={<Icon icon="mdi:account-circle" className="text-gray-400" />}
                                                />
                                            )}
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </Tab>

                        {/* Security Settings */}
                        <Tab key="security" title={
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:shield-lock-outline" className="text-lg" />
                                <span>Security</span>
                            </div>
                        }>
                            <Card className="mt-4 border border-gray-200 dark:border-gray-800">
                                <CardBody className="p-6 grid gap-2">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Password Policy</h3>
                                        <div className="grid gap-2">
                                            <Controller
                                                name="minPasswordLength"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="Minimum Password Length"
                                                        type="number"
                                                        value={field.value?.toString()}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                        variant="bordered"
                                                        labelPlacement="outside"
                                                        min={6}
                                                        max={20}
                                                        isInvalid={!!errors.minPasswordLength}
                                                        errorMessage={errors.minPasswordLength?.message}
                                                    />
                                                )}
                                            />

                                            <div className="grid gap-2">
                                                <Controller
                                                    name="requireUppercase"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">Require Uppercase Letters</span>
                                                            <Switch isSelected={field.value} onValueChange={field.onChange} />
                                                        </div>
                                                    )}
                                                />

                                                <Controller
                                                    name="requireLowercase"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">Require Lowercase Letters</span>
                                                            <Switch isSelected={field.value} onValueChange={field.onChange} />
                                                        </div>
                                                    )}
                                                />

                                                <Controller
                                                    name="requireNumbers"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">Require Numbers</span>
                                                            <Switch isSelected={field.value} onValueChange={field.onChange} />
                                                        </div>
                                                    )}
                                                />

                                                <Controller
                                                    name="requireSpecialChars"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">Require Special Characters</span>
                                                            <Switch isSelected={field.value} onValueChange={field.onChange} />
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Session & Access</h3>
                                        <div className="grid gap-2">
                                            <Controller
                                                name="sessionTimeout"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="Session Timeout (minutes)"
                                                        type="number"
                                                        value={field.value?.toString()}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                        variant="bordered"
                                                        labelPlacement="outside"
                                                        min={5}
                                                        max={480}
                                                        description="Users will be logged out after this period of inactivity"
                                                        isInvalid={!!errors.sessionTimeout}
                                                        errorMessage={errors.sessionTimeout?.message}
                                                    />
                                                )}
                                            />

                                            <Controller
                                                name="maxLoginAttempts"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="Max Login Attempts"
                                                        type="number"
                                                        value={field.value?.toString()}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                        variant="bordered"
                                                        labelPlacement="outside"
                                                        min={1}
                                                        max={10}
                                                        description="Account will be locked after this many failed login attempts"
                                                        isInvalid={!!errors.maxLoginAttempts}
                                                        errorMessage={errors.maxLoginAttempts?.message}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Tab>

                        {/* Learning Settings */}
                        <Tab key="learning" title={
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:school-outline" className="text-lg" />
                                <span>Learning</span>
                            </div>
                        }>
                            <Card className="mt-4 border border-gray-200 dark:border-gray-800">
                                <CardBody className="p-6 grid gap-2">
                                    <Controller
                                        name="defaultCertificateTemplate"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Default Certificate Template"
                                                placeholder="standard"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:certificate" className="text-gray-400" />}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="minCompletionPercentage"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Minimum Completion Percentage"
                                                type="number"
                                                value={field.value?.toString()}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                variant="bordered"
                                                labelPlacement="outside"
                                                min={0}
                                                max={100}
                                                description="Students must achieve this percentage to complete a course"
                                                endContent={<span className="text-gray-400">%</span>}
                                                isInvalid={!!errors.minCompletionPercentage}
                                                errorMessage={errors.minCompletionPercentage?.message}
                                            />
                                        )}
                                    />

                                    <div className="space-y-3 pt-2">
                                        <Controller
                                            name="enableDiscussions"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Course Discussions</span>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Allow students to participate in course discussions</p>
                                                    </div>
                                                    <Switch isSelected={field.value} onValueChange={field.onChange} />
                                                </div>
                                            )}
                                        />

                                        <Controller
                                            name="enableRatings"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Course Ratings</span>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Allow students to rate courses</p>
                                                    </div>
                                                    <Switch isSelected={field.value} onValueChange={field.onChange} />
                                                </div>
                                            )}
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </Tab>
                    </Tabs>

                    {/* Save Button */}
                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            variant="flat"
                            onPress={() => fetchSettings()}
                            isDisabled={!isDirty || saving}
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            isLoading={saving}
                            isDisabled={!isDirty}
                            startContent={!saving && <Icon icon="mdi:content-save" />}
                        >
                            Save Settings
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
