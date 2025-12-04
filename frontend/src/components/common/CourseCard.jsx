import React from 'react';
import { Card, CardBody, CardFooter, Image, Button, Chip, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";

export default function CourseCard({ course, showProgress = false, enrollmentProgress }) {
    const levelColors = {
        beginner: 'success',
        intermediate: 'warning',
        advanced: 'danger'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="border border-gray-200 dark:border-gray-800 h-full">
                <CardBody className="p-0">
                    <div className="relative">
                        <Image
                            src={course.thumbnail || '/placeholder-course.jpg'}
                            alt={course.title}
                            className="w-full h-48 object-cover"
                            radius="none"
                        />
                        <div className="absolute top-3 right-3">
                            <Chip
                                color={levelColors[course.level] || 'default'}
                                variant="flat"
                                size="sm"
                                className="capitalize"
                            >
                                {course.level}
                            </Chip>
                        </div>
                        {course.isPublished === false && (
                            <div className="absolute top-3 left-3">
                                <Chip color="warning" variant="flat" size="sm">
                                    Draft
                                </Chip>
                            </div>
                        )}
                    </div>

                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {course.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-1">
                                <Icon icon="mdi:clock-outline" className="text-lg" />
                                <span>{course.duration || 'N/A'}</span>
                            </div>
                            {course.category && (
                                <div className="flex items-center gap-1">
                                    <Icon icon="mdi:tag-outline" className="text-lg" />
                                    <span className="capitalize">{course.category}</span>
                                </div>
                            )}
                        </div>

                        {showProgress && enrollmentProgress !== undefined && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                        {Math.round(enrollmentProgress)}%
                                    </span>
                                </div>
                                <Progress
                                    value={enrollmentProgress}
                                    color="primary"
                                    size="sm"
                                    className="max-w-full"
                                />
                            </div>
                        )}
                    </div>
                </CardBody>

                <CardFooter className="pt-0 px-4 pb-4">
                    <Link to={`/courses/${course.id}`} className="w-full">
                        <Button
                            color="primary"
                            variant="flat"
                            className="w-full"
                            endContent={<Icon icon="mdi:arrow-right" />}
                        >
                            {showProgress ? 'Continue Learning' : 'View Course'}
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
