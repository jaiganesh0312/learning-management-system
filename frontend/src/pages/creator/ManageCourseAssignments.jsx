import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@heroui/react";
import { courseService } from '@/services';
import { LoadingSpinner } from '@/components/common';
import CourseAssignments from '@/components/creator/CourseAssignments';
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';

export default function ManageCourseAssignments() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState(null);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await courseService.getCourse(id);
            if (response?.data?.success) {
                setCourse(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullPage />;
    if (!course) return <div>Course not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <CourseAssignments
                        courseId={id}
                        assignments={course.assignments || []}
                        onUpdate={fetchCourse}
                    />
                </motion.div>
            </div>
        </div>
    );
}
