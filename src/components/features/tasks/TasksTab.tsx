import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Plus, Trash2, CheckCircle2, Circle, Image as ImageIcon } from "lucide-react";
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
        <div className="space-y-4 pb-20">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Tasks</h2>
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
                        className="overflow-hidden"
                    >
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="Add a new task..."
                                autoFocus
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={!newTask.trim()}
                                className="bg-blue-600 text-white px-4 rounded-xl font-medium disabled:opacity-50"
                            >
                                Add
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-3">
                {loading && <div className="text-center text-slate-400 py-10">Loading tasks...</div>}

                {!loading && tasks.length === 0 && (
                    <div className="text-center text-slate-400 py-10">
                        <p>No tasks yet. Add one to get started!</p>
                    </div>
                )}

                {tasks.map((task) => (
                    <motion.div
                        layout
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-3 group relative overflow-hidden",
                            task.done && "opacity-60 bg-slate-50"
                        )}
                    >
                        <button
                            onClick={() => toggleTask(task.id, !task.done)}
                            className={cn(
                                "mt-0.5 text-slate-300 hover:text-blue-500 transition-colors",
                                task.done && "text-emerald-500"
                            )}
                        >
                            {task.done ? <CheckCircle2 size={22} className="fill-emerald-500 text-white" /> : <Circle size={22} />}
                        </button>

                        <div className="flex-1 min-w-0">
                            <p className={cn(
                                "text-sm font-medium text-slate-900 transition-all",
                                task.done && "line-through text-slate-400"
                            )}>
                                {task.text}
                            </p>

                            {task.image_url && (
                                <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden bg-slate-100">
                                    <img src={task.image_url} alt="Task attachment" className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="cursor-pointer p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-500">
                                    <ImageIcon size={16} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(task.id, e)}
                                    />
                                </label>
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Tag pill if exists */}
                        {task.tag && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full whitespace-nowrap">
                                #{task.tag}
                            </span>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
