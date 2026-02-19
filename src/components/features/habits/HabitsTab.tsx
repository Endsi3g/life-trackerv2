import { useState } from "react";
import { useHabits } from "@/hooks/use-habits";
import { IconPlus, IconCheck } from "@/components/shared/Icons";
import { motion, AnimatePresence } from "framer-motion";
import { Ring } from "@/components/shared/Ring";
import { cn } from "@/lib/utils";

export default function HabitsTab() {
    const { habits, logs, loading, addHabit, logHabit, today } = useHabits();
    const [isAdding, setIsAdding] = useState(false);
    const [newHabit, setNewHabit] = useState({ name: "", goal: "1", icon: "⭐", unit: "times" });

    const days = ["L", "M", "M", "J", "V", "S", "D"];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabit.name.trim()) return;
        addHabit(newHabit.name, parseInt(newHabit.goal) || 1, newHabit.unit, newHabit.icon);
        setNewHabit({ name: "", goal: "1", icon: "⭐", unit: "times" });
        setIsAdding(false);
    };

    return (
        <div className="flex flex-col gap-[13px] animate-fade-up pb-24">
            <div className="flex justify-between items-center px-1">
                <p className="text-[#a0a8b5] text-[10.5px] font-bold tracking-[1.2px] uppercase">Habitudes</p>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="w-8 h-8 rounded-full bg-white border border-[#e0e4ea] flex items-center justify-center text-[#94a3b8] shadow-sm scale-press"
                >
                    <IconPlus size={18} />
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 4 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        onSubmit={handleSubmit}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-3 p-1">
                            <input
                                value={newHabit.name}
                                onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
                                placeholder="Nom de l'habitude (ex: Lecture)"
                                className="w-full bg-white border border-[#e0e4ea] rounded-[15px] px-4 py-3 text-[14px] focus:outline-none focus:border-blue-400 shadow-sm"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <input
                                    value={newHabit.icon}
                                    onChange={e => setNewHabit({ ...newHabit, icon: e.target.value })}
                                    placeholder="Icône"
                                    className="w-16 text-center bg-white border border-[#e0e4ea] rounded-[15px] px-2 py-3 text-[14px] focus:outline-none"
                                    maxLength={2}
                                />
                                <input
                                    type="number"
                                    value={newHabit.goal}
                                    onChange={e => setNewHabit({ ...newHabit, goal: e.target.value })}
                                    placeholder="Objectif"
                                    className="flex-1 bg-white border border-[#e0e4ea] rounded-[15px] px-4 py-3 text-[14px] focus:outline-none"
                                />
                                <button type="submit" className="bg-[#0f172a] text-white px-6 rounded-[15px] font-bold text-[13px] scale-press shadow-md">
                                    Créer
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="flex flex-col gap-[10px]">
                {loading && (
                    <div className="card-base text-center py-10">
                        <div className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-[#9ca3af] text-[13px]">Chargement...</p>
                    </div>
                )}

                {habits.map((habit) => {
                    const log = logs.find(l => l.habit_id === habit.id && l.date === today);
                    const current = log?.value || 0;
                    const pct = Math.min((current / habit.goal) * 100, 100);

                    return (
                        <div key={habit.id} className="card-base card-hover flex items-center justify-between gap-4 py-[18px]">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="cursor-pointer relative flex-shrink-0" onClick={() => logHabit(habit.id)}>
                                    <Ring pct={pct} size={54} stroke={5} color={habit.color || "#10b981"} bg="#f0f2f5">
                                        <span className="text-[18px]">{habit.icon}</span>
                                    </Ring>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[15px] font-bold text-[#374151] mb-1 truncate">{habit.name}</h3>
                                    <div className="flex gap-[6px] items-center">
                                        {[...Array(5)].map((_, dotIdx) => (
                                            <div
                                                key={dotIdx}
                                                className={cn(
                                                    "w-2.5 h-2.5 rounded-full",
                                                    dotIdx === 4
                                                        ? (pct === 100 ? "bg-[#10b981]" : "bg-[#f0f2f5] border-[1.5px] border-[#e0e4ea]")
                                                        : "bg-[#10b981]/20"
                                                )}
                                            />
                                        ))}
                                        <span className="text-[10px] text-[#9ca3af] font-bold ml-1 uppercase tracking-wider">
                                            {current} / {habit.goal}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => logHabit(habit.id)}
                                className={cn(
                                    "w-11 h-11 rounded-[14px] flex items-center justify-center transition-all scale-press",
                                    pct === 100
                                        ? "bg-[#10b981] text-white shadow-lg shadow-emerald-500/20"
                                        : "bg-[#f0f2f5] text-[#94a3b8]"
                                )}
                            >
                                <IconCheck size={22} className={cn("transition-transform", pct === 100 ? "scale-100" : "scale-90")} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Weekly Overview */}
            <div className="card-base mt-4">
                <p className="text-[#a0a8b5] text-[10.5px] font-bold tracking-[1.2px] uppercase mb-[13px]">Vue Hebdomadaire</p>
                <div className="flex justify-between items-center px-1">
                    {days.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold text-[#94a3b8]">{day}</span>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors",
                                i === new Date().getDay() - 1 ? "bg-[#0f172a] text-white" : "text-[#374151] bg-[#f0f2f5]"
                            )}>
                                {new Date().getDate() - (new Date().getDay() - 1) + i}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
