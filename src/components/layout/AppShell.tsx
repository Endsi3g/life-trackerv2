import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Timer, Sparkles, BookOpen } from "lucide-react"; // Icons matching "Cal AI" vibe
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import ChatOverlay from "@/components/features/chat/ChatOverlay";

export default function AppShell() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);

    const tabs = [
        { label: "Today", path: "/", icon: LayoutDashboard },
        { label: "Focus", path: "/focus", icon: Timer },
        { label: "Tasks", path: "/tasks", icon: CheckSquare },
        { label: "Habits", path: "/habits", icon: Sparkles },
        { label: "Journal", path: "/journal", icon: BookOpen },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center">
            <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
                {/* Header - Sticky */}
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 py-4 pt-12">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                Life<span className="text-primary-600">Scheduler</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                            </p>
                        </div>
                        {/* Profile / Mood Placeholder */}
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg">
                            User
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
                    <Outlet />
                </main>

                {/* Bottom Tab Bar */}
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-slate-100 pb-safe pt-2 px-2 z-30">
                    <div className="flex justify-around items-end pb-4">
                        {tabs.map((tab) => {
                            const isActive = location.pathname === tab.path;
                            const Icon = tab.icon;

                            return (
                                <button
                                    key={tab.path}
                                    onClick={() => navigate(tab.path)}
                                    className="relative flex flex-col items-center gap-1 p-2 w-16 group"
                                >
                                    <div className={cn(
                                        "relative z-10 p-1.5 rounded-xl transition-all duration-300",
                                        isActive ? "bg-slate-900 text-white shadow-lg scale-110" : "text-slate-400 group-hover:text-slate-600"
                                    )}>
                                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold tracking-wide transition-colors duration-200",
                                        isActive ? "text-slate-900" : "text-slate-400"
                                    )}>
                                        {tab.label}
                                    </span>

                                    {isActive && (
                                        <motion.div
                                            layoutId="tab-indicator"
                                            className="absolute -top-2 w-1 h-1 rounded-full bg-blue-500"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* AI Chat FAB */}
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-24 right-6 z-30 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
                >
                    <Sparkles size={24} />
                </button>

                <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            </div>
        </div>
    );
}
