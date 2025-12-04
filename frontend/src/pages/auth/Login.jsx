import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services';

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = async (data) => {
        setError(null);

        try {
            const response = await authService.login(data);

            if (response?.data?.success) {
                const { user, token, roles, activeRole } = response.data;

                // Store in AuthContext
                login(user, token, activeRole);

                // If user has multiple roles, redirect to role selection

                navigate('/select-role');

            } else {
                setError(response?.data?.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'An error occurred during login');
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
                                    <Icon icon="mdi:school" className="text-4xl text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Welcome Back
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Sign in to continue your learning journey
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

                        {/* Login Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Email Address"
                                        placeholder="Enter your email"
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
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Password"
                                        placeholder="Enter your password"
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

                            <div className="flex items-center justify-end  ">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                color="primary"
                                size="lg"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold"
                                isLoading={isSubmitting}
                                startContent={!isSubmitting && <Icon icon="mdi:login" className="text-xl" />}
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        {/* Register Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </CardBody>
                </Card>

                {/* Footer Links */}
                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
                    {' • '}
                    <Link to="/terms" className="hover:underline">Terms of Service</Link>
                </div>
            </motion.div>
        </div>
    );
}
