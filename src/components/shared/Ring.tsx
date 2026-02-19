import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RingProps {
    pct: number;
    size?: number;
    stroke?: number;
    color?: string;
    bg?: string;
    children?: React.ReactNode;
    className?: string;
}

export function Ring({
    pct,
    size = 120,
    stroke = 8,
    color = "#3b82f6",
    bg = "#e8ecf0",
    children,
    className
}: RingProps) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;

    return (
        <div
            className={cn("relative flex items-center justify-center", className)}
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size} className="-rotate-90 transform">
                {/* Background Circle */}
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none"
                    stroke={bg}
                    strokeWidth={stroke}
                />
                {/* Progress Circle */}
                <motion.circle
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - (Math.min(pct, 100) / 100) * circ }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circ}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
}
