import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Calendar } from "lucide-react";

export default function JournalTab() {
    const [entry, setEntry] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!entry.trim()) return;
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEntry("");
        setIsSaving(false);
    };

    return (
        <div className="space-y-4 pb-20">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Journal</h2>
                <button
                    onClick={handleSave}
                    disabled={!entry.trim() || isSaving}
                    className="bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 px-4"
                >
                    <Save size={18} />
                    {isSaving ? "Saving..." : "Save"}
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 min-h-[60vh] flex flex-col"
            >
                <div className="flex items-center gap-2 text-slate-400 mb-4 border-b border-slate-50 pb-2">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="What's on your mind today?"
                    className="flex-1 w-full resize-none outline-none text-slate-700 placeholder:text-slate-300 leading-relaxed font-sans"
                />
            </motion.div>
        </div>
    );
}
