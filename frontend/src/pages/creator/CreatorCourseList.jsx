import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courseService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable, EmptyState } from '@/components/common';

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

    const handleToggleStatus = async (courseId, status = 'published') => {
        try {
            await courseService.togglePublishStatus(courseId, status);
            fetchCourses();
        } catch (error) {
            console.error('Error toggling status:', error);
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
            label: 'Edit',
            icon: 'mdi:pencil',
            variant: 'light',
            color: 'primary',
            onClick: (course) => window.location.href = `/creator/courses/${course.id}/edit`
        },
        {
            label: 'Toggle Status',
            icon: 'mdi:swap-horizontal',
            variant: 'light',
            onClick: (course) => handleToggleStatus(course.id)
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
                <PageHeader
                    title="My Courses"
                    description="Manage your created courses"
                    icon="mdi:book-edit"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Creator', href: '/creator/courses' },
                        { label: 'Courses' }
                    ]}
                    actions={[
                        {
                            label: 'Create Course',
                            icon: 'mdi:plus',
                            color: 'primary',
                            href: '/creator/courses/create'
                        }
                    ]}
                />

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
