import React from 'react';
import { Card, CardBody, CardFooter, Button, RadioGroup, Radio, Input, Divider, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';

export default function QuestionCard({
    question,
    questionNumber,
    answer,
    onAnswerChange,
    onNext,
    onPrevious,
    isFirst,
    isLast
}) {
    const renderQuestionInput = () => {
        switch (question.questionType) {
            case 'multiple_choice':
                return (
                    <RadioGroup
                        value={answer || ''}
                        onValueChange={onAnswerChange}
                        className="gap-3"
                    >
                        {question.options?.map((option, idx) => (
                            <Radio
                                key={idx}
                                value={option}
                                description={null}
                                classNames={{
                                    base: "inline-flex m-0 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 items-center justify-between flex-row-reverse max-w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent data-[selected=true]:border-primary",
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <Chip size="sm" variant="flat" color="primary">
                                        {String.fromCharCode(65 + idx)}
                                    </Chip>
                                    <span>{option}</span>
                                </div>
                            </Radio>
                        ))}
                    </RadioGroup>
                );

            case 'true_false':
                return (
                    <RadioGroup
                        value={answer || ''}
                        onValueChange={onAnswerChange}
                        className="gap-3"
                    >
                        <Radio
                            value="true"
                            classNames={{
                                base: "inline-flex m-0 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 items-center justify-between flex-row-reverse max-w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent data-[selected=true]:border-primary",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <Icon icon="mdi:check-circle" className="text-success text-xl" />
                                <span>True</span>
                            </div>
                        </Radio>
                        <Radio
                            value="false"
                            classNames={{
                                base: "inline-flex m-0 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 items-center justify-between flex-row-reverse max-w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent data-[selected=true]:border-primary",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <Icon icon="mdi:close-circle" className="text-danger text-xl" />
                                <span>False</span>
                            </div>
                        </Radio>
                    </RadioGroup>
                );

            case 'short_answer':
                return (
                    <Input
                        value={answer || ''}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        placeholder="Type your answer here..."
                        variant="bordered"
                        size="lg"
                        classNames={{
                            input: "text-base",
                        }}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Card className="shadow-lg">
            <CardBody className="gap-6 p-6">
                {/* Question Header */}
                <div className="flex items-start gap-4">
                    <Chip color="primary" variant="solid" size="lg">
                        Q{questionNumber}
                    </Chip>
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{question.questionText}</h3>
                        <div className="flex gap-2">
                            <Chip size="sm" variant="flat" startContent={<Icon icon="mdi:star" />}>
                                {question.points} {question.points === 1 ? 'point' : 'points'}
                            </Chip>
                            <Chip size="sm" variant="flat" color="secondary">
                                {question.questionType === 'multiple_choice' ? 'Multiple Choice' :
                                    question.questionType === 'true_false' ? 'True/False' : 'Short Answer'}
                            </Chip>
                        </div>
                    </div>
                </div>

                <Divider />

                {/* Answer Input */}
                <div className="mt-2">
                    {renderQuestionInput()}
                </div>
            </CardBody>

            {/* Navigation Footer */}
            <CardFooter className="justify-between border-t border-gray-200 dark:border-gray-700 p-4">
                <Button
                    variant="flat"
                    onPress={onPrevious}
                    isDisabled={isFirst}
                    startContent={<Icon icon="mdi:chevron-left" />}
                >
                    Previous
                </Button>

                <div className="flex gap-2 items-center">
                    {answer ? (
                        <Chip color="success" variant="flat" size="sm" startContent={<Icon icon="mdi:check" />}>
                            Answered
                        </Chip>
                    ) : (
                        <Chip color="default" variant="flat" size="sm">
                            Not Answered
                        </Chip>
                    )}
                </div>

                <Button
                    color="primary"
                    onPress={onNext}
                    isDisabled={isLast}
                    endContent={<Icon icon="mdi:chevron-right" />}
                >
                    Next
                </Button>
            </CardFooter>
        </Card>
    );
}
