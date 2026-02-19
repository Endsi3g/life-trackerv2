import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import Dashboard from "@/components/features/dashboard/Dashboard";
import TasksTab from "@/components/features/tasks/TasksTab";
import HabitsTab from "@/components/features/habits/HabitsTab";
import FocusTab from "@/components/features/focus/FocusTab";
import JournalTab from "@/components/features/journal/JournalTab";
import { AuthProvider } from "@/context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/focus" element={<FocusTab />} />
            <Route path="/tasks" element={<TasksTab />} />
            <Route path="/habits" element={<HabitsTab />} />
            <Route path="/journal" element={<JournalTab />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
