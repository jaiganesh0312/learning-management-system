import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Chip, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { certificateService } from '@/services';
import { PageHeader, LoadingSpinner, EmptyState } from '@/components/common';

export default function MyCertificates() {
    const [loading, setLoading] = useState(true);
    const [certificates, setCertificates] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const response = await certificateService.getMyCertificates();
            if (response?.data?.success) {
                setCertificates(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage />;
    }

    // Filter certificates by search query
    const filteredCertificates = certificates.filter(cert =>
        cert.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="My Certificates"
                    description="View and download your earned certificates"
                    icon="mdi:certificate"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Certificates' }
                    ]}
                />

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Certificates</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{certificates.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:certificate" className="text-2xl text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Month</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {certificates.filter(c => {
                                            const issueDate = new Date(c.issuedAt);
                                            const now = new Date();
                                            return issueDate.getMonth() === now.getMonth() && issueDate.getFullYear() === now.getFullYear();
                                        }).length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:calendar-month" className="text-2xl text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Year</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {certificates.filter(c => {
                                            const issueDate = new Date(c.issuedAt);
                                            const now = new Date();
                                            return issueDate.getFullYear() === now.getFullYear();
                                        }).length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:calendar-year" className="text-2xl text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Search */}
                {certificates.length > 0 && (
                    <div className="mb-6">
                        <Input
                            isClearable
                            className="max-w-md"
                            placeholder="Search certificates..."
                            startContent={<Icon icon="mdi:magnify" />}
                            value={searchQuery}
                            onClear={() => setSearchQuery('')}
                            onValueChange={setSearchQuery}
                        />
                    </div>
                )}

                {/* Certificates Grid */}
                {filteredCertificates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCertificates.map((certificate) => (
                            <motion.div
                                key={certificate.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="border border-gray-200 dark:border-gray-800 hover:border-yellow-500 dark:hover:border-yellow-500 transition-all">
                                    <CardBody className="p-6">
                                        {/* Certificate Icon */}
                                        <div className="w-full h-40 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                                            <Icon icon="mdi:certificate" className="text-6xl text-white" />
                                        </div>

                                        {/* Certificate Info */}
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                                                    {certificate.title || certificate.course?.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {certificate.course?.title}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Icon icon="mdi:calendar" className="text-lg" />
                                                <span>Issued on {new Date(certificate.issuedAt).toLocaleDateString()}</span>
                                            </div>

                                            {certificate.certificateNumber && (
                                                <div className="flex items-center gap-2">
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        startContent={<Icon icon="mdi:identifier" />}
                                                    >
                                                        {certificate.certificateNumber}
                                                    </Chip>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    as={Link}
                                                    to={`/certificates/${certificate.id}`}
                                                    color="primary"
                                                    variant="flat"
                                                    className="flex-1"
                                                    startContent={<Icon icon="mdi:eye" />}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    color="primary"
                                                    variant="solid"
                                                    className="flex-1"
                                                    startContent={<Icon icon="mdi:download" />}
                                                    onPress={() => {
                                                        // Download functionality would be implemented here
                                                        console.log('Download certificate:', certificate.id);
                                                    }}
                                                >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="mdi:certificate-outline"
                        title={searchQuery ? "No certificates found" : "No certificates yet"}
                        description={searchQuery ? "Try adjusting your search query" : "Complete courses to earn certificates"}
                        actionLabel={searchQuery ? undefined : "Browse Courses"}
                        onAction={searchQuery ? undefined : () => window.location.href = '/courses'}
                    />
                )}
            </div>
        </div>
    );
}
