import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courseService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable, EmptyState } from '@/components/common';

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};
export default function CreatorCourseList() {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseService.getMyCourses();
            if (response?.data?.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (courseId) => {
        if (confirm('Are you sure you want to delete this course?')) {
            try {
                await courseService.deleteCourse(courseId);
                fetchCourses();
            } catch (error) {
                console.error('Error deleting course:', error);
            }
        }
    };

    const columns = [
        { key: 'title', label: 'Course Title' },
        { key: 'category', label: 'Category' },
        { key: 'duration', label: 'Duration' },
        { key: 'enrollments', label: 'Enrollments' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: 'Actions' }
    ];

    const tableData = courses.map(course => ({
        id: course.id,
        title: course.title,
        category: course.category || 'Uncategorized',
        duration: `${course.duration || 0} hours`,
        enrollments: course.enrollments?.length || 0,
        status: (
            <Chip size="sm" color={course.isPublished ? 'success' : 'warning'} variant="flat">
                {course.isPublished ? 'Published' : 'Draft'}
            </Chip>
        )
    }));

    const rowActions = [
        {
            label: 'View',
            icon: 'mdi:eye',
            variant: 'light',
            color: 'primary',
            onClick: (course) => window.location.href = `/creator/courses/${course.id}/view`
        },
        {
            label: 'Delete',
            icon: 'mdi:delete',
            variant: 'light',
            color: 'danger',
            onClick: (course) => handleDelete(course.id)
        }
    ];

    if (loading) return <LoadingSpinner fullPage />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex justify-between items-center mb-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                            <Icon icon="mdi:folder-multiple" className="text-white text-lg" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">My Courses</h3>
                            <p className="text-sm text-gray-500">Manage your created courses</p>
                        </div>
                    </div>
                    <Button
                        startContent={<Icon icon="mdi:folder-plus" />}
                        as={Link}
                        to={`/creator/courses/create`}
                        className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
                    >
                        Create Course
                    </Button>
                </motion.div>

                {courses.length > 0 ? (
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <DataTable
                                data={tableData}
                                columns={columns}
                                searchPlaceholder="Search courses..."
                                searchKeys={['title', 'category']}
                                rowActions={rowActions}
                            />
                        </CardBody>
                    </Card>
                ) : (
                    <EmptyState
                        icon="mdi:book-plus"
                        title="No courses created yet"
                        description="Start creating courses to share knowledge"
                        actionLabel="Create Course"
                        onAction={() => window.location.href = '/creator/courses/create'}
                    />
                )}
            </motion.div>
        </div>
    );
}
