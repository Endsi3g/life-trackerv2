import { useState, useEffect } from "react";

import { Play, Pause, RotateCcw } from "lucide-react";
import { Ring } from "@/components/shared/Ring";
import { cn } from "@/lib/utils";

export default function FocusTab() {
    const [isActive, setIsActive] = useState(false);
    const [duration, setDuration] = useState(25 * 60); // 25 minutes default
    const [timeLeft, setTimeLeft] = useState(duration);
    const [mode, setMode] = useState<"focus" | "break">("focus");

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound or notification here
            if (mode === "focus") {
                setMode("break");
                setDuration(5 * 60);
                setTimeLeft(5 * 60);
            } else {
                setMode("focus");
                setDuration(25 * 60);
                setTimeLeft(25 * 60);
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(duration);
    };

    const progress = ((duration - timeLeft) / duration) * 100;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">
                    {mode === "focus" ? "Focus Time" : "Break Time"}
                </h2>
                <p className="text-slate-500">
                    {isActive ? "Stay concentrated" : "Ready to start?"}
                </p>
            </div>

            <Ring pct={progress} size={280} stroke={12} color={mode === "focus" ? "#3b82f6" : "#10b981"}>
                <div className="text-5xl font-mono font-semibold tracking-tighter text-slate-800">
                    {formatTime(timeLeft)}
                </div>
            </Ring>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTimer}
                    className={cn(
                        "p-4 rounded-full text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg",
                        isActive ? "bg-amber-500" : "bg-slate-900"
                    )}
                >
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>

                <button
                    onClick={resetTimer}
                    className="p-4 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                >
                    <RotateCcw size={24} />
                </button>
            </div>

            <div className="flex gap-2">
                {[25, 45, 60].map((mins) => (
                    <button
                        key={mins}
                        onClick={() => {
                            setDuration(mins * 60);
                            setTimeLeft(mins * 60);
                            setIsActive(false);
                            setMode("focus");
                        }}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            duration === mins * 60 && mode === "focus"
                                ? "bg-blue-100 text-blue-700"
                                : "text-slate-500 hover:bg-slate-50"
                        )}
                    >
                        {mins}m
                    </button>
                ))}
            </div>
        </div>
    );
}
