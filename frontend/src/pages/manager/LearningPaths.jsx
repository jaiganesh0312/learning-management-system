import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button } from "@heroui/react";
import { learningPathService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable } from '@/components/common';

export default function LearningPaths() {
    const [loading, setLoading] = useState(true);
    const [paths, setPaths] = useState([]);

    useEffect(() => {
        fetchPaths();
    }, []);

    const fetchPaths = async () => {
        try {
            setLoading(true);
            const response = await learningPathService.getAllLearningPaths();
            if (response?.data?.success) {
                setPaths(response.data.data.learningPaths);
            }
        } catch (error) {
            console.error('Error fetching learning paths:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { key: 'name', label: 'Learning Path' },
        { key: 'courses', label: 'Courses' },
        { key: 'duration', label: 'Est. Duration' },
        { key: 'actions', label: 'Actions' }
    ];

    const tableData = paths.map(path => ({
        id: path.id,
        name: path.name,
        courses: path.courses?.length || 0,
        duration: `${path.estimatedDuration || 0} hours`,
        actions: (
            <div className="flex items-center gap-2">
                <Button size="sm" variant="light" color="primary" onPress={() => console.log('View path', path.id)}>
                    View
                </Button>
            </div>
        )
    }));

    if (loading) return <LoadingSpinner fullPage />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Learning Paths"
                    description="Manage team learning journeys"
                    icon="mdi:routes"
                />

                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardBody className="p-6">
                        <DataTable
                            data={tableData}
                            columns={columns}
                            searchPlaceholder="Search learning paths..."
                        />
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
