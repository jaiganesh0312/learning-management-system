import React from 'react';
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
    show: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function NotFound() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleGoBack = () => {
        navigate(-1);
    };

    const quickLinks = [
        {
            name: "Dashboard",
            link: "/dashboard",
            icon: "mdi:view-dashboard",
            description: "Access your personalized dashboard",
            show: !!user
        },
        {
            name: "My Courses",
            link: "/my-courses",
            icon: "mdi:book-open-page-variant",
            description: "View your enrolled courses",
            show: !!user
        },
        {
            name: "Browse Courses",
            link: "/courses",
            icon: "mdi:school",
            description: "Explore available courses",
            show: true
        },
        {
            name: "My Certificates",
            link: "/certificates",
            icon: "mdi:certificate",
            description: "View your certificates",
            show: !!user
        },
    ];

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        variants={stagger}
                        className="grid lg:grid-cols-2 gap-12 items-center"
                    >
                        <motion.div
                            variants={fadeInUp}
                            className="text-center lg:text-left"
                        >
                            <div className="mb-8">
                                <div className="text-8xl md:text-9xl font-bold text-red-500 dark:text-red-400 mb-4">
                                    404
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                                    Page Not Found
                                </h1>
                                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                                    The page you're looking for doesn't exist or has been moved.
                                    Don't worry, we'll help you find what you need.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Button
                                    as={Link}
                                    to="/"
                                    size="lg"
                                    color="primary"
                                    startContent={
                                        <Icon icon="mdi:home" className="w-5 h-5" />
                                    }
                                >
                                    Go Home
                                </Button>
                                <Button
                                    onClick={handleGoBack}
                                    size="lg"
                                    variant="bordered"
                                    startContent={
                                        <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                                    }
                                >
                                    Go Back
                                </Button>
                                <Button
                                    as={Link}
                                    to="/enquiry"
                                    size="lg"
                                    variant="flat"
                                    startContent={
                                        <Icon icon="mdi:email" className="w-5 h-5" />
                                    }
                                >
                                    Contact Support
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="flex justify-center">
                            <div className="relative">
                                {/* Animated Illustration using Icons instead of Image */}
                                <div className="w-full max-w-md aspect-square rounded-xl bg-gradient-to-br from-red-100 to-blue-100 dark:from-red-900/30 dark:to-blue-900/30 shadow-2xl flex items-center justify-center p-8 relative overflow-hidden">
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                                        <div className="absolute bottom-10 right-10 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
                                    </div>

                                    {/* Center Icon */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 5, -5, 0]
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="relative z-10"
                                    >
                                        <Icon
                                            icon="mdi:map-marker-question-outline"
                                            className="w-48 h-48 text-red-500 dark:text-red-400"
                                        />
                                    </motion.div>
                                </div>

                                {/* Decorative Badge */}
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center shadow-xl">
                                    <Icon
                                        icon="mdi:help-circle"
                                        className="w-12 h-12 text-white"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Quick Links Section */}
            <section className="py-20 px-4 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.div variants={fadeInUp} className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Popular Pages
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                                Here are some popular pages you might be looking for
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {quickLinks.filter(link => link.show).map((link, index) => (
                                <motion.div key={index} variants={fadeInUp}>
                                    <Card
                                        as={Link}
                                        to={link.link}
                                        isPressable
                                        className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        <CardBody className="p-6 text-center">
                                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Icon
                                                    icon={link.icon}
                                                    className="w-8 h-8 text-blue-600 dark:text-blue-400"
                                                />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {link.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {link.description}
                                            </p>
                                            <div className="mt-4 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                                                <span className="text-sm">Visit Page</span>
                                                <Icon icon="mdi:arrow-right" className="w-4 h-4 ml-1" />
                                            </div>
                                        </CardBody>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Help Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <Card className="p-8 shadow-xl">
                            <CardBody className="space-y-6">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                    <Icon
                                        icon="mdi:headset"
                                        className="w-10 h-10 text-green-600 dark:text-green-400"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Need Help Finding Something?
                                    </h3>
                                    <p className="text-lg text-gray-600 dark:text-gray-300">
                                        Our support team is here to help you find the information
                                        you're looking for.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        as={Link}
                                        to="/enquiry"
                                        size="lg"
                                        color="success"
                                        startContent={
                                            <Icon icon="mdi:email" className="w-5 h-5" />
                                        }
                                    >
                                        Contact Support
                                    </Button>
                                    {user && (
                                        <Button
                                            as={Link}
                                            to="/dashboard"
                                            size="lg"
                                            variant="bordered"
                                            startContent={
                                                <Icon icon="mdi:view-dashboard" className="w-5 h-5" />
                                            }
                                        >
                                            Go to Dashboard
                                        </Button>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
