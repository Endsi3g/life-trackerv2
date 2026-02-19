import { Ring } from "@/components/shared/Ring";
import { IconWater, IconActivity, IconChevronRight, IconTrophy } from "@/components/shared/Icons";

export default function Dashboard() {
    const taskScore = 84; // Mock scores for design match
    const habitScore = 75;
    const overall = 80;

    return (
        <div className="flex flex-col gap-[13px] animate-fade-up">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-5 rounded-[22px] shadow-card relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-[#64748b] text-[12px] mb-1">
                            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <h2 className="text-white text-[21px] font-extrabold tracking-tight mb-4">
                            Score du jour
                        </h2>
                        <div className="flex gap-[22px]">
                            <div>
                                <div className="text-[#3b82f6] text-[20px] font-extrabold">
                                    {taskScore}%
                                </div>
                                <div className="text-[#475569] text-[11px] mt-px">Tâches</div>
                            </div>
                            <div>
                                <div className="text-[#10b981] text-[20px] font-extrabold">
                                    {habitScore}%
                                </div>
                                <div className="text-[#475569] text-[11px] mt-px">Habitudes</div>
                            </div>
                        </div>
                    </div>
                    <Ring pct={overall} size={108} stroke={9} color="#3b82f6" bg="#1e293b">
                        <span className="text-white text-[24px] font-extrabold">{overall}</span>
                        <span className="text-[#475569] text-[10px]">/ 100</span>
                    </Ring>
                </div>
                {overall >= 100 && (
                    <div className="absolute top-3 right-3 animate-bounce">
                        <IconTrophy className="text-[#f59e0b] w-6 h-6" />
                    </div>
                )}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-[13px]">
                <div className="card-base card-hover">
                    <p className="text-[#a0a8b5] text-[10.5px] font-bold tracking-[1.2px] uppercase mb-[13px]">Eau</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[#374151] text-[18px] font-bold">4/8</p>
                            <p className="text-[#9ca3af] text-[12px]">tasses</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <IconWater size={20} className="text-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="card-base card-hover">
                    <p className="text-[#a0a8b5] text-[10.5px] font-bold tracking-[1.2px] uppercase mb-[13px]">Exercice</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[#374151] text-[18px] font-bold">0/1</p>
                            <p className="text-[#9ca3af] text-[12px]">session</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <IconActivity size={20} className="text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Section */}
            <div className="card-base card-hover">
                <p className="text-[#a0a8b5] text-[10.5px] font-bold tracking-[1.2px] uppercase mb-[13px]">À venir</p>
                <div className="flex items-center gap-4">
                    <div className="w-1 h-12 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                        <h4 className="font-bold text-[#374151] text-[14px]">Design Review</h4>
                        <p className="text-[12px] text-[#9ca3af]">10:00 AM • Zoom</p>
                    </div>
                    <button className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400">
                        <IconChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
