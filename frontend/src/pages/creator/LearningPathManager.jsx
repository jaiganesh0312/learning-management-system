import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card, CardBody, Button, Input,
    Chip, Tooltip, Pagination
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';
import { learningPathService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable } from '@/components/common';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function LearningPathManager() {
    const navigate = useNavigate();
    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPaths();
    }, [page, search]);

    const fetchPaths = async () => {
        try {
            setLoading(true);
            const response = await learningPathService.getAllLearningPaths({
                page,
                limit: 10,
                search
            });
            if (response?.data?.success) {
                setPaths(response.data.data.learningPaths);
                setTotalPages(response.data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching learning paths:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this learning path?')) {
            try {
                await learningPathService.deleteLearningPath(id);
                fetchPaths();
            } catch (error) {
                console.error('Error deleting learning path:', error);
            }
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'NAME',
            render: (path) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                        <Icon icon="mdi:road-variant" className="text-white text-lg" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{path.name}</p>
                        <p className="text-tiny text-gray-500 truncate max-w-xs">{path.description}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'category',
            label: 'CATEGORY',
            render: (path) => (
                <Chip size="sm" variant="flat" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {path.category || 'Uncategorized'}
                </Chip>
            )
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (path) => (
                <Chip
                    color={path.isPublished ? "success" : "warning"}
                    variant="flat"
                    size="sm"
                    startContent={<Icon icon={path.isPublished ? "mdi:check-circle" : "mdi:pencil"} className="text-sm" />}
                >
                    {path.isPublished ? "Published" : "Draft"}
                </Chip>
            )
        },
        {
            key: 'creator',
            label: 'CREATED BY',
            render: (path) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-medium">
                        {path.creator?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{path.creator?.name || 'Unknown'}</span>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            render: (path) => (
                <div className="flex gap-1">
                    <Tooltip content="Edit">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            onPress={() => navigate(`/creator/learning-paths/${path.id}/edit`)}
                        >
                            <Icon icon="mdi:pencil" className="text-lg" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Delete" color="danger">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            onPress={() => handleDelete(path.id)}
                        >
                            <Icon icon="mdi:trash-can" className="text-lg" />
                        </Button>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/20 py-8">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <motion.div variants={itemVariants}>
                    <PageHeader
                        title="Learning Paths"
                        description="Manage learning paths and curriculums"
                        icon="mdi:road-variant"
                        action={
                            <Button
                                color="primary"
                                startContent={<Icon icon="mdi:plus" />}
                                onPress={() => navigate('/creator/learning-paths/create')}
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
                            >
                                Create Path
                            </Button>
                        }
                    />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border border-gray-200/60 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none backdrop-blur-sm">
                        <CardBody className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <Input
                                    placeholder="Search paths..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    startContent={<Icon icon="mdi:magnify" className="text-gray-400" />}
                                    className="max-w-xs"
                                    classNames={{
                                        inputWrapper: "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 focus-within:!border-indigo-500"
                                    }}
                                />
                            </div>

                            <DataTable
                                data={paths}
                                columns={columns}
                                loading={loading}
                                pagination={false}
                                searchable={false}
                                emptyContent={
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-16"
                                    >
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                                            <Icon icon="mdi:road-variant" className="text-4xl text-violet-600 dark:text-violet-400" />
                                        </div>
                                        <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Learning Paths Found</p>
                                        <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first learning path to get started.</p>
                                        <Button
                                            color="primary"
                                            variant="flat"
                                            startContent={<Icon icon="mdi:plus" />}
                                            onPress={() => navigate('/creator/learning-paths/create')}
                                            className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                                        >
                                            Create Learning Path
                                        </Button>
                                    </motion.div>
                                }
                            />

                            {totalPages > 1 && (
                                <motion.div
                                    className="flex justify-center mt-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Pagination
                                        total={totalPages}
                                        page={page}
                                        onChange={setPage}
                                        color="secondary"
                                        classNames={{
                                            cursor: "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md"
                                        }}
                                    />
                                </motion.div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
