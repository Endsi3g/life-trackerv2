import { useState } from "react";
import { useJournal } from "@/hooks/use-journal";
import { Plus, Image as ImageIcon, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function JournalTab() {
    const { entries, loading, addEntry } = useJournal();
    const [isAdding, setIsAdding] = useState(false);
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        addEntry(content, new Date().toISOString(), image || undefined);
        setContent("");
        setImage(null);
        setIsAdding(false);
    };

    return (
        <div className="space-y-4 pb-20">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Journal</h2>
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
                        className="overflow-hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6"
                    >
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind today?"
                            className="w-full h-32 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                            autoFocus
                        />

                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 text-slate-500 text-sm cursor-pointer hover:text-blue-500 transition-colors">
                                <ImageIcon size={18} />
                                <span>{image ? image.name : "Add Photo"}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files && setImage(e.target.files[0])}
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={!content.trim()}
                                className="bg-slate-900 text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50"
                            >
                                Save Entry
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-6">
                {loading && <div className="text-center text-slate-400 py-10">Loading entries...</div>}

                {!loading && entries.length === 0 && (
                    <div className="text-center text-slate-400 py-10">
                        <p>Your journal is empty. Write your first entry!</p>
                    </div>
                )}

                {entries.map((entry, i) => (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-medium uppercase tracking-wider">
                            <Calendar size={12} />
                            {format(new Date(entry.date), "MMMM d, yyyy • h:mm a")}
                        </div>

                        <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {entry.content}
                        </p>

                        {entry.image_url && (
                            <div className="mt-4 rounded-xl overflow-hidden shadow-sm">
                                <img src={entry.image_url} alt="Journal attachment" className="w-full object-cover" />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
