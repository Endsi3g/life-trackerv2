import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden"
            >
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold">84%</h2>
                        <p className="text-slate-400 text-sm font-medium">Daily Score</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-slate-700 flex items-center justify-center">
                        <span className="text-lg font-bold">B+</span>
                    </div>
                </div>
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -translate-x-10 translate-y-10" />
            </motion.div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                        <span className="text-xl">💧</span>
                    </div>
                    <h3 className="font-semibold text-slate-900">Water</h3>
                    <p className="text-xs text-slate-500">4/8 cups</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                        <span className="text-xl">🏃</span>
                    </div>
                    <h3 className="font-semibold text-slate-900">Exercise</h3>
                    <p className="text-xs text-slate-500">0/1 session</p>
                </motion.div>
            </div>

            {/* Upcoming Section */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Up Next</h3>
                <div className="space-y-3">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-1 h-12 bg-blue-500 rounded-full" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 text-sm">Design Review</h4>
                            <p className="text-xs text-slate-500">10:00 AM • Zoom</p>
                        </div>
                        <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                            →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
