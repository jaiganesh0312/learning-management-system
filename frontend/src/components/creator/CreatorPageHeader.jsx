import React from 'react';
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

const VARIANTS = {
    quiz: {
        gradient: "from-violet-500 to-purple-600",
        shadow: "shadow-violet-500/25",
    },
    material: {
        gradient: "from-cyan-500 to-teal-600",
        shadow: "shadow-cyan-500/25",
    },
    default: {
        gradient: "from-blue-500 to-indigo-600",
        shadow: "shadow-blue-500/25",
    },
    assignment: {
        gradient: "from-amber-500 to-orange-600",
        shadow: "shadow-amber-500/25",
    },
    learningPath: {
        gradient: "from-fuchsia-600 to-purple-600",
        shadow: "shadow-fuchsia-500/25",
    },
    grading: {
        gradient: "from-emerald-600 to-teal-600",
        shadow: "shadow-emerald-500/25",
    }
};

export default function CreatorPageHeader({
    title,
    subtitle,
    icon,
    actions = [],
    backUrl,
    backLabel = "Back",
    variant = "default"
}) {
    const navigate = useNavigate();
    const theme = VARIANTS[variant] || VARIANTS.default;

    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
            className="mb-8"
        >
            {/* Back Button */}
            {backUrl && (
                <Button
                    variant="light"
                    startContent={<Icon icon="mdi:arrow-left" className="text-xl" />}
                    onPress={() => navigate(backUrl)}
                    className="mb-4 text-gray-600 dark:text-gray-400 pl-0 hover:bg-transparent"
                >
                    {backLabel}
                </Button>
            )}

            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg ${theme.shadow}`}>
                        <Icon icon={icon} className="text-white text-lg" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h1>
                        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">
                            {subtitle}
                        </p>}
                    </div>
                </div>

                {actions.length > 0 && (
                    <div className="flex items-center gap-2">
                        {actions.map((action, idx) => (
                            <Button
                                key={idx}
                                color={action.color || "primary"}
                                className={action.className}
                                startContent={action.icon && <Icon icon={action.icon} />}
                                onPress={action.onClick}
                                variant={action.variant || "solid"}
                                isDisabled={action.isDisabled}
                                isLoading={action.isLoading}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
