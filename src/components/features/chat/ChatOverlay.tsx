import { useState, useRef, useEffect } from "react";
import { IconClose as X, IconSend as Send, IconSparkles as Sparkles, IconDashboard as Command } from "@/components/shared/Icons";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks } from "@/hooks/use-tasks";
import { useHabits } from "@/hooks/use-habits";
import { useJournal } from "@/hooks/use-journal";
import { cn } from "@/lib/utils";

interface ChatOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
    timestamp: Date;
}

export default function ChatOverlay({ isOpen, onClose }: ChatOverlayProps) {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "assistant", text: "Salut ! Je suis ton assistant personnel. Comment puis-je t'aider aujourd'hui ?", timestamp: new Date() }
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const { addTask } = useTasks();
    const { habits, logHabit } = useHabits();
    const { addEntry } = useJournal();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // Simulate AI processing
        setTimeout(() => {
            processCommand(userMsg.text);
        }, 800);
    };

    const processCommand = (text: string) => {
        const lower = text.toLowerCase();
        let responseText = "Je n'ai pas compris. Tu peux dire 'ajouter tâche [nom]' ou 'boire de l'eau'.";

        if (lower.includes("ajouter") || lower.includes("tâche")) {
            const taskText = text.replace(/ajouter|tâche|tache/gi, "").trim();
            if (taskText) {
                addTask(taskText);
                responseText = `C'est fait ! J'ai ajouté : "${taskText}" à ta liste.`;
            }
        } else if (lower.includes("eau") || lower.includes("water") || lower.includes("boire")) {
            const habit = habits.find(h => h.name.toLowerCase().includes("eau") || h.name.toLowerCase().includes("water"));
            if (habit) {
                logHabit(habit.id);
                responseText = "Hydratation enregistrée ! Continue comme ça.";
            }
        } else if (lower.includes("journal") || lower.includes("noter")) {
            const content = text.replace(/journal|noter/gi, "").trim();
            if (content) {
                addEntry(content, new Date().toISOString());
                responseText = "Entrée enregistrée dans ton journal.";
            }
        }

        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", text: responseText, timestamp: new Date() };
        setMessages(prev => [...prev, aiMsg]);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#f0f2f5]/80 backdrop-blur-md z-40"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="fixed inset-x-0 bottom-0 z-50 h-[85vh] bg-white rounded-t-[32px] shadow-lift flex flex-col overflow-hidden border-t border-black/5"
                    >
                        {/* Smooth handle bar */}
                        <div className="flex justify-center py-3">
                            <div className="w-10 h-1.5 bg-[#e2e8f0] rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pb-4 pt-1">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#0f172a] rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-slate-200">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#0f172a] text-[16px]">Cal AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Connecté</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 bg-[#f0f2f5] rounded-full flex items-center justify-center text-[#94a3b8] scale-press">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6" ref={scrollRef}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "max-w-[85%] flex flex-col gap-1.5",
                                        msg.role === "user" ? "ml-auto items-end" : "items-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "p-4 text-[14.5px] leading-[1.5] shadow-sm",
                                            msg.role === "user"
                                                ? "bg-[#0f172a] text-white rounded-[20px] rounded-tr-[4px]"
                                                : "bg-[#f8fafc] text-[#374151] rounded-[20px] rounded-tl-[4px] border border-[#f1f5f9]"
                                        )}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest px-1">
                                        {msg.role === "user" ? "Vous" : "Assistant"}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-[#f1f5f9]">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center"
                            >
                                <div className="absolute left-4 text-[#94a3b8]">
                                    <Command size={18} />
                                </div>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Posez-moi une question..."
                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[18px] pl-11 pr-14 py-4 text-[15px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.05)] transition-all"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="absolute right-2 w-11 h-11 bg-[#0f172a] text-white rounded-[14px] flex items-center justify-center disabled:opacity-30 transition-all scale-press shadow-md"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
