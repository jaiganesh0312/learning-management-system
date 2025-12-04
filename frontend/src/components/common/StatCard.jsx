import React from 'react';
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export default function StatCard({
    title,
    value,
    icon,
    trend,
    trendValue,
    iconColor = "text-blue-600",
    iconBg = "bg-blue-100 dark:bg-blue-900"
}) {
    const isPositive = trend === 'up';
    console.log("stat card value", value)
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border border-gray-200 dark:border-gray-800">
                <CardBody>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                {title}
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {value}
                            </p>
                            {trendValue && (
                                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    <Icon
                                        icon={isPositive ? "mdi:trending-up" : "mdi:trending-down"}
                                        className="text-lg"
                                    />
                                    <span className="font-medium">{trendValue}</span>
                                </div>
                            )}
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
                            <Icon icon={icon} className={`text-2xl ${iconColor}`} />
                        </div>
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
}
