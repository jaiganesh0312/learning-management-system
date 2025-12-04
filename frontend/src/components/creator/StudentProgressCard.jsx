import React from 'react';
import { Card, CardBody, Chip, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';

/**
 * StudentProgressCard - Component for displaying individual student progress
 * @param {object} enrollment - Enrollment object with user and progress data
 * @param {number} index - Index for stagger animation
 */
export default function StudentProgressCard({ enrollment, index = 0 }) {
    const user = enrollment.user || enrollment.User;
    const progress = parseFloat(enrollment.progress || 0);
    const status = enrollment.status || 'not_started';

    // Calculate last activity
    const lastActivity = enrollment.courseProgress?.reduce((latest, cp) => {
        const lastAccessed = cp.lastAccessedAt ? new Date(cp.lastAccessedAt) : null;
        return lastAccessed && (!latest || lastAccessed > latest) ? lastAccessed : latest;
    }, null);

    // Status configuration
    const statusConfig = {
        not_started: {
            label: 'Not Started',
            color: 'default',
            icon: 'mdi:circle-outline',
            chipClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        },
        in_progress: {
            label: 'In Progress',
            color: 'primary',
            icon: 'mdi:progress-clock',
            chipClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        },
        completed: {
            label: 'Completed',
            color: 'success',
            icon: 'mdi:check-circle',
            chipClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        },
        failed: {
            label: 'Failed',
            color: 'danger',
            icon: 'mdi:close-circle',
            chipClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        },
        expired: {
            label: 'Expired',
            color: 'warning',
            icon: 'mdi:clock-alert',
            chipClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        },
    };

    const currentStatus = statusConfig[status] || statusConfig.not_started;

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'No activity';
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card className="border border-gray-200/60 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardBody className="p-4">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md">
                            {getInitials(user?.name || user?.firstName)}
                        </div>

                        {/* User Info & Progress */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                                        {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Unknown User'}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {user?.email || 'No email'}
                                    </p>
                                </div>

                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className={currentStatus.chipClass}
                                    startContent={<Icon icon={currentStatus.icon} className="text-sm" />}
                                >
                                    {currentStatus.label}
                                </Chip>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1 mb-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {progress.toFixed(0)}%
                                    </span>
                                </div>
                                <Progress
                                    value={progress}
                                    color={currentStatus.color}
                                    size="sm"
                                    className="max-w-full"
                                    classNames={{
                                        indicator: "bg-gradient-to-r from-blue-500 to-indigo-600",
                                    }}
                                />
                            </div>

                            {/* Last Activity */}
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Icon icon="mdi:clock-outline" className="text-sm" />
                                <span>Last activity: {formatDate(lastActivity)}</span>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
}
