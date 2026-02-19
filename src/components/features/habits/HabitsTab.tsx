import { useState } from "react";
import { useHabits } from "@/hooks/use-habits";
import { Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Ring } from "@/components/shared/Ring";
import { cn } from "@/lib/utils";

export default function HabitsTab() {
    const { habits, logs, loading, addHabit, logHabit, deleteHabit, today } = useHabits();
    const [isAdding, setIsAdding] = useState(false);
    const [newHabit, setNewHabit] = useState({ name: "", goal: "1", icon: "⭐", unit: "times" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabit.name.trim()) return;
        addHabit(newHabit.name, parseInt(newHabit.goal) || 1, newHabit.unit, newHabit.icon);
        setNewHabit({ name: "", goal: "1", icon: "⭐", unit: "times" });
        setIsAdding(false);
    };

    return (
        <div className="space-y-4 pb-20">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Habits</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-slate-900 text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
                >
                    <Plus size={24} />
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="overflow-hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4"
                    >
                        <div className="space-y-3">
                            <input
                                value={newHabit.name}
                                onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
                                placeholder="Habit name (e.g. Reader)"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <input
                                    value={newHabit.icon}
                                    onChange={e => setNewHabit({ ...newHabit, icon: e.target.value })}
                                    placeholder="Icon"
                                    className="w-16 text-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-2"
                                    maxLength={2}
                                />
                                <input
                                    type="number"
                                    value={newHabit.goal}
                                    onChange={e => setNewHabit({ ...newHabit, goal: e.target.value })}
                                    placeholder="Goal"
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                                />
                                <input
                                    value={newHabit.unit}
                                    onChange={e => setNewHabit({ ...newHabit, unit: e.target.value })}
                                    placeholder="Unit"
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                                />
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-xl font-bold">
                                Create Habit
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="flex flex-col gap-3">
                {loading && <div className="text-center text-slate-400 py-10">Loading habits...</div>}

                {habits.map((habit, i) => {
                    const log = logs.find(l => l.habit_id === habit.id && l.date === today);
                    const current = log?.value || 0;
                    const pct = Math.min((current / habit.goal) * 100, 100);

                    return (
                        <motion.div
                            key={habit.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 relative group"
                        >
                            <div
                                className="cursor-pointer relative"
                                onClick={() => logHabit(habit.id)}
                            >
                                <Ring pct={pct} size={48} stroke={4} color={habit.color || "#3b82f6"}>
                                    <span className="text-xl">{habit.icon}</span>
                                </Ring>
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">{habit.name}</h3>
                                <p className={cn("text-xs font-medium transition-colors", pct === 100 ? "text-blue-500" : "text-slate-400")}>
                                    {current} / {habit.goal} {habit.unit}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => logHabit(habit.id)}
                                    className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95",
                                        pct === 100 ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                    )}
                                >
                                    +
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
