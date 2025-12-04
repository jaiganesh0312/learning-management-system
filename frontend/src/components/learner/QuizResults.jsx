import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Divider, Accordion, AccordionItem } from '@heroui/react';
import { Icon } from '@iconify/react';

export default function QuizResults({
    results,
    quiz,
    questions,
    answers,
    onRetry,
    onBack
}) {
    const { score, totalScore, percentage, passed, feedback } = results;
    const isPassed = passed || percentage >= (quiz?.passingScore || 0);

    const renderQuestionReview = (question, idx) => {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;

        return (
            <AccordionItem
                key={question.id}
                aria-label={`Question ${idx + 1}`}
                title={
                    <div className="flex items-center gap-3">
                        <Chip
                            color={isCorrect ? 'success' : 'danger'}
                            variant="flat"
                            size="sm"
                            startContent={
                                <Icon icon={isCorrect ? 'mdi:check' : 'mdi:close'} />
                            }
                        >
                            Q{idx + 1}
                        </Chip>
                        <span className="flex-1 text-left">{question.questionText}</span>
                        <Chip size="sm" variant="flat">
                            {question.points} pts
                        </Chip>
                    </div>
                }
            >
                <div className="space-y-3 p-4">
                    {/* User's Answer */}
                    <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Your Answer:
                        </p>
                        <Chip color={isCorrect ? 'success' : 'danger'} variant="flat">
                            {userAnswer || 'Not Answered'}
                        </Chip>
                    </div>

                    {/* Correct Answer */}
                    {quiz?.showCorrectAnswers && !isCorrect && (
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                Correct Answer:
                            </p>
                            <Chip color="success" variant="flat">
                                {question.correctAnswer}
                            </Chip>
                        </div>
                    )}

                    {/* Explanation */}
                    {quiz?.showCorrectAnswers && question.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-2">
                                <Icon icon="mdi:information" />
                                Explanation
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                {question.explanation}
                            </p>
                        </div>
                    )}
                </div>
            </AccordionItem>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Results Summary Card */}
            <Card className="mb-6">
                <CardBody className="text-center py-12">
                    {/* Pass/Fail Icon */}
                    <div className="mb-6">
                        {isPassed ? (
                            <Icon
                                icon="mdi:check-circle"
                                className="text-8xl text-success mx-auto"
                            />
                        ) : (
                            <Icon
                                icon="mdi:close-circle"
                                className="text-8xl text-danger mx-auto"
                            />
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold mb-2">
                        {isPassed ? 'Congratulations!' : 'Quiz Completed'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {isPassed
                            ? `You passed the quiz with ${percentage.toFixed(1)}%`
                            : `You scored ${percentage.toFixed(1)}% - Passing score is ${quiz?.passingScore || 0}%`
                        }
                    </p>

                    {/* Score Display */}
                    <div className="flex justify-center gap-8 mb-6">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Score</p>
                            <p className="text-4xl font-bold text-primary">
                                {score} / {totalScore}
                            </p>
                        </div>
                        <Divider orientation="vertical" className="h-16" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Percentage</p>
                            <p className="text-4xl font-bold text-primary">
                                {percentage.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Feedback */}
                    {feedback && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 max-w-md mx-auto">
                            <p className="text-blue-900 dark:text-blue-300">
                                {feedback}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                        <Button
                            variant="flat"
                            onPress={onBack}
                            startContent={<Icon icon="mdi:arrow-left" />}
                        >
                            Back to Course
                        </Button>
                        {onRetry && (
                            <Button
                                color="primary"
                                onPress={onRetry}
                                startContent={<Icon icon="mdi:refresh" />}
                            >
                                Try Again
                            </Button>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* Question Review */}
            {quiz?.showCorrectAnswers && (
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold">Review Answers</h2>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <Accordion variant="splitted">
                            {questions.map((question, idx) =>
                                renderQuestionReview(question, idx)
                            )}
                        </Accordion>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
