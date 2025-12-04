import React, { useEffect, useState } from 'react';
import { Card, CardBody } from "@heroui/react";
import { motion } from 'framer-motion';
import { complianceService, departmentService } from '@/services';
import { PageHeader, LoadingSpinner, FilterPanel, DataTable } from '@/components/common';

export default function ComplianceReports() {
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);
    const [filters, setFilters] = useState({});
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        fetchReports();
    }, [filters]);

    const fetchDepartments = async () => {
        try {
            const response = await departmentService.getAllDepartments();
            if (response?.data?.success) {
                setDepartments(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await complianceService.getDepartmentComplianceStatus(filters);
            if (response?.data?.success) {
                setReports(response.data.data.departments || []);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterConfig = [
        {
            key: 'departmentId',
            type: 'select',
            label: 'Department',
            options: departments.map(d => ({ label: d.name, value: d.id }))
        },
        {
            key: 'pathId', // Added pathId filter as it's supported by backend
            type: 'text', // Using text for now, could be select if we fetch paths
            label: 'Learning Path ID (Optional)',
            hidden: true // Hiding for now as we don't have a path selector yet, but keeping structure
        }
    ];

    const columns = [
        { key: 'departmentName', label: 'Department' },
        {
            key: 'complianceRate',
            label: 'Compliance Rate',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className={`font-bold ${row.complianceRate >= 80 ? 'text-green-600' :
                        row.complianceRate >= 50 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                        {row.complianceRate}%
                    </span>
                </div>
            )
        },
        { key: 'completed', label: 'Completed' },
        { key: 'inProgress', label: 'In Progress' },
        { key: 'overdue', label: 'Overdue' },
        { key: 'totalMembers', label: 'Total Members' }
    ];

    if (loading && reports.length === 0) return <LoadingSpinner fullPage />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <PageHeader
                    title="Compliance Reports"
                    description="Detailed compliance reporting and analytics by department"
                    icon="mdi:file-chart"
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <FilterPanel
                            filters={filterConfig}
                            values={filters}
                            onChange={setFilters}
                            onReset={() => setFilters({})}
                        />
                    </div>

                    <div className="lg:col-span-3">
                        <Card className="border border-gray-200 dark:border-gray-800">
                            <CardBody className="p-6">
                                <DataTable
                                    data={reports}
                                    columns={columns}
                                    searchPlaceholder="Search departments..."
                                />
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
