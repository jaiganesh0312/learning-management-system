import React from 'react';
import { Card, CardBody, CardHeader, Chip, Divider, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';

export default function GradedAssignmentView({ submission, assignment, isLatest }) {
    const isGraded = submission?.score !== null && submission?.score !== undefined;
    const scorePercentage = isGraded ? (submission.score / assignment.maxScore) * 100 : 0;

    const getScoreColor = () => {
        if (scorePercentage >= 90) return 'success';
        if (scorePercentage >= 70) return 'primary';
        if (scorePercentage >= 50) return 'warning';
        return 'danger';
    };

    const handleDownload = () => {
        if (submission.filePath) {
            window.open(submission.filePath, '_blank');
        }
    };

    return (
        <Card className={isLatest ? 'border-2 border-primary' : ''}>
            <CardHeader className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">
                            Submission {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
                        </h4>
                        {isLatest && (
                            <Chip size="sm" color="primary" variant="flat">Latest</Chip>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Submitted {format(new Date(submission.submittedAt), 'PPp')}
                    </p>
                </div>

                {isGraded ? (
                    <Chip
                        color={getScoreColor()}
                        size="lg"
                        variant="flat"
                        startContent={<Icon icon="mdi:star" />}
                    >
                        {submission.score} / {assignment.maxScore}
                    </Chip>
                ) : (
                    <Chip color="default" variant="flat" startContent={<Icon icon="mdi:clock-outline" />}>
                        Pending Review
                    </Chip>
                )}
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
                {/* Submission Text */}
                {submission.submissionText && (
                    <div>
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                            <Icon icon="mdi:text" className="text-primary" />
                            Submission Text
                        </h5>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <p className="whitespace-pre-wrap text-sm">{submission.submissionText}</p>
                        </div>
                    </div>
                )}

                {/* Uploaded File */}
                {submission.filePath && (
                    <div>
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                            <Icon icon="mdi:file-document" className="text-primary" />
                            Uploaded File
                        </h5>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Icon icon="mdi:file-pdf-box" className="text-3xl text-danger" />
                                <div>
                                    <p className="font-medium">{submission.filePath.split('/').pop()}</p>
                                    <p className="text-xs text-gray-500">Click to download</p>
                                </div>
                            </div>
                            <Button
                                color="primary"
                                variant="flat"
                                size="sm"
                                onPress={handleDownload}
                                startContent={<Icon icon="mdi:download" />}
                            >
                                Download
                            </Button>
                        </div>
                    </div>
                )}

                {/* Feedback */}
                {isGraded && submission.feedback && (
                    <div>
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                            <Icon icon="mdi:comment-text" className="text-primary" />
                            Instructor Feedback
                        </h5>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm">{submission.feedback}</p>
                        </div>
                    </div>
                )}

                {/* Grading Details */}
                {isGraded && (
                    <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Icon icon="mdi:account" />
                            <span>Graded by Instructor</span>
                        </div>
                        {submission.gradedAt && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Icon icon="mdi:calendar" />
                                <span>{format(new Date(submission.gradedAt), 'MMM dd, yyyy')}</span>
                            </div>
                        )}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
