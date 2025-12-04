import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { certificateService } from '@/services';
import { PageHeader, LoadingSpinner, EmptyState } from '@/components/common';

export default function CertificateView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [certificate, setCertificate] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchCertificate();
    }, [id]);

    const fetchCertificate = async () => {
        try {
            setLoading(true);
            setError(false);
            const response = await certificateService.getCertificate(id);
            if (response?.data?.success) {
                setCertificate(response.data.data);
            } else {
                setError(true);
            }
        } catch (error) {
            console.error('Error fetching certificate:', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        // In a real implementation, this would download the PDF
        console.log('Downloading certificate:', certificate.id);
        // You could trigger a download by creating a link element
        // or calling a backend endpoint that generates/returns the PDF
    };

    const handleShare = () => {
        // Share functionality
        if (navigator.share) {
            navigator.share({
                title: `Certificate - ${certificate.title}`,
                text: `I earned a certificate for ${certificate.course?.title}!`,
                url: window.location.href
            }).catch(err => console.log('Share failed:', err));
        } else {
            // Fallback - copy link to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage />;
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <EmptyState
                        icon="mdi:certificate-outline"
                        title="Certificate not found"
                        description="The certificate you're looking for doesn't exist or has been removed"
                        actionLabel="Back to Certificates"
                        onAction={() => navigate('/certificates')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Certificate Details"
                    description="View and download your certificate"
                    icon="mdi:certificate"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Certificates', href: '/certificates' },
                        { label: 'View Certificate' }
                    ]}
                    actions={[
                        {
                            label: 'Download',
                            icon: 'mdi:download',
                            color: 'primary',
                            onClick: handleDownload
                        },
                        {
                            label: 'Share',
                            icon: 'mdi:share-variant',
                            color: 'secondary',
                            variant: 'flat',
                            onClick: handleShare
                        }
                    ]}
                />

                {/* Certificate Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border-2 border-yellow-500 dark:border-yellow-600 mb-6">
                        <CardBody className="p-12">
                            {/* Certificate Design */}
                            <div className="text-center space-y-6">
                                {/* Header */}
                                <div className="border-b-4 border-yellow-500 pb-6">
                                    <Icon icon="mdi:certificate" className="text-8xl text-yellow-600 mb-4 mx-auto" />
                                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                        Certificate of Completion
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                                        This is to certify that
                                    </p>
                                </div>

                                {/* Recipient */}
                                <div className="py-6">
                                    <h2 className="text-3xl font-bold text-primary-600 mb-4">
                                        {certificate.user?.firstName} {certificate.user?.lastName}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                                        has successfully completed the course
                                    </p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {certificate.course?.title || certificate.title}
                                    </h3>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-6 py-6 border-t border-gray-200 dark:border-gray-800">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Issue Date</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    {certificate.certificateNumber && (
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Certificate Number</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {certificate.certificateNumber}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Verification Code QR */}
                                {certificate.verificationCode && (
                                    <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Verification Code</p>
                                        <Chip
                                            size="lg"
                                            variant="flat"
                                            color="primary"
                                            className="font-mono"
                                        >
                                            {certificate.verificationCode}
                                        </Chip>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Certificate Metadata */}
                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardBody className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Certificate Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Icon icon="mdi:book-open-page-variant" className="text-xl text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Course</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {certificate.course?.title}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Icon icon="mdi:calendar-check" className="text-xl text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed On</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {new Date(certificate.issuedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {certificate.course?.category && (
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Icon icon="mdi:tag" className="text-xl text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {certificate.course.category}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {certificate.course?.duration && (
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Icon icon="mdi:clock-outline" className="text-xl text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {certificate.course.duration} hours
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
