import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Habit, HabitLog } from "@/types";
import { format } from "date-fns";

export function useHabits() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [logs, setLogs] = useState<HabitLog[]>([]);
    const [loading, setLoading] = useState(true);
    const today = format(new Date(), "yyyy-MM-dd");

    useEffect(() => {
        fetchHabits();
    }, []);

    async function fetchHabits() {
        try {
            setLoading(true);
            const { data: habitsData, error: habitsError } = await supabase
                .from("habits")
                .select("*")
                .order("created_at", { ascending: true });

            if (habitsError) throw habitsError;
            setHabits(habitsData || []);

            // Fetch logs for today (or recent range? For now just today/all)
            // Optimally we fetch logs for the displayed date range (e.g. this week).
            // For MVP, fetch all logs for these habits.
            const { data: logsData, error: logsError } = await supabase
                .from("habit_logs")
                .select("*");

            if (logsError) throw logsError;
            setLogs(logsData || []);

        } catch (e) {
            console.error("Error fetching habits:", e);
        } finally {
            setLoading(false);
        }
    }

    async function addHabit(name: string, goal: number = 1, unit: string = "times", icon: string = "⭐", color: string = "#3b82f6") {
        const tempId = crypto.randomUUID();
        const newHabit: Habit = {
            id: tempId,
            user_id: "temp",
            name, goal, unit, icon, color,
            created_at: new Date().toISOString()
        };
        setHabits(prev => [...prev, newHabit]);

        const { data, error } = await supabase
            .from("habits")
            .insert([{ name, goal, unit, icon, color }])
            .select()
            .single();

        if (error) {
            console.error("Error adding habit:", error);
            setHabits(prev => prev.filter(h => h.id !== tempId));
        } else if (data) {
            setHabits(prev => prev.map(h => h.id === tempId ? data : h));
        }
    }

    async function logHabit(habitId: string) {
        // Check if log exists for today
        const currentLog = logs.find(l => l.habit_id === habitId && l.date === today);
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        const currentValue = currentLog?.value || 0;
        const newValue = currentValue >= habit.goal ? 0 : currentValue + 1; // Cycle or Cap? Original cycled: "c >= h.goal ? 0 : c + 1"

        // Optimistic
        if (currentLog) {
            setLogs(prev => prev.map(l => l.id === currentLog.id ? { ...l, value: newValue } : l));
        } else {
            const tempLog: HabitLog = {
                id: "temp-log",
                habit_id: habitId,
                date: today,
                value: newValue
            };
            setLogs(prev => [...prev, tempLog]);
        }

        const { data, error } = await supabase
            .from("habit_logs")
            .upsert({ habit_id: habitId, date: today, value: newValue }, { onConflict: 'habit_id,date' })
            .select()
            .single();

        if (error) {
            console.error("Error logging habit:", error);
            // Revert logic would go here
            fetchHabits(); // Crude revert
        } else if (data) {
            setLogs(prev => {
                const exists = prev.find(l => l.habit_id === habitId && l.date === today);
                if (exists) return prev.map(l => l.habit_id === habitId && l.date === today ? data : l);
                return [...prev.filter(l => l.id !== "temp-log"), data];
            });
        }
    }

    async function deleteHabit(id: string) {
        setHabits(prev => prev.filter(h => h.id !== id));
        await supabase.from("habits").delete().eq("id", id);
    }

    return { habits, logs, loading, addHabit, logHabit, deleteHabit, today };
}
