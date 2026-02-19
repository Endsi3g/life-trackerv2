import { useState } from "react";
import { IconSend, IconCalendar, IconSparkles } from "@/components/shared/Icons";
import { cn } from "@/lib/utils";

export default function JournalTab() {
    const [entry, setEntry] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!entry.trim()) return;
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setEntry("");
        setIsSaving(false);
    };

    return (
        <div className="flex flex-col gap-[13px] animate-fade-up pb-24">
            <div className="flex justify-between items-center px-1">
                <p className="text-[#a0a8b5] text-[10.5px] font-bold tracking-[1.2px] uppercase">Journal</p>
                <div className="flex items-center gap-2 text-[#94a3b8]">
                    <IconCalendar size={14} />
                    <span className="text-[11px] font-bold">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </div>

            <div className="card-base min-h-[50vh] flex flex-col p-6">
                <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="Quoi de neuf aujourd'hui ?"
                    className="flex-1 w-full resize-none outline-none text-[#374151] placeholder:text-[#cbd5e1] leading-relaxed font-sans text-[16px]"
                />

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#f0f2f5]">
                    <div className="flex items-center gap-2 text-[#3b82f6]">
                        <IconSparkles size={16} />
                        <span className="text-[12px] font-bold uppercase tracking-wider">AI Insights prêt</span>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={!entry.trim() || isSaving}
                        className={cn(
                            "w-12 h-12 rounded-[16px] flex items-center justify-center transition-all scale-press shadow-lg shadow-blue-500/20",
                            entry.trim() ? "bg-[#0f172a] text-white" : "bg-[#f0f2f5] text-[#cbd5e1]"
                        )}
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <IconSend size={20} />
                        )}
                    </button>
                </div>
            </div>

            <div className="card-base py-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <IconCalendar className="text-blue-500 w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[14px] font-bold text-[#374151]">Historique</p>
                        <p className="text-[12px] text-[#9ca3af]">Voir les entrées précédentes</p>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:border-blue-100">
                    <IconCalendar size={16} />
                </div>
            </div>
        </div>
    );
}
