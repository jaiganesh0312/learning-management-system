import React, { useState, useEffect } from 'react';
import {
    Card, CardBody, Button, Input,
    Chip, Tooltip, Pagination, Select, SelectItem,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';
import { assessmentService } from '@/services';
import { PageHeader, LoadingSpinner, DataTable } from '@/components/common';

export default function GradingDashboard() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('submitted'); // Default to pending/submitted
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Grading Modal State
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ score: '', feedback: '' });
    const [grading, setGrading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, [page, search, statusFilter]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await assessmentService.getSubmissions({
                page,
                limit: 10,
                search,
                status: statusFilter === 'all' ? undefined : statusFilter
            });
            if (response?.data?.success) {
                setSubmissions(response.data.data.submissions);
                setTotalPages(response.data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenGrade = (submission) => {
        setSelectedSubmission(submission);
        setGradeData({
            score: submission.score || '',
            feedback: submission.feedback || ''
        });
        setIsModalOpen(true);
    };

    const handleGradeSubmit = async () => {
        try {
            setGrading(true);
            const response = await assessmentService.gradeSubmission(selectedSubmission.id, {
                score: parseFloat(gradeData.score),
                feedback: gradeData.feedback
            });
            if (response?.data?.success) {
                setIsModalOpen(false);
                fetchSubmissions();
            }
        } catch (error) {
            console.error('Error grading submission:', error);
        } finally {
            setGrading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'graded': return 'success';
            case 'submitted': return 'warning';
            case 'returned': return 'danger';
            default: return 'default';
        }
    };

    const columns = [
        {
            key: 'student',
            label: 'STUDENT',
            render: (sub) => (
                <div className="flex items-center gap-2">
                    {sub.user?.avatarUrl && <img src={sub.user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />}
                    <div>
                        <p className="font-semibold">{sub.user?.firstName} {sub.user?.lastName}</p>
                        <p className="text-tiny text-gray-500">{sub.user?.email}</p>
                    </div>
                </div>
            )
        },
        { key: 'assignment.title', label: 'ASSIGNMENT' },
        { key: 'assignment.course.title', label: 'COURSE' },
        {
            key: 'submittedAt',
            label: 'SUBMITTED',
            render: (sub) => new Date(sub.submittedAt).toLocaleDateString()
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (sub) => (
                <Chip color={getStatusColor(sub.status)} variant="flat" size="sm">
                    {sub.status.toUpperCase()}
                </Chip>
            )
        },
        {
            key: 'score',
            label: 'SCORE',
            render: (sub) => sub.score !== null ? `${sub.score} / ${sub.assignment?.maxScore}` : '-'
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            render: (sub) => (
                <Tooltip content="Grade">
                    <span className="text-lg text-primary cursor-pointer active:opacity-50" onClick={() => handleOpenGrade(sub)}>
                        <Icon icon="mdi:fountain-pen-tip" />
                    </span>
                </Tooltip>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <PageHeader
                    title="Grading Dashboard"
                    description="Review and grade student assignments"
                    icon="mdi:fountain-pen-tip"
                />

                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardBody className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                            <Input
                                placeholder="Search student..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                startContent={<Icon icon="mdi:magnify" />}
                                className="max-w-xs"
                            />
                            <Select
                                label="Status"
                                selectedKeys={[statusFilter]}
                                onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0])}
                                className="max-w-xs"
                            >
                                <SelectItem key="submitted">Pending Grading</SelectItem>
                                <SelectItem key="graded">Graded</SelectItem>
                                <SelectItem key="all">All Submissions</SelectItem>
                            </Select>
                        </div>

                        <DataTable
                            data={submissions}
                            columns={columns}
                            loading={loading}
                            pagination={false}
                            searchable={false}
                            emptyContent={
                                <div className="text-center py-12 text-gray-500">
                                    <Icon icon="mdi:clipboard-check-outline" className="text-6xl mx-auto mb-4 opacity-50" />
                                    <p className="text-xl font-semibold">No Submissions Found</p>
                                    <p>Try adjusting your filters or search.</p>
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

                <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} size="2xl">
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Grade Submission</ModalHeader>
                                <ModalBody>
                                    {selectedSubmission && (
                                        <div className="space-y-6">
                                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                                <h4 className="font-semibold mb-2">Submission Content</h4>
                                                <p className="whitespace-pre-wrap">{selectedSubmission.content || 'No text content.'}</p>
                                                {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="text-sm font-semibold mb-1">Attachments:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedSubmission.attachments.map((att, idx) => (
                                                                <a key={idx} href={att} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                                                    <Icon icon="mdi:paperclip" /> File {idx + 1}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    type="number"
                                                    label={`Score (Max: ${selectedSubmission.assignment?.maxScore})`}
                                                    value={gradeData.score}
                                                    onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                                                />
                                            </div>
                                            <Textarea
                                                label="Feedback"
                                                placeholder="Provide feedback to the student..."
                                                value={gradeData.feedback}
                                                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                                minRows={3}
                                            />
                                        </div>
                                    )}
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="primary" onPress={handleGradeSubmit} isLoading={grading}>
                                        Submit Grade
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </motion.div>
        </div>
    );
}
