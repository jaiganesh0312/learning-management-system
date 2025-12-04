import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, CardBody, Button, Input, InputOtp } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const otpSchema = z.object({
    otp: z.string()
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^[0-9]+$/, "OTP must contain only numbers")
});

export default function VerifyOTP() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const email = location.state?.email;

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: ''
        }
    });

    useEffect(() => {
        if (!email) {
            navigate('/register');
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.verifyOtp({ email, otp: data.otp });

            if (response?.data?.success) {
                const { user, token, activeRole } = response.data;

                // Store in AuthContext
                login(user, token, activeRole);

                // Navigate to dashboard or role selection
                navigate('/select-role');

            } else {
                setError(response?.data?.message || 'OTP verification failed');
            }
        } catch (err) {
            console.error('OTP verification error:', err);
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError(null);
        try {
            // Call resend OTP endpoint if available
            // await authService.resendOtp({ email });
            setCountdown(600);
            reset({ otp: '' });
        } catch (err) {
            setError('Failed to resend OTP');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardBody className="p-8">
                        {/* Logo and Title */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                                    <Icon icon="mdi:shield-check" className="text-4xl text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Verify Your Account
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                We've sent a verification code to
                            </p>
                            <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1">
                                {email}
                            </p>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
                            >
                                <Icon icon="mdi:alert-circle" className="text-xl text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </motion.div>
                        )}

                        {/* Countdown Timer */}
                        <div className="mb-6 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <Icon icon="mdi:clock-outline" className="text-blue-600 dark:text-blue-400" />
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                    {formatTime(countdown)}
                                </span>
                            </div>
                        </div>

                        {/* OTP Input */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid place-items-center">
                                <label htmlFor="otp" className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Enter 6 digit OTP
                                </label>
                                <Controller
                                    name="otp"
                                    control={control}
                                    render={({ field }) => (
                                        <InputOtp
                                            {...field}
                                            label="Enter OTP"
                                            length={6}
                                            startContent={<Icon icon="mdi:numeric" className="text-xl text-gray-400" />}
                                            variant="bordered"
                                            size="lg"
                                            isInvalid={!!errors.otp}
                                            errorMessage={errors.otp?.message}
                                            classNames={{
                                                input: "text-center text-2xl tracking-widest"
                                            }}
                                            className='mx-auto'
                                        />
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                color="primary"
                                size="lg"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold"
                                isLoading={isLoading}
                                isDisabled={countdown === 0}
                                startContent={!isLoading && <Icon icon="mdi:check-circle" className="text-xl" />}
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </Button>

                            {/* Resend OTP */}
                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Didn't receive the code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                                        disabled={countdown > 0}
                                    >
                                        Resend OTP
                                    </button>
                                </p>
                            </div>
                        </form>

                        {/* Back to Login */}
                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="text-sm text-gray-600 dark:text-gray-400 hover:underline flex items-center justify-center gap-1"
                            >
                                <Icon icon="mdi:arrow-left" />
                                Back to login
                            </Link>
                        </div>
                    </CardBody>
                </Card>

                {/* Help Text */}
                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    <p>Check your email inbox and spam folder</p>
                </div>
            </motion.div>
        </div>
    );
}
