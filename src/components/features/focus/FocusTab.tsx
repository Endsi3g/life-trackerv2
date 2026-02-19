import { useState, useEffect } from "react";
import { Ring } from "@/components/shared/Ring";
import { cn } from "@/lib/utils";
import { IconRefresh, IconTarget, IconCoffee, IconPlay, IconPause } from "@/components/shared/Icons";

export default function FocusTab() {
    const [isActive, setIsActive] = useState(false);
    const [duration, setDuration] = useState(25 * 60);
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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = ((duration - timeLeft) / duration) * 100;
    const presets = [15, 25, 45, 60];

    return (
        <div className="flex flex-col gap-[13px] animate-fade-up">
            <div className="card-base text-center py-8">
                <div className="flex gap-2 justify-center mb-6">
                    {presets.map((p) => (
                        <button
                            key={p}
                            onClick={() => {
                                setDuration(p * 60);
                                setTimeLeft(p * 60);
                                setIsActive(false);
                                setMode("focus");
                            }}
                            className={cn(
                                "px-[14px] py-[5px] rounded-full text-[11.5px] font-semibold transition-all scale-press border-[1.5px]",
                                duration === p * 60 && mode === "focus"
                                    ? "bg-[#0f172a] border-[#0f172a] text-white"
                                    : "bg-transparent border-[#e0e4ea] text-[#9ca3af]"
                            )}
                        >
                            {p}min
                        </button>
                    ))}
                </div>

                <div className="relative inline-block mb-6">
                    {isActive && (
                        <div className="absolute -inset-2 rounded-full animate-pulse-slow bg-blue-500/5 pointer-events-none" />
                    )}
                    <Ring
                        pct={progress}
                        size={220}
                        stroke={11}
                        color={mode === "focus" ? "#0f172a" : "#10b981"}
                        bg="#f0f2f5"
                    >
                        <span className="text-[44px] font-extrabold text-[#0f172a] tabular-nums tracking-tighter">
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-[12px] text-[#94a3b8] font-medium mt-1 flex items-center gap-1.5 justify-center">
                            {mode === "focus" ? (
                                <>
                                    <IconTarget size={14} />
                                    <span>Focus</span>
                                </>
                            ) : (
                                <>
                                    <IconCoffee size={14} />
                                    <span>Pause</span>
                                </>
                            )}
                        </span>
                    </Ring>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className={cn(
                            "px-9 py-[13px] rounded-[15px] text-white text-[15px] font-bold shadow-lg transition-all scale-press flex items-center justify-center gap-2",
                            mode === "focus" ? "bg-[#0f172a]" : "bg-[#10b981]"
                        )}
                    >
                        {isActive ? (
                            <>
                                <IconPause size={18} />
                                <span>Pause</span>
                            </>
                        ) : (
                            <>
                                <IconPlay size={18} />
                                <span>Démarrer</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setIsActive(false);
                            setTimeLeft(duration);
                        }}
                        className="p-[13px] rounded-[15px] bg-[#f0f2f5] border-[1.5px] border-[#e0e4ea] text-[#94a3b8] scale-press flex items-center justify-center"
                    >
                        <IconRefresh size={18} />
                    </button>
                </div>
            </div>

            <div className="card-base">
                <p className="text-[#a0a8b5] text-[10.5px] font-bold tracking-[1.2px] uppercase mb-[13px]">Sessions aujourd'hui</p>
                <div className="flex items-center gap-4">
                    <span className="text-[38px] font-extrabold text-[#0f172a]">0</span>
                    <div>
                        <p className="text-[13px] text-[#374151] font-bold">Sessions complétées</p>
                        <p className="text-[12px] text-[#9ca3af]">0 min de focus total</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
