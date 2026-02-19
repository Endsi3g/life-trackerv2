# Life Tracker V2

A robust, scalable, and aesthetically premium "Cal.com for Life" application built for rapid progress tracking and AI-assisted life management.

## 🚀 Vision

Transforming the way we track our lives with a minimalist, high-contrast UI inspired by the "Cal.com" aesthetic. Life Tracker V2 is a full-stack, mobile-ready solution designed for performance and clarity.

## ✨ Features

- **📊 Dashboard**: Dynamic "Bento-grid" layout showing your daily score and vital stats.
- **✅ Task Management**: Full CRUD support for tasks with image attachments and categorization.
- **📈 Habit Tracking**: Log habits daily with beautiful progress visualizations (Ring UI).
- **⏱️ Focus Mode**: Integrated Pomodoro-style timer with customizable intervals (25/45/60 min).
- **📝 Journaling**: Quick daily entries with media support to capture your thoughts.
- **🤖 AI Assistant**: Natural language command processing (e.g., "add task Buy milk", "journal I had a great day").

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Framer Motion (Animations), Lucide React (Icons)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Mobile**: Capacitor (iOS & Android)
- **Deployment**: Vercel/Netlify (Web)

## 🏗️ Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Endsi3g/life-trackerv2.git
   cd life-trackerv2
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run Local Development**:
   Use the provided script to start Supabase (Docker) and the Vite dev server simultaneously:

   ```powershell
   .\dev-local.ps1
   ```

## 📱 Mobile Deployment

Sync and open the native project:

```bash
npm run build
npx cap sync
npx cap open android # or ios
```

## 📄 License

MIT
