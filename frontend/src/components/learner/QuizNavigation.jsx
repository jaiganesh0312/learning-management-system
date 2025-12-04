import React from 'react';
import { Card, CardBody, CardHeader, Button, Divider, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';

export default function QuizNavigation({
    questions,
    currentIndex,
    answers,
    onQuestionSelect,
    onSubmit,
    isSubmitting
}) {
    const answeredCount = Object.keys(answers).length;
    const allAnswered = answeredCount === questions.length;

    return (
        <Card className="sticky top-6">
            <CardHeader className="flex-col items-start gap-2">
                <h3 className="text-lg font-semibold">Question Navigator</h3>
                <div className="flex gap-2 text-sm">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-success"></div>
                        <span className="text-gray-600 dark:text-gray-400">Answered</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-default-200"></div>
                        <span className="text-gray-600 dark:text-gray-400">Not Answered</span>
                    </div>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4">
                {/* Question Grid */}
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((question, idx) => {
                        const isAnswered = !!answers[question.id];
                        const isCurrent = idx === currentIndex;

                        return (
                            <button
                                key={question.id}
                                onClick={() => onQuestionSelect(idx)}
                                className={`
                                    aspect-square rounded-lg font-semibold text-sm transition-all
                                    ${isCurrent
                                        ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900'
                                        : ''
                                    }
                                    ${isAnswered
                                        ? 'bg-success text-white hover:bg-success-600'
                                        : 'bg-default-100 hover:bg-default-200 dark:bg-default-50 dark:hover:bg-default-100 text-gray-700 dark:text-gray-800'
                                    }
                                `}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>

                <Divider />

                {/* Progress Summary */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-semibold">
                            {answeredCount} / {questions.length}
                        </span>
                    </div>

                    {!allAnswered && (
                        <Chip color="warning" variant="flat" size="sm" className="w-full justify-center">
                            <Icon icon="mdi:alert" className="mr-1" />
                            {questions.length - answeredCount} unanswered
                        </Chip>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    color={allAnswered ? 'success' : 'primary'}
                    onPress={onSubmit}
                    isLoading={isSubmitting}
                    className="w-full"
                    size="lg"
                    startContent={!isSubmitting && <Icon icon="mdi:check-circle" />}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
            </CardBody>
        </Card>
    );
}
