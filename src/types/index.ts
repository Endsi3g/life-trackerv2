export interface Task {
    id: string;
    user_id: string;
    text: string;
    done: boolean;
    priority: number;
    tag?: string;
    deadline?: string;
    image_url?: string;
    created_at: string;
}

export interface Habit {
    id: string;
    user_id: string;
    name: string;
    icon: string;
    goal: number;
    unit: string;
    color: string;
    created_at: string;
}

export interface HabitLog {
    id: string;
    habit_id: string;
    date: string;
    value: number;
}

export interface Goal {
    id: string;
    user_id: string;
    title: string;
    target?: string;
    deadline?: string;
    color?: string;
    created_at: string;
}

export interface JournalEntry {
    id: string;
    user_id: string;
    date: string;
    content: string;
    gratitude?: string;
    intention?: string;
    image_url?: string;
}
