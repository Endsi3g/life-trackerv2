import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { IconPlus, IconTrash, IconCheck, IconImage } from "@/components/shared/Icons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TasksTab() {
    const { tasks, loading, addTask, toggleTask, deleteTask, updateTaskImage } = useTasks();
    const [newTask, setNewTask] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        addTask(newTask.trim());
        setNewTask("");
        setIsAdding(false);
    };

    const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            updateTaskImage(id, e.target.files[0]);
        }
    };

    return (
        <div className="flex flex-col gap-[13px] animate-fade-up pb-24">
            <div className="flex justify-between items-center px-1">
                <p className="text-[#a0a8b5] text-[10.5px] font-bold tracking-[1.2px] uppercase">Tâches</p>
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
                        <div className="flex gap-2 p-1">
                            <input
                                type="text"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="Nouvelle tâche..."
                                autoFocus
                                className="flex-1 bg-white border border-[#e0e4ea] rounded-[15px] px-4 py-3 text-[14px] focus:outline-none focus:border-blue-400 shadow-sm"
                            />
                            <button
                                type="submit"
                                disabled={!newTask.trim()}
                                className="bg-[#0f172a] text-white px-5 rounded-[15px] font-bold text-[13px] disabled:opacity-50 scale-press shadow-md"
                            >
                                Ajouter
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="flex flex-col gap-[10px]">
                {loading && (
                    <div className="card-base text-center py-10">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-[#9ca3af] text-[13px]">Chargement...</p>
                    </div>
                )}

                {!loading && tasks.length === 0 && (
                    <div className="card-base text-center py-12 flex flex-col items-center">
                        <IconCheck size={40} className="text-[#e0e4ea] mb-3" />
                        <p className="text-[#9ca3af] text-[13px]">Aucune tâche pour le moment</p>
                    </div>
                )}

                {tasks.map((task) => (
                    <motion.div
                        layout
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "card-base flex items-center gap-4 transition-all",
                            task.done && "opacity-60 grayscale-[0.5]"
                        )}
                    >
                        <button
                            onClick={() => toggleTask(task.id, !task.done)}
                            className={cn(
                                "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                task.done
                                    ? "bg-[#10b981] border-[#10b981] text-white"
                                    : "border-[#e0e4ea] text-transparent hover:border-blue-400"
                            )}
                        >
                            <div className={cn("w-2 h-2 rounded-full bg-white transition-transform scale-0", task.done && "scale-100")} />
                        </button>

                        <div className="flex-1 min-w-0">
                            <p className={cn(
                                "text-[14px] font-bold text-[#374151] transition-all truncate",
                                task.done && "line-through text-[#9ca3af]"
                            )}>
                                {task.text}
                            </p>

                            {task.image_url && (
                                <div className="mt-2 relative rounded-[12px] overflow-hidden bg-[#f0f2f5] aspect-video">
                                    <img src={task.image_url} alt="Task attachment" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <label className="p-2 text-[#94a3b8] hover:text-[#3b82f6] transition-colors cursor-pointer">
                                <IconImage size={18} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(task.id, e)}
                                />
                            </label>
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="p-2 text-[#94a3b8] hover:text-red-500 transition-colors"
                            >
                                <IconTrash size={18} />
                            </button>
                        </div>

                        {task.tag && (
                            <span className="bg-[#f0f2f5] text-[#9ca3af] text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {task.tag}
                            </span>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
