import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Progress, Chip, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { enrollmentService } from '@/services';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MaterialViewer from '@/components/learner/MaterialViewer';

export default function CoursePlayer() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [enrollment, setEnrollment] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [progressMap, setProgressMap] = useState({});

    useEffect(() => {
        fetchEnrollmentData();
    }, [courseId]);

    const fetchEnrollmentData = async () => {
        try {
            setLoading(true);

            // First, check enrollment
            const enrollmentResponse = await enrollmentService.getEnrollmentByCourse(courseId);

            if (!enrollmentResponse?.data?.isEnrolled) {
                // Not enrolled, redirect to course detail
                navigate(`/courses/${courseId}`);
                return;
            }

            const enrollmentData = enrollmentResponse.data.data;

            // Get detailed enrollment with materials and progress
            const detailsResponse = await enrollmentService.getEnrollmentDetails(enrollmentData.id);

            if (detailsResponse?.data?.success) {
                const details = detailsResponse.data.data;
                setEnrollment(details);
                setProgressMap(details.progress || {});

                const courseMaterials = details.course?.materials || [];
                setMaterials(courseMaterials);

                // Select first material or last accessed material
                if (courseMaterials.length > 0) {
                    const lastAccessed = courseMaterials.find(
                        m => details.progress[m.id]?.lastAccessedAt
                    );
                    setSelectedMaterial(lastAccessed || courseMaterials[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching enrollment data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProgressUpdate = async (progressData) => {
        try {
            const response = await enrollmentService.updateProgress(
                enrollment.id,
                {
                    courseMaterialId: progressData.materialId,
                    ...progressData,
                }
            );

            if (response?.data?.success) {
                // Update local progress map
                setProgressMap(prev => ({
                    ...prev,
                    [progressData.materialId]: {
                        ...prev[progressData.materialId],
                        ...progressData,
                    },
                }));

                // Refresh enrollment data to get updated overall progress
                fetchEnrollmentData();
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const handleMaterialComplete = () => {
        // Move to next material if available
        const currentIndex = materials.findIndex(m => m.id === selectedMaterial?.id);
        if (currentIndex >= 0 && currentIndex < materials.length - 1) {
            setSelectedMaterial(materials[currentIndex + 1]);
        }
    };

    const getMaterialStatus = (materialId) => {
        const progress = progressMap[materialId];
        if (!progress) return 'not_started';
        return progress.status;
    };

    const getCompletedMaterialsCount = () => {
        return Object.values(progressMap).filter(p => p.status === 'completed').length;
    };

    if (loading) {
        return <LoadingSpinner fullPage />;
    }

    if (!enrollment || !enrollment.course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-400">Course not found</p>
            </div>
        );
    }

    const course = enrollment.course;
    const completedCount = getCompletedMaterialsCount();
    const totalCount = materials.length;
    const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    console.log(materials);
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Bar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <Button
                                variant="light"
                                isIconOnly
                                onPress={() => navigate('/my-courses')}
                            >
                                <Icon icon="mdi:arrow-left" className="text-xl" />
                            </Button>
                            <div className="flex-1">
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                    {course.title}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Progress
                                        value={overallProgress}
                                        size="sm"
                                        color="success"
                                        className="max-w-xs"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {completedCount}/{totalCount} completed
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Materials Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="border border-gray-200 dark:border-gray-800 sticky top-24">
                            <CardBody className="p-4">
                                <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:playlist-play" className="text-xl" />
                                    Course Materials
                                </h2>
                                <div className="space-y-2">
                                    {materials.map((material, index) => {
                                        const status = getMaterialStatus(material.id);
                                        const isActive = selectedMaterial?.id === material.id;
                                        const progress = progressMap[material.id];

                                        return (
                                            <motion.div
                                                key={material.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Button
                                                    fullWidth
                                                    variant={isActive ? 'flat' : 'light'}
                                                    color={isActive ? 'primary' : 'default'}
                                                    className="h-auto py-3 px-3 justify-start"
                                                    onPress={() => setSelectedMaterial(material)}
                                                >
                                                    <div className="flex items-start gap-3 w-full">
                                                        {/* Index/Status */}
                                                        <div className="flex-shrink-0">
                                                            {status === 'completed' ? (
                                                                <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                                                                    <Icon icon="mdi:check" className="text-white text-sm" />
                                                                </div>
                                                            ) : status === 'in_progress' ? (
                                                                <div className="w-6 h-6 bg-warning rounded-full flex items-center justify-center">
                                                                    <span className="text-white text-xs font-bold">{index + 1}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                                                    <span className="text-gray-600 dark:text-gray-400 text-xs font-bold">{index + 1}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Material Info */}
                                                        <div className="flex-1 text-left">
                                                            <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                                                                {material.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Icon
                                                                    icon={
                                                                        material.type === 'video' ? 'mdi:video' :
                                                                            material.type === 'pdf' ? 'mdi:file-pdf-box' :
                                                                                material.type === 'document' ? 'mdi:file-document' :
                                                                                    material.type === 'link' ? 'mdi:link' :
                                                                                        'mdi:file'
                                                                    }
                                                                    className="text-xs text-gray-500"
                                                                />
                                                                <span className="text-xs text-gray-500 capitalize">
                                                                    {material.type}
                                                                </span>
                                                                {material.duration && (
                                                                    <>
                                                                        <span className="text-xs text-gray-400">•</span>
                                                                        <span className="text-xs text-gray-500">
                                                                            {Math.floor(material.duration / 60)}m
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {progress && progress.completionPercentage > 0 && progress.completionPercentage < 100 && (
                                                                <Progress
                                                                    value={progress.completionPercentage}
                                                                    size="sm"
                                                                    className="mt-2"
                                                                    color="warning"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </Button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Material Viewer */}
                    <div className="lg:col-span-3">
                        {selectedMaterial ? (
                            <MaterialViewer
                                material={selectedMaterial}
                                enrollmentId={enrollment.id}
                                progress={progressMap[selectedMaterial.id]}
                                onProgressUpdate={handleProgressUpdate}
                                onComplete={handleMaterialComplete}
                            />
                        ) : (
                            <Card className="border border-gray-200 dark:border-gray-800">
                                <CardBody className="p-12 text-center">
                                    <Icon icon="mdi:book-open-page-variant" className="text-6xl text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Select a material from the sidebar to start learning
                                    </p>
                                </CardBody>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
