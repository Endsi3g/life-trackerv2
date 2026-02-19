import { useState, useEffect, useRef } from "react";
import { Ring } from "@/components/shared/Ring";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = {
    focus: { label: "Focus", minutes: 25, color: "#3b82f6" },
    short: { label: "Short Break", minutes: 5, color: "#10b981" },
    long: { label: "Long Break", minutes: 15, color: "#8b5cf6" },
};

type TimerMode = keyof typeof MODES;

export default function FocusTab() {
    const [mode, setMode] = useState<TimerMode>("focus");
    const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const currentMode = MODES[mode];
    const totalSeconds = currentMode.minutes * 60;
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

    useEffect(() => {
        // Reset timer when mode changes
        setIsActive(false);
        setTimeLeft(MODES[mode].minutes * 60);
        if (timerRef.current) clearInterval(timerRef.current);
    }, [mode]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound or notification here
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(MODES[mode].minutes * 60);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-10">
            <div className="flex bg-slate-100 p-1 rounded-2xl w-full max-w-xs">
                {(Object.keys(MODES) as TimerMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-xl transition-all",
                            mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        {MODES[m].label}
                    </button>
                ))}
            </div>

            <div className="relative">
                <Ring
                    pct={progress}
                    size={280}
                    stroke={12}
                    color={currentMode.color}
                    bg={currentMode.color + "20"}
                >
                    <div className="text-center">
                        <div className="text-6xl font-bold text-slate-900 font-mono tracking-tighter">
                            {formatTime(timeLeft)}
                        </div>
                        <p className="text-slate-500 mt-2 font-medium uppercase tracking-widest text-sm">
                            {isActive ? "Running" : "Paused"}
                        </p>
                    </div>
                </Ring>
            </div>

            <div className="flex items-center gap-6">
                <button
                    onClick={toggleTimer}
                    className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95"
                >
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
                <button
                    onClick={resetTimer}
                    className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
    );
}
