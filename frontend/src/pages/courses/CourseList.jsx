import React, { useEffect, useState } from 'react';
import { Card, CardBody, Input, Select, SelectItem, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { courseService } from '@/services';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PageHeader from '@/components/common/PageHeader';
import CourseCard from '@/components/common/CourseCard';
import EmptyState from '@/components/common/EmptyState';

export default function CourseList() {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseService.getAllCourses();
            if (response?.data?.success) {
                setCourses(response.data.data.courses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
        const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
        return matchesSearch && matchesLevel && matchesCategory && course.isPublished;
    });

    if (loading) {
        return <LoadingSpinner fullPage />;
    }

    const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];
    const levels = ['beginner', 'intermediate', 'advanced'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <PageHeader
                    title="Browse Courses"
                    description="Explore our course catalog and start learning"
                    icon="mdi:compass-outline"
                />

                {/* Filters */}
                <Card className="border border-gray-200 dark:border-gray-800 mb-8">
                    <CardBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Search Courses"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                startContent={<Icon icon="mdi:magnify" className="text-xl" />}
                                isClearable
                                onClear={() => setSearchTerm('')}
                                variant="bordered"
                            />

                            <Select
                                label="Level"
                                selectedKeys={[selectedLevel]}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                                variant="bordered"
                            >
                                <SelectItem key="all" value="all">All Levels</SelectItem>
                                {levels.map(level => (
                                    <SelectItem key={level} value={level} className="capitalize">
                                        {level}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Category"
                                selectedKeys={[selectedCategory]}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                variant="bordered"
                            >
                                <SelectItem key="all" value="all">All Categories</SelectItem>
                                {categories.map(category => (
                                    <SelectItem key={category} value={category} className="capitalize">
                                        {category}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        {/* Active Filters */}
                        {(searchTerm || selectedLevel !== 'all' || selectedCategory !== 'all') && (
                            <div className="flex items-center gap-2 mt-4 flex-wrap">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                                {searchTerm && (
                                    <Chip
                                        onClose={() => setSearchTerm('')}
                                        variant="flat"
                                        size="sm"
                                    >
                                        Search: {searchTerm}
                                    </Chip>
                                )}
                                {selectedLevel !== 'all' && (
                                    <Chip
                                        onClose={() => setSelectedLevel('all')}
                                        variant="flat"
                                        size="sm"
                                        className="capitalize"
                                    >
                                        Level: {selectedLevel}
                                    </Chip>
                                )}
                                {selectedCategory !== 'all' && (
                                    <Chip
                                        onClose={() => setSelectedCategory('all')}
                                        variant="flat"
                                        size="sm"
                                        className="capitalize"
                                    >
                                        Category: {selectedCategory}
                                    </Chip>
                                )}
                                <Button
                                    size="sm"
                                    variant="light"
                                    onPress={() => {
                                        setSearchTerm('');
                                        setSelectedLevel('all');
                                        setSelectedCategory('all');
                                    }}
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Results Count */}
                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {filteredCourses.length} of {courses.filter(c => c.isPublished).length} courses
                    </p>
                </div>

                {/* Course Grid */}
                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="mdi:book-search"
                        title="No courses found"
                        description="Try adjusting your filters or search terms"
                        actionLabel="Clear Filters"
                        onAction={() => {
                            setSearchTerm('');
                            setSelectedLevel('all');
                            setSelectedCategory('all');
                        }}
                    />
                )}
            </div>
        </div>
    );
}
