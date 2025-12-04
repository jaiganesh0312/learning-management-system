import React from 'react';
import { Card, CardBody, CardHeader, Chip, Divider, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function AssessmentList({ assessments, courseId }) {
    const navigate = useNavigate();
    const { quizzes = [], assignments = [] } = assessments || {};

    const getQuizStatusColor = (quiz) => {
        if (!quiz.availableFrom && !quiz.availableUntil) return 'success';

        const now = new Date();
        const from = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
        const until = quiz.availableUntil ? new Date(quiz.availableUntil) : null;

        if (from && now < from) return 'default';
        if (until && now > until) return 'danger';
        return 'success';
    };

    const getQuizStatus = (quiz) => {
        if (!quiz.availableFrom && !quiz.availableUntil) return 'Available';

        const now = new Date();
        const from = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
        const until = quiz.availableUntil ? new Date(quiz.availableUntil) : null;

        if (from && now < from) return `Opens ${format(from, 'MMM dd')}`;
        if (until && now > until) return 'Closed';
        return 'Available';
    };

    const getAssignmentStatus = (assignment) => {
        if (!assignment.dueDate) return { text: 'No deadline', color: 'default' };

        const dueDate = new Date(assignment.dueDate);
        const now = new Date();
        const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);

        if (hoursUntilDue < 0) {
            return { text: 'Overdue', color: 'danger' };
        } else if (hoursUntilDue < 24) {
            return { text: `Due in ${Math.floor(hoursUntilDue)}h`, color: 'warning' };
        } else {
            return { text: `Due ${format(dueDate, 'MMM dd')}`, color: 'success' };
        }
    };

    if (quizzes.length === 0 && assignments.length === 0) {
        return (
            <Card>
                <CardBody className="text-center py-12">
                    <Icon icon="mdi:clipboard-text-outline" className="text-6xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No assessments available yet</p>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quizzes Section */}
            {quizzes.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Icon icon="mdi:clipboard-check" className="text-primary" />
                        Quizzes ({quizzes.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quizzes.map((quiz) => {
                            const status = getQuizStatus(quiz);
                            const statusColor = getQuizStatusColor(quiz);
                            const isAvailable = statusColor === 'success';

                            return (
                                <Card key={quiz.id} isPressable={isAvailable} className="hover:scale-[1.02] transition-transform">
                                    <CardHeader className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg mb-1">{quiz.title}</h4>
                                            {quiz.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {quiz.description}
                                                </p>
                                            )}
                                        </div>
                                        {quiz.isRequired && (
                                            <Chip size="sm" color="danger" variant="flat">
                                                Required
                                            </Chip>
                                        )}
                                    </CardHeader>
                                    <Divider />
                                    <CardBody>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <Icon icon="mdi:help-circle" />
                                                    <span>{quiz.questionCount || 0} Questions</span>
                                                </div>
                                                {quiz.timeLimit && (
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <Icon icon="mdi:clock-outline" />
                                                        <span>{quiz.timeLimit} min</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <Icon icon="mdi:target" />
                                                    <span>Pass: {quiz.passingScore}%</span>
                                                </div>
                                                {quiz.maxAttempts && (
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <Icon icon="mdi:refresh" />
                                                        <span>{quiz.maxAttempts} Attempts</span>
                                                    </div>
                                                )}
                                            </div>

                                            <Divider />

                                            <div className="flex items-center justify-between">
                                                <Chip size="sm" color={statusColor} variant="flat">
                                                    {status}
                                                </Chip>
                                                <Button
                                                    color="primary"
                                                    size="sm"
                                                    onPress={() => navigate(`/learner/quiz/${quiz.id}`)}
                                                    isDisabled={!isAvailable}
                                                    endContent={<Icon icon="mdi:arrow-right" />}
                                                >
                                                    {isAvailable ? 'Take Quiz' : 'View'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Assignments Section */}
            {assignments.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Icon icon="mdi:file-document-edit" className="text-success" />
                        Assignments ({assignments.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assignments.map((assignment) => {
                            const status = getAssignmentStatus(assignment);

                            return (
                                <Card key={assignment.id} isPressable className="hover:scale-[1.02] transition-transform">
                                    <CardHeader className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg mb-1">{assignment.title}</h4>
                                            {assignment.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {assignment.description}
                                                </p>
                                            )}
                                        </div>
                                        {assignment.isRequired && (
                                            <Chip size="sm" color="danger" variant="flat">
                                                Required
                                            </Chip>
                                        )}
                                    </CardHeader>
                                    <Divider />
                                    <CardBody>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <Icon icon="mdi:star" />
                                                    <span>{assignment.maxScore} Points</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <Icon icon="mdi:upload" />
                                                    <span className="capitalize">{assignment.submissionType}</span>
                                                </div>
                                            </div>

                                            <Divider />

                                            <div className="flex items-center justify-between">
                                                <Chip size="sm" color={status.color} variant="flat">
                                                    {status.text}
                                                </Chip>
                                                <Button
                                                    color="primary"
                                                    size="sm"
                                                    onPress={() => navigate(`/learner/assignment/${assignment.id}`)}
                                                    endContent={<Icon icon="mdi:arrow-right" />}
                                                >
                                                    {status.text === 'Overdue' ? 'View' : 'Submit'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
