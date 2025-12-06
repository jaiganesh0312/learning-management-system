import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courseService } from '@/services';
import { LoadingSpinner, DataTable, EmptyState, ConfirmModal } from '@/components/common';
import CreatorPageHeader from '@/components/creator/CreatorPageHeader';

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};
export default function CreatorCourseList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

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

    const handleDelete = (courseId) => {
        setSelectedCourseId(courseId);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        try {
            await courseService.deleteCourse(selectedCourseId);
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
        } finally {
            setShowConfirmModal(false);
            setSelectedCourseId(null);
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
            onClick: (course) => navigate(`/creator/courses/${course.id}/view`)
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
                <CreatorPageHeader
                    title="My Courses"
                    subtitle="Manage your created courses"
                    icon="mdi:folder-multiple"
                    variant="material"
                    actions={[
                        {
                            label: "Create Course",
                            icon: "mdi:folder-plus",
                            onClick: () => navigate('/creator/courses/create'),
                            className: "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
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
                        onAction={() => navigate('/creator/courses/create')}
                    />
                )}
            </motion.div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmDelete}
                title="Delete Course"
                message="Are you sure you want to delete this course? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="danger"
                icon="mdi:delete-alert"
            />
        </div>
    );
}
