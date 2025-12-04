import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card, CardBody, Button, Input,
    Chip, Tooltip, Pagination
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { learningPathService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable } from '@/components/common';

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
                <div>
                    <p className="font-semibold">{path.name}</p>
                    <p className="text-tiny text-gray-500 truncate max-w-xs">{path.description}</p>
                </div>
            )
        },
        { key: 'category', label: 'CATEGORY' },
        {
            key: 'status',
            label: 'STATUS',
            render: (path) => (
                <Chip color={path.isPublished ? "success" : "warning"} variant="flat" size="sm">
                    {path.isPublished ? "Published" : "Draft"}
                </Chip>
            )
        },
        {
            key: 'creator',
            label: 'CREATED BY',
            render: (path) => (
                <div className="flex items-center gap-2">
                    <span className="text-sm">{path.creator?.name}</span>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            render: (path) => (
                <div className="flex gap-2">
                    <Tooltip content="Edit">
                        <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => navigate(`/creator/learning-paths/${path.id}/edit`)}>
                            <Icon icon="mdi:pencil" />
                        </span>
                    </Tooltip>
                    <Tooltip content="Delete">
                        <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(path.id)}>
                            <Icon icon="mdi:trash-can" />
                        </span>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Learning Paths"
                    description="Manage learning paths and curriculums"
                    icon="mdi:road-variant"
                    action={
                        <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={() => navigate('/creator/learning-paths/create')}>
                            Create Path
                        </Button>
                    }
                />

                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardBody className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <Input
                                placeholder="Search paths..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                startContent={<Icon icon="mdi:magnify" />}
                                className="max-w-xs"
                            />
                        </div>

                        <DataTable
                            data={paths}
                            columns={columns}
                            loading={loading}
                            pagination={false}
                            searchable={false}
                            emptyContent={
                                <div className="text-center py-12 text-gray-500">
                                    <Icon icon="mdi:road-variant" className="text-6xl mx-auto mb-4 opacity-50" />
                                    <p className="text-xl font-semibold">No Learning Paths Found</p>
                                    <p>Create your first learning path to get started.</p>
                                </div>
                            }
                        />

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-4">
                                <Pagination
                                    total={totalPages}
                                    page={page}
                                    onChange={setPage}
                                    color="primary"
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
