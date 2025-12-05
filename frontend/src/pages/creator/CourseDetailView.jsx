
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, Chip, Divider, Button, Switch, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, CircularProgress } from "@heroui/react";
import { courseService } from '@/services';
import { LoadingSpinner, AnalyticsMetricCard } from '@/components/common';
import StudentProgressCard from '@/components/creator/StudentProgressCard';
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';

// Motion presets
const fade = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
};

export default function CourseDetailView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState(null);
    const [publishing, setPublishing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [pendingStatus, setPendingStatus] = useState(null);

    useEffect(() => { fetchCourse(); }, [id]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const res = await courseService.getCourse(id);
            if (res?.data?.success) setCourse(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishToggle = async () => {
        const newStatus = course.status === 'published' ? 'draft' : 'published';
        setPendingStatus(newStatus);
        onOpen();
    };

    const confirmPublishToggle = async () => {
        try {
            setPublishing(true);
            const res = await courseService.togglePublishStatus(id, pendingStatus);
            if (res?.data?.success) {
                setCourse(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setPublishing(false);
            onClose();
        }
    };

    // Calculate course setup progress
    const calculateSetupProgress = () => {
        let completed = 0;
        let total = 5;

        if (course.description) completed++;
        if (course.materials?.length > 0) completed++;
        if (course.quizzes?.length > 0 || course.assignments?.length > 0) completed++;
        if (course.thumbnail) completed++;
        if (course.status === 'published') completed++;

        return {
            percentage: (completed / total) * 100,
            completed,
            total,
            missing: [
                !course.description && 'Add course description',
                !course.materials?.length && 'Upload course materials',
                !(course.quizzes?.length || course.assignments?.length) && 'Create assessments',
                !course.thumbnail && 'Add course thumbnail',
                course.status !== 'published' && 'Publish course',
            ].filter(Boolean),
        };
    };

    // Filter students
    const getFilteredStudents = () => {
        if (!course?.enrollments) return [];

        let filtered = course.enrollments;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(e => {
                const user = e.user || e.User;
                const name = (user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`).toLowerCase();
                const email = (user?.email || '').toLowerCase();
                return name.includes(query) || email.includes(query);
            });
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(e => e.status === statusFilter);
        }

        return filtered;
    };

    if (loading) return <LoadingSpinner fullPage />;
    if (!course) return <div>Course not found</div>;

    const setupProgress = calculateSetupProgress();
    const filteredStudents = getFilteredStudents();

    const actionCards = [
        {
            title: 'Course Materials',
            description: 'Manage course resources and content',
            icon: 'mdi:file-document-multiple',
            path: `/creator/courses/${id}/materials`,
            count: course.materials?.length || 0,
            gradient: 'from-cyan-500 to-teal-600',
            isEmpty: !course.materials?.length,
        },
        {
            title: 'Quizzes',
            description: 'Create and manage quizzes',
            icon: 'mdi:format-list-checks',
            path: `/creator/courses/${id}/quizzes`,
            count: course.quizzes?.length || 0,
            gradient: 'from-violet-500 to-purple-600',
            isEmpty: !course.quizzes?.length,
        },
        {
            title: 'Assignments',
            description: 'Manage assignments and submissions',
            icon: 'mdi:clipboard-text-clock',
            path: `/creator/courses/${id}/assignments`,
            count: course.assignments?.length || 0,
            gradient: 'from-amber-500 to-orange-600',
            isEmpty: !course.assignments?.length,
        },
        {
            title: 'Edit Course Info',
            description: 'Update course title, category, level, etc.',
            icon: 'mdi:pencil',
            path: `/creator/courses/${id}/edit`,
            gradient: 'from-blue-500 to-indigo-600',
        }
    ];

    return (
        <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gray-50 py-12 px-4"
        >
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <motion.div variants={fade} className="space-y-4">
                    <div className="flex items-start gap-4">
                        {/* Thumbnail or Icon */}
                        {course.thumbnail ? (
                            <img
                                src={`${import.meta.env.VITE_API_URL}${course.thumbnail}`}
                                alt={course.title}
                                className="w-24 h-24 rounded-lg object-cover shadow-lg border-2 border-gray-200"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                <Icon icon="mdi:book-open-page-variant" className="text-white text-4xl" />
                            </div>
                        )}

                        <div className="flex-1">
                            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{course.title}</h1>
                            <p className="text-sm text-gray-600">Course Overview & Management</p>
                        </div>

                        {/* Publish Toggle */}
                        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {course.status === 'published' ? 'Published' : 'Draft'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {course.status === 'published' ? 'Visible to learners' : 'Hidden from learners'}
                                </p>
                            </div>
                            <Switch
                                isSelected={course.status === 'published'}
                                onValueChange={handlePublishToggle}
                                color="success"
                                size="lg"
                                classNames={{
                                    wrapper: "group-data-[selected=true]:bg-emerald-500"
                                }}
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <Chip size="sm" color={course.isPublished ? "success" : "warning"} variant="flat">
                            {course.isPublished ? "Published" : "Draft"}
                        </Chip>
                        <Chip size="sm" variant="flat" startContent={<Icon icon="mdi:account-group" />}>
                            {course.enrollments?.length || 0} Students
                        </Chip>
                        <Chip size="sm" variant="flat" startContent={<Icon icon="mdi:tag" />}>
                            {course.category || 'Uncategorized'}
                        </Chip>
                        <Chip size="sm" variant="flat" startContent={<Icon icon="mdi:signal-variant" />}>
                            {course.level ? course.level[0].toUpperCase() + course.level.slice(1) : 'N/A'}
                        </Chip>
                    </div>
                </motion.div>

                {/* Course Setup Progress */}
                <motion.div variants={fade}>
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 shadow-sm">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-6  shadow-sm">

                                {/* Progress Circle */}
                                <div className="flex flex-col items-center">
                                    <CircularProgress
                                        value={setupProgress.percentage}
                                        showValueLabel={true}
                                        color="primary"
                                        className="w-20 h-20"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium tracking-wide">
                                        {setupProgress.completed}/{setupProgress.total} steps
                                    </p>
                                </div>

                                {/* Right Side */}
                                <div className="flex-1 space-y-2">

                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Course Setup Progress
                                    </h3>

                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Complete the remaining steps to publish your course.
                                    </p>

                                    {setupProgress.missing.length > 0 && (
                                        <div className="mt-3 space-y-2">

                                            {setupProgress.missing.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
                                                    <span>{item}</span>
                                                </div>
                                            ))}

                                        </div>
                                    )}

                                </div>
                            </div>

                        </CardBody>
                    </Card>
                </motion.div>

                {/* Metrics Row */}
                <motion.div variants={fade} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { label: "Duration", value: `${course.duration || 0} hrs`, icon: "mdi:clock-outline" },
                        { label: "Materials", value: course.materials?.length || 0, icon: "mdi:file-document" },
                        { label: "Assessments", value: (course.quizzes?.length || 0) + (course.assignments?.length || 0), icon: "mdi:clipboard-check" }
                    ].map((m, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex items-center gap-3">
                                <Icon icon={m.icon} className="text-blue-600 text-xl" />
                                <div>
                                    <p className="text-gray-600 text-sm">{m.label}</p>
                                    <p className="text-xl font-semibold text-gray-900">{m.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Course Information */}
                <motion.div variants={fade}>
                    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                        <CardHeader className="p-6 flex gap-3">
                            <Icon icon="mdi:information-outline" className="text-blue-600 text-2xl" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Course Information</h2>
                                <p className="text-gray-600 text-sm">General details and description</p>
                            </div>
                        </CardHeader>

                        <Divider className="bg-gray-200" />

                        <CardBody className="p-6 space-y-4">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Description</p>
                                <p className="text-gray-800 leading-relaxed">
                                    {course.description || "No description provided."}
                                </p>
                            </div>

                            {course.prerequisites?.length > 0 && (
                                <div>
                                    <p className="text-gray-600 text-sm mb-2">Prerequisites</p>
                                    <div className="flex flex-wrap gap-2">
                                        {course.prerequisites.map((prereq, idx) => (
                                            <Chip key={idx} size="sm" variant="flat" color="primary">
                                                {prereq}
                                            </Chip>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {course.tags?.length > 0 && (
                                <div>
                                    <p className="text-gray-600 text-sm mb-2">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {course.tags.map((tag, idx) => (
                                            <Chip key={idx} size="sm" variant="flat">
                                                {tag}
                                            </Chip>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-gray-600 text-sm">Passing Score</p>
                                    <p className="text-gray-900 font-semibold">{course.passingScore || 70}%</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Created</p>
                                    <p className="text-gray-900 font-semibold">
                                        {new Date(course.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Enrolled Students */}
                {course.enrollments?.length > 0 && (
                    <motion.div variants={fade}>
                        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                            <CardHeader className="p-6 flex gap-3">
                                <Icon icon="mdi:account-group" className="text-blue-600 text-2xl" />
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Enrolled Students ({filteredStudents.length})
                                    </h2>
                                    <p className="text-gray-600 text-sm">Active learners in this course</p>
                                </div>
                            </CardHeader>

                            <Divider className="bg-gray-200" />

                            <CardBody className="p-6 space-y-4">
                                {/* Search and Filter */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                        startContent={<Icon icon="mdi:magnify" className="text-gray-400" />}
                                        classNames={{
                                            inputWrapper: "border border-gray-200"
                                        }}
                                        className="flex-1"
                                    />
                                    <Select
                                        placeholder="Filter by status"
                                        selectedKeys={[statusFilter]}
                                        onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0])}
                                        className="sm:w-48"
                                        classNames={{
                                            trigger: "border border-gray-200"
                                        }}
                                    >
                                        <SelectItem key="all">All Statuses</SelectItem>
                                        <SelectItem key="not_started">Not Started</SelectItem>
                                        <SelectItem key="in_progress">In Progress</SelectItem>
                                        <SelectItem key="completed">Completed</SelectItem>
                                        <SelectItem key="failed">Failed</SelectItem>
                                    </Select>
                                </div>

                                {/* Student List */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {filteredStudents.map((enrollment, i) => (
                                        <StudentProgressCard
                                            key={enrollment.id}
                                            enrollment={enrollment}
                                            index={i}
                                        />
                                    ))}
                                </div>

                                {filteredStudents.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No students found matching your criteria
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </motion.div>
                )}

                {/* Action Cards */}
                <motion.div variants={fade} className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Course Management</h2>
                    <p className="text-gray-600 text-sm mb-4">Manage tools & actions for this course</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {actionCards.map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="cursor-pointer"
                                onClick={() => navigate(item.path)}
                            >
                                <div className="border border-gray-200 rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition relative overflow-hidden">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md`}>
                                            <Icon icon={item.icon} className="text-white text-3xl" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                                                {item.count !== undefined && (
                                                    <Chip size="sm" variant="flat" className="bg-blue-100 text-blue-700">
                                                        {item.count}
                                                    </Chip>
                                                )}
                                            </div>

                                            <p className="text-gray-600 text-sm">{item.description}</p>

                                            <div className="flex items-center gap-2 text-blue-600 mt-3 text-sm font-medium">
                                                Manage <Icon icon="mdi:arrow-right" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Publish Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>
                        <h3 className="text-xl font-semibold">
                            {pendingStatus === 'published' ? 'Publish Course?' : 'Unpublish Course?'}
                        </h3>
                    </ModalHeader>
                    <ModalBody>
                        <p className="text-gray-600">
                            {pendingStatus === 'published'
                                ? 'Publishing this course will make it visible to all learners. Make sure all content is ready.'
                                : 'Unpublishing this course will hide it from learners. Enrolled students will lose access.'}
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color={pendingStatus === 'published' ? 'success' : 'warning'}
                            onPress={confirmPublishToggle}
                            isLoading={publishing}
                        >
                            {pendingStatus === 'published' ? 'Publish' : 'Unpublish'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </motion.div>
    );
}
