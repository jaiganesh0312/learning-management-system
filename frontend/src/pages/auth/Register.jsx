import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { authService } from '@/services';
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator';

const registerSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phoneNumber: z.string().min(10, "Please enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function Register() {
    const [error, setError] = useState(null);
    const [passwordFocus, setPasswordFocus] = useState(false);
    const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
    const navigate = useNavigate();

    const { control, watch, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: ''
        }
    });

    const onSubmit = async (data) => {
        setError(null);

        try {
            const { confirmPassword, ...registrationData } = data;
            const response = await authService.register(registrationData);

            if (response?.data?.success) {
                // Navigate to OTP verification with email
                navigate('/verify-otp', { state: { email: data.email } });
            } else {
                setError(response?.data?.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'An error occurred during registration');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardBody className="p-8">
                        {/* Logo and Title */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                                    <Icon icon="mdi:school" className="text-4xl text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Create an Account
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Start your learning journey today
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

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="firstName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="First Name"
                                            placeholder="John"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            size="lg"
                                            isInvalid={!!errors.firstName}
                                            errorMessage={errors.firstName?.message}
                                            startContent={<Icon icon="mdi:account-outline" className="text-xl text-gray-400" />}
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                            }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="lastName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Last Name"
                                            placeholder="Doe"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            size="lg"
                                            isInvalid={!!errors.lastName}
                                            errorMessage={errors.lastName?.message}
                                            startContent={<Icon icon="mdi:account-outline" className="text-xl text-gray-400" />}
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Email Address"
                                        placeholder="john.doe@example.com"
                                        type="email"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        size="lg"
                                        isInvalid={!!errors.email}
                                        errorMessage={errors.email?.message}
                                        startContent={<Icon icon="mdi:email-outline" className="text-xl text-gray-400" />}
                                        classNames={{
                                            label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                        }}
                                    />
                                )}
                            />

                            <Controller
                                name="phoneNumber"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Phone Number"
                                        placeholder="+1 (555) 000-0000"
                                        type="tel"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        size="lg"
                                        isInvalid={!!errors.phoneNumber}
                                        errorMessage={errors.phoneNumber?.message}
                                        startContent={<Icon icon="mdi:phone-outline" className="text-xl text-gray-400" />}
                                        classNames={{
                                            label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                        }}
                                    />
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Password"
                                            placeholder="Create a password"
                                            type="password"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            size="lg"
                                            isInvalid={!!errors.password}
                                            errorMessage={errors.password?.message}
                                            startContent={<Icon icon="mdi:lock-outline" className="text-xl text-gray-400" />}
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                            }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Confirm Password"
                                            placeholder="Confirm your password"
                                            type="password"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            size="lg"
                                            isInvalid={!!errors.confirmPassword}
                                            errorMessage={errors.confirmPassword?.message}
                                            startContent={<Icon icon="mdi:lock-check-outline" className="text-xl text-gray-400" />}
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <PasswordStrengthIndicator password={watch('password') || watch('confirmPassword')} showTips={true} />

                            <Button
                                type="submit"
                                color="primary"
                                size="lg"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold mt-2"
                                isLoading={isSubmitting}
                                startContent={!isSubmitting && <Icon icon="mdi:account-plus" className="text-xl" />}
                            >
                                {isSubmitting ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardBody>
                </Card>

                {/* Footer Links */}
                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    By signing up, you agree to our{' '}
                    <Link to="/terms" className="hover:underline">Terms of Service</Link>
                    {' and '}
                    <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
                </div>
            </motion.div>
        </div>
    );
}
