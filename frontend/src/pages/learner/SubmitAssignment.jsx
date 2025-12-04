import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, Button, Chip, Divider, Tabs, Tab, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import assessmentService from '@/services/assessmentService';
import AssignmentSubmissionForm from '@/components/learner/AssignmentSubmissionForm';
import GradedAssignmentView from '@/components/learner/GradedAssignmentView';
import { format } from 'date-fns';

export default function SubmitAssignment() {
    const { assignmentId } = useParams();
    const navigate = useNavigate();

    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [activeTab, setActiveTab] = useState('submit');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAssignmentData();
    }, [assignmentId]);

    const loadAssignmentData = async () => {
        try {
            setLoading(true);

            // Get assignment details
            const assignmentResponse = await assessmentService.getAssignment(assignmentId);
            if (!assignmentResponse?.data?.success) {
                addToast({
                    title: 'Failed to load assignment',
                    description: 'Failed to load assignment',
                    color: 'danger',
                })
                navigate(-1);
                return;
            }
            setAssignment(assignmentResponse.data.data);

            // Get submission history
            const submissionsResponse = await assessmentService.getMySubmissions(assignmentId);
            if (submissionsResponse?.data?.success) {
                setSubmissions(submissionsResponse.data.data.submissions || []);

                // If there's a graded submission, switch to history tab
                const hasGradedSubmission = submissionsResponse.data.data.submissions?.some(s => s.score !== null);
                if (hasGradedSubmission) {
                    setActiveTab('history');
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading assignment:', error);
            addToast({
                title: 'Failed to load assignment data',
                description: 'Failed to load assignment data',
                color: 'danger',
            })
            setLoading(false);
        }
    };

    const handleSubmissionSuccess = () => {
        addToast({
            title: 'Assignment submitted successfully',
            description: 'Assignment submitted successfully',
            color: 'success',
        })
        loadAssignmentData();
        setActiveTab('history');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Icon icon="mdi:loading" className="animate-spin text-4xl text-primary" />
            </div>
        );
    }

    const isOverdue = assignment?.dueDate && new Date(assignment.dueDate) < new Date();
    const latestSubmission = submissions[0];
    const isGraded = latestSubmission?.score !== null && latestSubmission?.score !== undefined;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-6 max-w-6xl"
        >
            {/* Assignment Header */}
            <Card className="mb-6">
                <CardHeader className="flex flex-col items-start gap-4">
                    <div className="flex justify-between items-start w-full">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onPress={() => navigate(-1)}
                                >
                                    <Icon icon="mdi:arrow-left" className="text-xl" />
                                </Button>
                                <h1 className="text-2xl font-bold">{assignment?.title}</h1>
                            </div>
                            {assignment?.description && (
                                <p className="text-gray-600 dark:text-gray-400 ml-10">
                                    {assignment.description}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {assignment?.isRequired && (
                                <Chip color="danger" variant="flat" startContent={<Icon icon="mdi:star" />}>
                                    Required
                                </Chip>
                            )}
                            {isOverdue && !latestSubmission && (
                                <Chip color="danger" startContent={<Icon icon="mdi:alert" />}>
                                    Overdue
                                </Chip>
                            )}
                            {isGraded && (
                                <Chip
                                    color={latestSubmission.score >= assignment.maxScore * 0.7 ? 'success' : 'warning'}
                                    startContent={<Icon icon="mdi:check-circle" />}
                                >
                                    Graded: {latestSubmission.score}/{assignment.maxScore}
                                </Chip>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:calendar" className="text-2xl text-primary" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                                <p className="font-semibold">
                                    {assignment?.dueDate
                                        ? format(new Date(assignment.dueDate), 'MMM dd, yyyy HH:mm')
                                        : 'No deadline'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:star" className="text-2xl text-warning" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Max Score</p>
                                <p className="font-semibold">{assignment?.maxScore} points</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:file-document" className="text-2xl text-success" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Submissions</p>
                                <p className="font-semibold">{submissions.length}</p>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Tabs */}
            <Tabs
                selectedKey={activeTab}
                onSelectionChange={setActiveTab}
                color="primary"
                variant="underlined"
                className="mb-6"
            >
                <Tab key="submit" title={
                    <div className="flex items-center gap-2">
                        <Icon icon="mdi:upload" />
                        <span>Submit</span>
                    </div>
                }>
                    {assignment?.instructions && (
                        <Card className="mb-6">
                            <CardHeader>
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Icon icon="mdi:information" className="text-primary" />
                                    Instructions
                                </h3>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                <div className="prose dark:prose-invert max-w-none">
                                    {assignment.instructions.split('\n').map((line, idx) => (
                                        <p key={idx}>{line}</p>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    <AssignmentSubmissionForm
                        assignment={assignment}
                        onSuccess={handleSubmissionSuccess}
                        isOverdue={isOverdue}
                    />
                </Tab>

                <Tab key="history" title={
                    <div className="flex items-center gap-2">
                        <Icon icon="mdi:history" />
                        <span>Submission History</span>
                        {submissions.length > 0 && (
                            <Chip size="sm" color="primary">{submissions.length}</Chip>
                        )}
                    </div>
                }>
                    {submissions.length === 0 ? (
                        <Card>
                            <CardBody className="text-center py-12">
                                <Icon icon="mdi:file-document-outline" className="text-6xl text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">No submissions yet</p>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {submissions.map((submission, idx) => (
                                <GradedAssignmentView
                                    key={submission.id}
                                    submission={submission}
                                    assignment={assignment}
                                    isLatest={idx === 0}
                                />
                            ))}
                        </div>
                    )}
                </Tab>
            </Tabs>
        </motion.div>
    );
}
