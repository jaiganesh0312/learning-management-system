import React from 'react';
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import VideoPlayer from './VideoPlayer';

export default function MaterialViewer({
    material,
    enrollmentId,
    progress,
    onProgressUpdate,
    onComplete,
}) {
    if (!material) {
        return (
            <Card className="border border-gray-200 dark:border-gray-800">
                <CardBody className="p-8 text-center">
                    <Icon icon="mdi:file-question" className="text-6xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Select a material to start learning</p>
                </CardBody>
            </Card>
        );
    }

    const renderMaterialContent = () => {
        switch (material.type) {
            case 'video':
                return (
                    <VideoPlayer
                        videoUrl={`${import.meta.env.VITE_API_URL}${material.fileUrl}`}
                        materialId={material.id}
                        enrollmentId={enrollmentId}
                        initialPosition={progress?.lastPlaybackPosition || 0}
                        initialSpeed={progress?.playbackSpeed || 1}
                        onProgressUpdate={onProgressUpdate}
                        onComplete={onComplete}
                    />

                );

            case 'pdf':
            case 'document':
                return (
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-0">
                            {material.fileUrl?.endsWith('.pdf') ? (
                                <iframe
                                    src={material.fileUrl}
                                    className="w-full h-[600px]"
                                    title={material.title}
                                />
                            ) : (
                                <div className="p-8 text-center">
                                    <Icon icon="mdi:file-document" className="text-6xl text-primary mb-4 mx-auto" />
                                    <h3 className="text-xl font-semibold mb-2">{material.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {material.description}
                                    </p>
                                    <Button
                                        color="primary"
                                        startContent={<Icon icon="mdi:download" />}
                                        onPress={() => window.open(material.fileUrl, '_blank')}
                                    >
                                        Download Document
                                    </Button>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                );

            case 'link':
                return (
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-8 text-center">
                            <Icon icon="mdi:link-variant" className="text-6xl text-primary mb-4 mx-auto" />
                            <h3 className="text-xl font-semibold mb-2">{material.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {material.description}
                            </p>
                            <Button
                                color="primary"
                                startContent={<Icon icon="mdi:open-in-new" />}
                                onPress={() => {
                                    window.open(material.fileUrl, '_blank');
                                    // Mark as accessed
                                    if (onProgressUpdate) {
                                        onProgressUpdate({
                                            materialId: material.id,
                                            enrollmentId,
                                            status: 'in_progress',
                                            completionPercentage: 50,
                                        });
                                    }
                                }}
                            >
                                Open Link
                            </Button>
                        </CardBody>
                    </Card>
                );

            case 'scorm':
                return (
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-8 text-center">
                            <Icon icon="mdi:school" className="text-6xl text-orange-500 mb-4 mx-auto" />
                            <h3 className="text-xl font-semibold mb-2">{material.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                SCORM content is not yet supported in this player.
                            </p>
                            <Button
                                color="warning"
                                startContent={<Icon icon="mdi:information" />}
                                onPress={() => window.open(material.fileUrl, '_blank')}
                            >
                                Try Opening Externally
                            </Button>
                        </CardBody>
                    </Card>
                );

            default:
                return (
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-8 text-center">
                            <Icon icon="mdi:file" className="text-6xl text-gray-400 mb-4 mx-auto" />
                            <h3 className="text-xl font-semibold mb-2">{material.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {material.description}
                            </p>
                            {material.fileUrl && (
                                <Button
                                    color="primary"
                                    startContent={<Icon icon="mdi:download" />}
                                    onPress={() => window.open(material.fileUrl, '_blank')}
                                >
                                    Download Material
                                </Button>
                            )}
                        </CardBody>
                    </Card>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* Material Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {material.title}
                    </h2>
                    {material.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {material.description}
                        </p>
                    )}
                </div>
                {progress?.completedAt && (
                    <div className="flex items-center gap-2 text-success">
                        <Icon icon="mdi:check-circle" className="text-2xl" />
                        <span className="font-medium">Completed</span>
                    </div>
                )}
            </div>

            {/* Material Content */}
            {renderMaterialContent()}

            {/* Material Info */}
            <Card className="border border-gray-200 dark:border-gray-800">
                <CardBody className="p-4">
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:file-outline" />
                            <span className="capitalize">{material.type}</span>
                        </div>
                        {material.duration && (
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:clock-outline" />
                                <span>{Math.floor(material.duration / 60)} min</span>
                            </div>
                        )}
                        {material.isRequired && (
                            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                <Icon icon="mdi:star" />
                                <span>Required</span>
                            </div>
                        )}
                        {progress && (
                            <div className="flex items-center gap-2 text-primary">
                                <Icon icon="mdi:progress-check" />
                                <span>{Math.floor(progress.completionPercentage || 0)}% Complete</span>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
