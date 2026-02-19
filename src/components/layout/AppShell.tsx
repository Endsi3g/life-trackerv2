import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import ChatOverlay from "@/components/features/chat/ChatOverlay";
import {
    IconDashboard,
    IconTimer,
    IconTasks,
    IconHabits,
    IconJournal,
    IconUser,
    IconSparkles
} from "@/components/shared/Icons";

export default function AppShell() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);

    const tabs = [
        { label: "Aujourd'hui", path: "/", icon: IconDashboard },
        { label: "Focus", path: "/focus", icon: IconTimer },
        { label: "Tâches", path: "/tasks", icon: IconTasks },
        { label: "Habitudes", path: "/habits", icon: IconHabits },
        { label: "Journal", path: "/journal", icon: IconJournal },
    ];

    const formatLongDate = () => {
        return new Date().toLocaleDateString("fr-FR", { weekday: "long", month: "long", day: "numeric" });
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex justify-center selection:bg-blue-100">
            <div className="w-full max-w-md bg-white min-h-screen shadow-[0_0_50px_rgba(0,0,0,0.02)] relative flex flex-col font-sans overflow-x-hidden">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl px-6 py-4 pt-10 flex flex-col gap-1 border-b border-[#f0f2f5]">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col">
                            <h1 className="text-[20px] font-bold text-[#0f172a] tracking-[-0.02em]">Cal.ai</h1>
                            <p className="text-[12px] font-bold text-[#94a3b8] uppercase tracking-[0.05em]">
                                {formatLongDate()}
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-[#f8fafc] border border-[#f1f5f9] flex items-center justify-center text-[#94a3b8] cursor-pointer hover:bg-slate-50 transition-colors">
                            <IconUser size={18} />
                        </div>
                    </div>
                </header>

                {/* Main */}
                <main className="flex-1 overflow-y-auto px-6 py-4">
                    <Outlet />
                </main>

                {/* Navigation Bar */}
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-2xl px-6 pb-8 pt-4 z-30 border-t border-[#f0f2f5]">
                    <div className="flex justify-between items-center relative">
                        {tabs.map((tab) => {
                            const isActive = location.pathname === tab.path;
                            const Icon = tab.icon;

                            return (
                                <button
                                    key={tab.path}
                                    onClick={() => navigate(tab.path)}
                                    className="flex flex-col items-center gap-1.5 transition-all group outline-none"
                                >
                                    <div className={cn(
                                        "w-11 h-11 rounded-[16px] flex items-center justify-center transition-all duration-300 relative",
                                        isActive ? "bg-[#0f172a] text-white shadow-lift" : "text-[#94a3b8] hover:text-[#374151] hover:bg-slate-50"
                                    )}>
                                        <Icon size={20} className={cn("transition-transform", isActive ? "scale-100" : "scale-90")} />
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-dot"
                                                className="absolute -bottom-1.5 w-1 h-1 bg-white rounded-full"
                                            />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-bold uppercase tracking-[0.1em] transition-colors duration-300",
                                        isActive ? "text-[#0f172a]" : "text-[#cbd5e1]"
                                    )}>
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Chat FAB */}
                <AnimatePresence>
                    {!isChatOpen && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={() => setIsChatOpen(true)}
                            className="fixed bottom-[110px] right-6 z-30 w-14 h-14 bg-[#0f172a] text-white rounded-[20px] shadow-lift flex items-center justify-center scale-press"
                        >
                            <IconSparkles size={24} />
                        </motion.button>
                    )}
                </AnimatePresence>

                <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            </div>
        </div>
    );
}
