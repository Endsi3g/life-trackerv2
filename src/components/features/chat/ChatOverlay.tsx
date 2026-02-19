import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Sparkles } from "lucide-react";
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
        { id: "1", role: "assistant", text: "Hi! I'm your life assistant. Tell me to 'add task', 'log water', or 'journal' something.", timestamp: new Date() }
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
        }, 600);
    };

    const processCommand = (text: string) => {
        const lower = text.toLowerCase();
        let responseText = "I didn't catch that. Try 'add task [name]' or 'log [habit]'.";

        if (lower.startsWith("add task") || lower.startsWith("remind me to")) {
            const taskText = lower.replace(/add task|remind me to/gi, "").trim();
            if (taskText) {
                addTask(taskText);
                responseText = `Added task: "${taskText}"`;
            }
        } else if (lower.startsWith("log") || lower.startsWith("track")) {
            const habitName = lower.replace(/log|track/gi, "").trim();
            const habit = habits.find(h => h.name.toLowerCase().includes(habitName));
            if (habit) {
                logHabit(habit.id);
                responseText = `Logged ${habit.name}! Keep it up.`;
            } else {
                responseText = `I couldn't find a habit matching "${habitName}".`;
            }
        } else if (lower.startsWith("journal")) {
            const content = lower.replace("journal", "").trim();
            if (content) {
                addEntry(content, new Date().toISOString());
                responseText = "Saved to your journal.";
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
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 z-50 h-[80vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/50 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                    <Sparkles size={16} />
                                </div>
                                <h3 className="font-bold text-slate-900">Assistant</h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                                        msg.role === "user"
                                            ? "ml-auto bg-blue-600 text-white rounded-tr-none"
                                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"
                                    )}
                                >
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2"
                            >
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask AI..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="p-2 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:bg-slate-300 transition-colors"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
