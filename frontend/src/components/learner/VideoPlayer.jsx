import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, Button, Slider, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayer({
    videoUrl,
    materialId,
    enrollmentId,
    initialPosition = 0,
    initialSpeed = 1,
    onProgressUpdate,
    onComplete,
}) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(initialPosition);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(initialSpeed);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const progressUpdateInterval = useRef(null);

    // Load initial position and speed
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.currentTime = initialPosition;
            videoRef.current.playbackRate = initialSpeed;
        }
    }, [initialPosition, initialSpeed]);

    // Auto-save progress every 10 seconds
    useEffect(() => {
        if (isPlaying) {
            progressUpdateInterval.current = setInterval(() => {
                saveProgress();
            }, 10000);
        } else {
            if (progressUpdateInterval.current) {
                clearInterval(progressUpdateInterval.current);
            }
        }

        return () => {
            if (progressUpdateInterval.current) {
                clearInterval(progressUpdateInterval.current);
            }
        };
    }, [isPlaying, currentTime, playbackSpeed]);

    // Save progress before unmount
    useEffect(() => {
        return () => {
            if (currentTime > 0) {
                saveProgress();
            }
        };
    }, []);

    const saveProgress = () => {
        if (!onProgressUpdate) return;

        const completionPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
        const isCompleted = completionPercentage >= 90;

        onProgressUpdate({
            materialId,
            enrollmentId,
            status: isCompleted ? 'completed' : 'in_progress',
            timeSpent: Math.floor(currentTime),
            completionPercentage: Math.floor(completionPercentage),
            lastPlaybackPosition: Math.floor(currentTime),
            playbackSpeed,
        });

        if (isCompleted && onComplete) {
            onComplete();
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (value) => {
        if (videoRef.current) {
            videoRef.current.currentTime = value;
            setCurrentTime(value);
        }
    };

    const handleVolumeChange = (value) => {
        if (videoRef.current) {
            videoRef.current.volume = value;
            setVolume(value);
            setIsMuted(value === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            videoRef.current.muted = newMuted;
            setIsMuted(newMuted);
            if (newMuted) {
                setVolume(0);
            } else {
                setVolume(videoRef.current.volume);
            }
        }
    };

    const handleSpeedChange = (e) => {
        const speed = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackSpeed(speed);
        }
    };

    const toggleFullscreen = () => {
        const container = videoRef.current?.parentElement;
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const skip = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
        }
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="border border-gray-200 dark:border-gray-800">
            <CardBody className="p-0 relative group">
                {/* Video Element */}
                <div
                    className="relative bg-black"
                    onMouseEnter={() => setShowControls(true)}
                    onMouseLeave={() => setShowControls(isPlaying ? false : true)}
                >
                    <video
                        ref={videoRef}
                        className="w-full aspect-video"
                        src={videoUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => {
                            setIsPlaying(false);
                            saveProgress();
                        }}
                        onClick={togglePlay}
                    >
                        Your browser does not support the video tag.
                    </video>

                    {/* Resume Indicator */}
                    {initialPosition > 30 && currentTime < 10 && (
                        <div className="absolute top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                            <p className="text-sm">Resume from {formatTime(initialPosition)}</p>
                        </div>
                    )}

                    {/* Play/Pause Overlay */}
                    {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Button
                                isIconOnly
                                color="primary"
                                size="lg"
                                variant="shadow"
                                className="w-20 h-20"
                                onPress={togglePlay}
                            >
                                <Icon icon="mdi:play" className="text-5xl" />
                            </Button>
                        </div>
                    )}

                    {/* Controls */}
                    <div
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {/* Progress Bar */}
                        <Slider
                            size="sm"
                            step={1}
                            maxValue={duration}
                            minValue={0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="mb-3"
                            classNames={{
                                track: "bg-gray-600",
                                filler: "bg-primary",
                            }}
                        />

                        <div className="flex items-center justify-between gap-4">
                            {/* Left Controls */}
                            <div className="flex items-center gap-2">
                                {/* Play/Pause */}
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={togglePlay}
                                    className="text-white"
                                >
                                    <Icon
                                        icon={isPlaying ? "mdi:pause" : "mdi:play"}
                                        className="text-2xl"
                                    />
                                </Button>

                                {/* Skip Backward */}
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={() => skip(-10)}
                                    className="text-white"
                                >
                                    <Icon icon="mdi:rewind-10" className="text-xl" />
                                </Button>

                                {/* Skip Forward */}
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={() => skip(10)}
                                    className="text-white"
                                >
                                    <Icon icon="mdi:fast-forward-10" className="text-xl" />
                                </Button>

                                {/* Volume */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        onPress={toggleMute}
                                        className="text-white"
                                    >
                                        <Icon
                                            icon={
                                                isMuted || volume === 0
                                                    ? "mdi:volume-off"
                                                    : volume < 0.5
                                                        ? "mdi:volume-low"
                                                        : "mdi:volume-high"
                                            }
                                            className="text-xl"
                                        />
                                    </Button>
                                    <div className="w-20 hidden md:block">
                                        <Slider
                                            size="sm"
                                            step={0.01}
                                            maxValue={1}
                                            minValue={0}
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            classNames={{
                                                track: "bg-gray-600",
                                                filler: "bg-white",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Time Display */}
                                <span className="text-white text-sm font-medium">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>

                            {/* Right Controls */}
                            <div className="flex items-center gap-2">
                                {/* Playback Speed */}
                                <Select
                                    size="sm"
                                    selectedKeys={[playbackSpeed.toString()]}
                                    onChange={handleSpeedChange}
                                    className="w-24"
                                    classNames={{
                                        trigger: "bg-transparent text-white border-gray-600",
                                        value: "text-white",
                                    }}
                                >
                                    {PLAYBACK_SPEEDS.map((speed) => (
                                        <SelectItem key={speed.toString()} value={speed}>
                                            {speed}x
                                        </SelectItem>
                                    ))}
                                </Select>

                                {/* Fullscreen */}
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={toggleFullscreen}
                                    className="text-white"
                                >
                                    <Icon
                                        icon={isFullscreen ? "mdi:fullscreen-exit" : "mdi:fullscreen"}
                                        className="text-xl"
                                    />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
