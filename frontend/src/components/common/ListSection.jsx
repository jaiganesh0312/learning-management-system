import React from 'react';
import { Card, CardBody } from "@heroui/react";

export const ListSection = ({ title, items, renderItem, children, emptyMessage = "No items found", className = "" }) => {
    return (
        <Card className={`border border-gray-200 dark:border-gray-800 h-full ${className}`}>
            <CardBody className="p-4">
                <h3 className="font-semibold text-lg mb-4">{title}</h3>
                {children ? (
                    children
                ) : (
                    <div className="space-y-4">
                        {items && items.length > 0 ? (
                            items.map((item, index) => (
                                <div key={index} className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-3 last:pb-0">
                                    {renderItem(item, index)}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">{emptyMessage}</p>
                        )}
                    </div>
                )}
            </CardBody>
        </Card>
    );
};
