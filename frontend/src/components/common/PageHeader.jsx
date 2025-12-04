import React from 'react';
import { Button, Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";

export default function PageHeader({
    title,
    description,
    breadcrumbs = [],
    actions = [],
    icon
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <Breadcrumbs className="mb-4">
                    {breadcrumbs.map((crumb, index) => (
                        <BreadcrumbItem key={index}>
                            {crumb.href ? (
                                <Link to={crumb.href}>{crumb.label}</Link>
                            ) : (
                                <span>{crumb.label}</span>
                            )}
                        </BreadcrumbItem>
                    ))}
                </Breadcrumbs>
            )}

            {/* Header Content */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4 flex-1">
                    {icon && (
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon icon={icon} className="text-2xl text-primary-600 dark:text-primary-400" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-gray-600 dark:text-gray-400">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {actions.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                color={action.color || "primary"}
                                variant={action.variant || "solid"}
                                startContent={action.icon && <Icon icon={action.icon} />}
                                onPress={action.onClick}
                                as={action.href ? Link : undefined}
                                to={action.href}
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
