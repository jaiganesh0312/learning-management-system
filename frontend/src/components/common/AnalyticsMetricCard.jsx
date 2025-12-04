import React from 'react';
import { Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';

/**
 * AnalyticsMetricCard - Reusable component for displaying analytics metrics
 * @param {string} label - Metric label
 * @param {string|number} value - Metric value
 * @param {string} icon - Iconify icon name
 * @param {string} color - Color scheme (blue, green, purple, orange, cyan)
 * @param {object} trend - Trend data { direction: 'up'|'down', value: number }
 * @param {string} subtitle - Optional subtitle text
 */
export default function AnalyticsMetricCard({
    label,
    value,
    icon,
    color = 'blue',
    trend,
    subtitle
}) {
    const colorSchemes = {
        blue: {
            gradient: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            text: 'text-blue-600 dark:text-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        },
        green: {
            gradient: 'from-emerald-500 to-teal-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            text: 'text-emerald-600 dark:text-emerald-400',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        },
        purple: {
            gradient: 'from-violet-500 to-purple-600',
            bg: 'bg-violet-50 dark:bg-violet-900/20',
            text: 'text-violet-600 dark:text-violet-400',
            iconBg: 'bg-violet-100 dark:bg-violet-900/30',
        },
        orange: {
            gradient: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            text: 'text-amber-600 dark:text-amber-400',
            iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        },
        cyan: {
            gradient: 'from-cyan-500 to-teal-600',
            bg: 'bg-cyan-50 dark:bg-cyan-900/20',
            text: 'text-cyan-600 dark:text-cyan-400',
            iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
        },
    };

    const scheme = colorSchemes[color] || colorSchemes.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4 }}
        >
            <Card className={`border border-gray-200/60 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${scheme.bg}`}>
                <div className={`h-1 bg-gradient-to-r ${scheme.gradient}`} />
                <CardBody className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-12 h-12 rounded-xl ${scheme.iconBg} flex items-center justify-center`}>
                                    <Icon icon={icon} className={`text-2xl ${scheme.text}`} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                                    {subtitle && (
                                        <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-end gap-2">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {value}
                                </p>

                                {trend && (
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        className={trend.direction === 'up'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                                        }
                                        startContent={
                                            <Icon
                                                icon={trend.direction === 'up' ? 'mdi:trending-up' : 'mdi:trending-down'}
                                                className="text-sm"
                                            />
                                        }
                                    >
                                        {trend.value}%
                                    </Chip>
                                )}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
}
