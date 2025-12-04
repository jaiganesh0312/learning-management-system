import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, Button, Progress, Divider, Chip, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import assessmentService from '@/services/assessmentService';
import QuizTimer from '@/components/learner/QuizTimer';
import QuestionCard from '@/components/learner/QuestionCard';
import QuizNavigation from '@/components/learner/QuizNavigation';
import QuizResults from '@/components/learner/QuizResults';

export default function TakeQuiz() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [attemptData, setAttemptData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizStartTime, setQuizStartTime] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuizData();
    }, [quizId]);

    const loadQuizData = async () => {
        try {
            setLoading(true);

            // Get quiz details and questions
            const quizResponse = await assessmentService.getQuiz(quizId);
            if (!quizResponse?.data?.success) {
                addToast({
                    title: 'Error',
                    description: 'Failed to load quiz',
                    color: 'danger'
                });
                navigate(-1);
                return;
            }

            const quizData = quizResponse.data.data;
            setQuiz(quizData);

            // Randomize questions if required
            const questionsList = quizData.questions || [];
            const orderedQuestions = quizData.randomizeQuestions
                ? [...questionsList].sort(() => Math.random() - 0.5)
                : questionsList.sort((a, b) => (a.order || 0) - (b.order || 0));

            setQuestions(orderedQuestions);

            // Get attempt history
            const attemptsResponse = await assessmentService.getQuizAttempts(quizId);
            if (attemptsResponse?.data?.success) {
                setAttemptData(attemptsResponse.data.data);

                if (!attemptsResponse.data.data.canAttempt) {
                    addToast({
                        title: 'Warning',
                        description: 'You have reached the maximum number of attempts',
                        color: 'warning'
                    });
                }
            }

            // Initialize timer
            if (quizData.timeLimit) {
                setTimeRemaining(quizData.timeLimit * 60); // Convert to seconds
            }

            setQuizStartTime(new Date());
            setLoading(false);
        } catch (error) {
            console.error('Error loading quiz:', error);
            addToast({
                title: 'Error',
                description: 'Failed to load quiz data',
                color: 'danger'
            });
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleTimeUp = () => {
        addToast({
            title: 'Warning',
            description: 'Time is up! Submitting quiz...',
            color: 'warning'
        });
        handleSubmitQuiz();
    };

    const handleSubmitQuiz = async () => {
        if (isSubmitting) return;

        const unansweredCount = questions.length - Object.keys(answers).length;
        if (unansweredCount > 0) {
            const confirmSubmit = window.confirm(
                `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
            );
            if (!confirmSubmit) return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                quizId,
                answers: questions.map(q => ({
                    questionId: q.id,
                    answer: answers[q.id] || ''
                })),
                timeTaken: Math.floor((new Date() - quizStartTime) / 1000), // in seconds
            };

            const response = await assessmentService.submitQuizAttempt(payload);

            if (response?.data?.success) {
                setResults(response.data.data);
                setQuizCompleted(true);
                addToast({
                    title: 'Success',
                    description: 'Quiz submitted successfully!',
                    color: 'success'
                });
            } else {
                addToast({
                    title: 'Error',
                    description: response?.data?.message || 'Failed to submit quiz',
                    color: 'danger'
                });
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            addToast({
                title: 'Error',
                description: 'Failed to submit quiz',
                color: 'danger'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const goToQuestion = (index) => {
        setCurrentQuestionIndex(index);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Icon icon="mdi:loading" className="animate-spin text-4xl text-primary" />
            </div>
        );
    }

    if (quizCompleted && results) {
        return (
            <QuizResults
                results={results}
                quiz={quiz}
                questions={questions}
                answers={answers}
                onRetry={attemptData?.canAttempt ? () => window.location.reload() : null}
                onBack={() => navigate(-1)}
            />
        );
    }

    if (!attemptData?.canAttempt) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardBody className="text-center py-12">
                        <Icon icon="mdi:alert-circle" className="text-6xl text-warning mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Maximum Attempts Reached</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            You have completed all {quiz?.maxAttempts} allowed attempts for this quiz.
                        </p>
                        <Button color="primary" onPress={() => navigate(-1)}>
                            Go Back
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-6 max-w-6xl"
        >
            {/* Header */}
            <Card className="mb-6">
                <CardHeader className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-2">{quiz?.title}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{quiz?.description}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        {quiz?.timeLimit && timeRemaining !== null && (
                            <QuizTimer
                                initialTime={timeRemaining}
                                onTimeUp={handleTimeUp}
                            />
                        )}
                        <Chip color="primary" variant="flat">
                            Attempt {(attemptData?.attempts?.length || 0) + 1} / {quiz?.maxAttempts || '∞'}
                        </Chip>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Answered: {answeredCount} / {questions.length}
                        </span>
                    </div>
                    <Progress
                        value={progress}
                        color="primary"
                        className="mb-4"
                    />
                </CardBody>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Card */}
                <div className="lg:col-span-3">
                    {currentQuestion && (
                        <QuestionCard
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                            answer={answers[currentQuestion.id]}
                            onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                            onNext={nextQuestion}
                            onPrevious={previousQuestion}
                            isFirst={currentQuestionIndex === 0}
                            isLast={currentQuestionIndex === questions.length - 1}
                        />
                    )}
                </div>

                {/* Navigation Sidebar */}
                <div className="lg:col-span-1">
                    <QuizNavigation
                        questions={questions}
                        currentIndex={currentQuestionIndex}
                        answers={answers}
                        onQuestionSelect={goToQuestion}
                        onSubmit={handleSubmitQuiz}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </motion.div>
    );
}
