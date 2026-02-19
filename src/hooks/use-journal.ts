import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { JournalEntry } from "@/types";

export function useJournal() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEntries();
    }, []);

    async function fetchEntries() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("journal")
                .select("*")
                .order("date", { ascending: false });

            if (error) throw error;
            setEntries(data || []);
        } catch (e) {
            console.error("Error fetching journal:", e);
        } finally {
            setLoading(false);
        }
    }

    async function addEntry(content: string, date: string, imageFile?: File) {
        let imageUrl = null;

        if (imageFile) {
            const filePath = `journal/${Date.now()}_${imageFile.name}`;
            const { error: uploadError } = await supabase.storage.from('images').upload(filePath, imageFile);
            if (!uploadError) {
                const { data } = supabase.storage.from('images').getPublicUrl(filePath);
                imageUrl = data.publicUrl;
            }
        }

        const { data, error } = await supabase
            .from("journal")
            .insert([{ content, date, image_url: imageUrl }])
            .select()
            .single();

        if (error) {
            console.error("Error adding entry:", error);
        } else if (data) {
            setEntries(prev => [data, ...prev]);
        }
    }

    return { entries, loading, addEntry };
}
