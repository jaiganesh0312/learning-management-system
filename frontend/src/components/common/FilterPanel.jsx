import React from 'react';
import { Card, CardBody, Button, Select, SelectItem, Input, DatePicker, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function FilterPanel({
    filters = [],
    values = {},
    onChange,
    onReset,
    title = "Filters",
    showReset = true
}) {
    const handleFilterChange = (filterKey, value) => {
        onChange?.({
            ...values,
            [filterKey]: value
        });
    };

    const handleReset = () => {
        const resetValues = {};
        filters.forEach(filter => {
            resetValues[filter.key] = filter.defaultValue || '';
        });
        onReset?.(resetValues);
    };

    const activeFilterCount = Object.values(values).filter(v => v && v !== '').length;

    const renderFilter = (filter) => {
        console.log(filter);
        const value = values[filter.key] || filter.defaultValue || '';

        switch (filter.type) {
            case 'select':
                return (
                    <Select
                        label={filter.label}
                        placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`}
                        selectedKeys={value ? [value] : []}
                        onSelectionChange={(keys) => handleFilterChange(filter.key, Array.from(keys)[0])}
                        classNames={{
                            trigger: "border-gray-200 dark:border-gray-800"
                        }}
                    >
                        {filter.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Select>
                );

            case 'date':
                return (
                    <Input
                        type="date"
                        label={filter.label}
                        value={value}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        classNames={{
                            inputWrapper: "border-gray-200 dark:border-gray-800"
                        }}
                    />
                );

            case 'search':
                return (
                    <Input
                        type="text"
                        label={filter.label}
                        placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}`}
                        value={value}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        startContent={<Icon icon="mdi:magnify" />}
                        isClearable
                        onClear={() => handleFilterChange(filter.key, '')}
                        classNames={{
                            inputWrapper: "border-gray-200 dark:border-gray-800"
                        }}
                    />
                );

            case 'number':
                return (
                    <Input
                        type="number"
                        label={filter.label}
                        placeholder={filter.placeholder}
                        value={value}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        classNames={{
                            inputWrapper: "border-gray-200 dark:border-gray-800"
                        }}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Card className="border border-gray-200 dark:border-gray-800">
            <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Icon icon="mdi:filter" className="text-xl text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                        {activeFilterCount > 0 && (
                            <Chip size="sm" color="primary" variant="flat">
                                {activeFilterCount}
                            </Chip>
                        )}
                    </div>
                    {showReset && activeFilterCount > 0 && (
                        <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={handleReset}
                            startContent={<Icon icon="mdi:refresh" />}
                        >
                            Reset
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    {filters.map((filter) => (
                        <div key={filter.key}>
                            {renderFilter(filter)}
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
