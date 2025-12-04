import React from 'react';
import { Progress } from "@heroui/react";
import { motion } from "framer-motion";

export default function ProgressBar({
    value,
    label,
    showPercentage = true,
    color = "primary",
    size = "md"
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
        >
            <div className="flex items-center justify-between mb-2">
                {label && (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </span>
                )}
                {showPercentage && (
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {Math.round(value)}%
                    </span>
                )}
            </div>
            <Progress
                value={value}
                color={color}
                size={size}
                className="max-w-full"
            />
        </motion.div>
    );
}
