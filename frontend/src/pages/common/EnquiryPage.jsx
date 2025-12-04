import React, { useState } from 'react';
import { Card, CardBody, Button, Input, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react";
import { enquiryService } from '@/services';
import { PageHeader } from '@/components/common';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

const enquirySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal('')),
    subject: z.string().min(3, "Subject must be at least 3 characters"),
    message: z.string().min(10, "Message must be at least 10 characters").max(500, "Message must not exceed 500 characters")
});

export default function EnquiryPage() {
    const [submitted, setSubmitted] = useState(false);

    const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(enquirySchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        }
    });

    const message = watch('message');
    const messageLength = message?.length || 0;

    const onSubmit = async (data) => {
        try {
            const response = await enquiryService.createEnquiry(data);
            if (response?.data?.success) {
                setSubmitted(true);
                reset();
            }
        } catch (error) {
            console.error('Error submitting enquiry:', error);
        }
    };

    const handleNewEnquiry = () => {
        setSubmitted(false);
        reset();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Contact Us"
                    description="Get in touch with our support team. We're here to help!"
                    icon="mdi:email-outline"
                />

                {submitted ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                            <CardBody className="p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                                        <Icon icon="mdi:check-circle" className="text-4xl text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Thank You!
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Your enquiry has been submitted successfully. Our team will get back to you within 24-48 hours.
                                </p>
                                <Button
                                    color="primary"
                                    onPress={handleNewEnquiry}
                                    startContent={<Icon icon="mdi:email-plus-outline" />}
                                >
                                    Submit Another Enquiry
                                </Button>
                            </CardBody>
                        </Card>
                    </motion.div>
                ) : (
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Send us a Message</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Fill out the form below and we'll respond as soon as possible.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                isRequired
                                                label="Full Name"
                                                placeholder="John Doe"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:account-outline" className="text-gray-400" />}
                                                isInvalid={!!errors.name}
                                                errorMessage={errors.name?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                isRequired
                                                type="email"
                                                label="Email Address"
                                                placeholder="john.doe@example.com"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:email-outline" className="text-gray-400" />}
                                                isInvalid={!!errors.email}
                                                errorMessage={errors.email?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="tel"
                                                label="Phone Number"
                                                placeholder="+1 (555) 000-0000"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:phone-outline" className="text-gray-400" />}
                                                description="Optional"
                                                isInvalid={!!errors.phone}
                                                errorMessage={errors.phone?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="subject"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                isRequired
                                                label="Subject"
                                                placeholder="How can we help you?"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                startContent={<Icon icon="mdi:bookmark-outline" className="text-gray-400" />}
                                                isInvalid={!!errors.subject}
                                                errorMessage={errors.subject?.message}
                                                classNames={{
                                                    label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <Controller
                                    name="message"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            isRequired
                                            label="Message"
                                            placeholder="Please provide details about your enquiry..."
                                            variant="bordered"
                                            labelPlacement="outside"
                                            minRows={6}
                                            description={`${messageLength}/500 characters`}
                                            isInvalid={!!errors.message}
                                            errorMessage={errors.message?.message}
                                            classNames={{
                                                label: "text-sm font-medium text-gray-700 dark:text-gray-300"
                                            }}
                                        />
                                    )}
                                />

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <Button
                                        variant="flat"
                                        color="default"
                                        onPress={() => reset()}
                                        startContent={<Icon icon="mdi:refresh" />}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isLoading={isSubmitting}
                                        startContent={!isSubmitting && <Icon icon="mdi:send" />}
                                        className="px-8"
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Enquiry'}
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                )}

                {/* Contact Info */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-4 text-center">
                            <Icon icon="mdi:email-fast-outline" className="text-3xl text-primary mx-auto mb-2" />
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">support@example.com</p>
                        </CardBody>
                    </Card>
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-4 text-center">
                            <Icon icon="mdi:phone-in-talk-outline" className="text-3xl text-primary mx-auto mb-2" />
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
                        </CardBody>
                    </Card>
                    <Card className="border border-gray-200 dark:border-gray-800">
                        <CardBody className="p-4 text-center">
                            <Icon icon="mdi:clock-time-four-outline" className="text-3xl text-primary mx-auto mb-2" />
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Hours</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Mon-Fri: 9AM-5PM</p>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
