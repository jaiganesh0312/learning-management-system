import React from 'react';
import { Card, CardBody, Progress, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';

export default function ProgressCard({ progress }) {
    const {
        totalAssessments = 0,
        completedAssessments = 0,
        quizzesCompleted = 0,
        totalQuizzes = 0,
        assignmentsCompleted = 0,
        totalAssignments = 0,
        averageScore = 0,
    } = progress || {};

    const overallProgress = totalAssessments > 0
        ? (completedAssessments / totalAssessments) * 100
        : 0;

    const quizProgress = totalQuizzes > 0
        ? (quizzesCompleted / totalQuizzes) * 100
        : 0;

    const assignmentProgress = totalAssignments > 0
        ? (assignmentsCompleted / totalAssignments) * 100
        : 0;

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'success';
        if (percentage >= 50) return 'primary';
        if (percentage >= 30) return 'warning';
        return 'danger';
    };

    return (
        <Card>
            <CardBody className="gap-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Icon icon="mdi:chart-line" className="text-primary" />
                        Your Progress
                    </h3>
                    <Chip
                        color={getProgressColor(overallProgress)}
                        variant="flat"
                        size="lg"
                    >
                        {Math.round(overallProgress)}%
                    </Chip>
                </div>

                {/* Overall Progress */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Overall Completion</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {completedAssessments} / {totalAssessments} Assessments
                        </span>
                    </div>
                    <Progress
                        value={overallProgress}
                        color={getProgressColor(overallProgress)}
                        size="lg"
                        className="mb-1"
                    />
                </div>

                {/* Quizzes Progress */}
                {totalQuizzes > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium flex items-center gap-2">
                                <Icon icon="mdi:clipboard-check" className="text-primary" />
                                Quizzes
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {quizzesCompleted} / {totalQuizzes}
                            </span>
                        </div>
                        <Progress
                            value={quizProgress}
                            color={getProgressColor(quizProgress)}
                            size="md"
                        />
                    </div>
                )}

                {/* Assignments Progress */}
                {totalAssignments > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium flex items-center gap-2">
                                <Icon icon="mdi:file-document-edit" className="text-success" />
                                Assignments
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {assignmentsCompleted} / {totalAssignments}
                            </span>
                        </div>
                        <Progress
                            value={assignmentProgress}
                            color={getProgressColor(assignmentProgress)}
                            size="md"
                        />
                    </div>
                )}

                {/* Average Score */}
                {averageScore > 0 && (
                    <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white dark:bg-gray-800 rounded-full p-2">
                                    <Icon icon="mdi:star" className="text-2xl text-warning" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                                    <p className="text-2xl font-bold text-primary">{averageScore.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Achievements */}
                <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-200 dark:border-gray-700">
                    {overallProgress === 100 && (
                        <Chip
                            color="success"
                            variant="flat"
                            size="sm"
                            startContent={<Icon icon="mdi:trophy" />}
                        >
                            Course Completed
                        </Chip>
                    )}
                    {averageScore >= 90 && (
                        <Chip
                            color="warning"
                            variant="flat"
                            size="sm"
                            startContent={<Icon icon="mdi:medal" />}
                        >
                            Excellent Performance
                        </Chip>
                    )}
                    {quizProgress === 100 && totalQuizzes > 0 && (
                        <Chip
                            color="primary"
                            variant="flat"
                            size="sm"
                            startContent={<Icon icon="mdi:check-all" />}
                        >
                            All Quizzes Done
                        </Chip>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
