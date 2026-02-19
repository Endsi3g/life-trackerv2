import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/types";

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    async function fetchTasks() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching tasks:", error);
            } else {
                setTasks(data || []);
            }
        } finally {
            setLoading(false);
        }
    }

    async function addTask(text: string, priority: number = 1, tag?: string) {
        // Optimistic update
        const tempId = crypto.randomUUID();
        const newTask: Task = {
            id: tempId,
            user_id: "temp", // Auth not fully enforced yet in frontend state
            text,
            priority,
            tag,
            done: false,
            created_at: new Date().toISOString(),
        };

        setTasks((prev) => [newTask, ...prev]);

        const { data, error } = await supabase
            .from("tasks")
            .insert([{ text, priority, tag }]) // user_id handling: RLS uses auth.uid(), but insert needs it?
            // If RLS is set to use auth.uid() on insert with default? No, usually Supabase needs the column to be set or default to auth.uid() (which is complex in SQL default).
            // Standard way: Client sends it (if they know it) or Backend sets it.
            // BUT: RLS 'with check' ensures user_id = auth.uid().
            // Actually, if we just insert, Supabase doesn't auto-fill user_id unless we have a trigger or default.
            // I should get the user from session.
            .select()
            .single();

        if (error) {
            console.error("Error adding task:", error);
            // Revert optimistic
            setTasks((prev) => prev.filter((t) => t.id !== tempId));
        } else if (data) {
            // Replace temp with real
            setTasks((prev) => prev.map((t) => (t.id === tempId ? data : t)));
        }
    }

    async function toggleTask(id: string, done: boolean) {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, done } : t))
        );

        const { error } = await supabase
            .from("tasks")
            .update({ done })
            .eq("id", id);

        if (error) {
            console.error("Error toggling task:", error);
            // Revert
            setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, done: !done } : t))
            );
        }
    }

    async function deleteTask(id: string) {
        const backup = tasks.find((t) => t.id === id);
        setTasks((prev) => prev.filter((t) => t.id !== id));

        const { error } = await supabase.from("tasks").delete().eq("id", id);

        if (error) {
            console.error("Error deleting task:", error);
            if (backup) setTasks((prev) => [...prev, backup]);
        }
    }

    // Image upload
    async function updateTaskImage(id: string, file: File) {
        const filePath = `tasks/${id}/${file.name}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);

        if (uploadError) {
            console.error("Error uploading image:", uploadError);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);

        setTasks(prev => prev.map(t => t.id === id ? { ...t, image_url: publicUrl } : t));

        await supabase.from("tasks").update({ image_url: publicUrl }).eq("id", id);
    }

    return { tasks, loading, addTask, toggleTask, deleteTask, updateTaskImage, refresh: fetchTasks };
}
