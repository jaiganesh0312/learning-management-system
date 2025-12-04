import React, { useState } from 'react';
import { Card, CardBody, Switch, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/common';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        darkMode: false,
        emailNotifications: true,
        pushNotifications: false,
        language: 'en'
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <PageHeader
                    title="Settings"
                    description="Manage your preferences"
                    icon="mdi:cog"
                />

                <div className="space-y-6">
                    {/* Appearance */}
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Appearance</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Use dark theme</p>
                                </div>
                                <Switch
                                    isSelected={settings.darkMode}
                                    onValueChange={(value) => setSettings({ ...settings, darkMode: value })}
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Notifications */}
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Notifications</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
                                    </div>
                                    <Switch
                                        isSelected={settings.emailNotifications}
                                        onValueChange={(value) => setSettings({ ...settings, emailNotifications: value })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications</p>
                                    </div>
                                    <Switch
                                        isSelected={settings.pushNotifications}
                                        onValueChange={(value) => setSettings({ ...settings, pushNotifications: value })}
                                    />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Language */}
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Language</h3>
                            <Select
                                label="Display Language"
                                selectedKeys={[settings.language]}
                                onSelectionChange={(keys) => setSettings({ ...settings, language: Array.from(keys)[0] })}
                            >
                                <SelectItem key="en">English</SelectItem>
                                <SelectItem key="es">Spanish</SelectItem>
                                <SelectItem key="fr">French</SelectItem>
                            </Select>
                        </CardBody>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}
