import React, { useState, useEffect } from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';

export default function QuizTimer({ initialTime, onTimeUp }) {
    const [timeRemaining, setTimeRemaining] = useState(initialTime);

    useEffect(() => {
        if (timeRemaining <= 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, onTimeUp]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    };

    const getColorClass = () => {
        const percentage = (timeRemaining / initialTime) * 100;
        if (percentage <= 10) return 'danger';
        if (percentage <= 25) return 'warning';
        return 'success';
    };

    const isUrgent = timeRemaining <= initialTime * 0.1; // Last 10%

    return (
        <Chip
            color={getColorClass()}
            variant="flat"
            startContent={<Icon icon="mdi:clock-outline" className={isUrgent ? 'animate-pulse' : ''} />}
            className={isUrgent ? 'animate-pulse' : ''}
        >
            {formatTime(timeRemaining)}
        </Chip>
    );
}
