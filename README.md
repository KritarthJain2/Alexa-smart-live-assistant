# Alexa+ Smart Live Assistant

> A modern, conversational AI productivity web application built for the **Build, Ship, Shape: Amazon Developer Hackathon** (Alexa+ Simulated Experience Track).

---

## 1. Project Overview

**Alexa+ Smart Live Assistant** is an intelligent personal productivity companion engineered to help users organize daily tasks, deadlines, routines, and workflows through both conversational natural language and a visual dashboard. 

The application offers an authentic simulated Alexa+ experience:
- It supports **real task and habit management** driven by conversational inputs (e.g., *"Add a task to finish my assignment tomorrow"*, *"Show my pending tasks"*, *"Create a daily study routine"*).
- It features an **offline-first local intent parser** with zero external dependencies, alongside an **optional server-side Gemini 3.8 Flash AI endpoint** for complex reasoning.
- All dashboard metrics, completion rates, overdue backlogs, and calendar schedules are **calculated directly from persistent browser storage** with zero fake numbers.

---

## 2. Features

### 🌟 Feature 1 — Productivity Dashboard
- **Personalized Time-of-Day Greeting:** Dynamic morning/afternoon/evening greeting with live clock and formatted date.
- **Real Calculated Metrics:** Live counters for Total Tasks, Pending Tasks, Completed Tasks, and Overdue Backlog calculated directly from stored data.
- **Productivity Progress Ring:** Interactive circular completion gauge showing true percentage of finished tasks.
- **Today's Action Schedule:** Live view of tasks due today and daily routines active for today, with one-click completion.
- **Priority Focus Queue:** Urgent and high-priority items surfaced for immediate attention.
- **Quick Action Bar:** One-click shortcuts for New Task, New Routine, Daily Briefing, and Calendar.

### 📋 Feature 2 — Task Manager
- **Complete Task Lifecycle:** Create, edit, inspect, toggle complete, and permanently delete tasks.
- **Deadlines & Times:** Set due dates (Today, Tomorrow, +1 Week quick picks) and optional due times.
- **Priority Levels:** Urgent, High, Medium, and Low with distinct visual badges.
- **Categorization:** Work, Study, Health, Personal, Finance, Project, Errands, and Other.
- **Instant Search & Multi-Filters:** Live text search across title, notes, and tags; filter by status (All, Pending, Overdue, Completed) and priority.
- **Flexible Sorting:** Sort by due date (soonest/latest), priority level, title (A-Z), or recently created.
- **Overdue Detection:** Automatic overdue tagging based on local system date/time.

### 🤖 Feature 3 — Alexa+ AI Chat Assistant
- **Dual-Engine Architecture:**
  - **Alexa+ Local Core:** Deterministic local intent engine with natural language date parsing, priority detection, and instant task mutation.
  - **Gemini 3.8 Flash Cloud (Optional):** Server-side `@google/genai` integration with structured function calling.
- **Interactive Action Cards:** When tasks or routines are created/completed, conversational action cards appear with direct navigation links.
- **Voice Input (Speech-to-Text):** Integrated Web Speech recognition button with animated pulse.
- **Voice Feedback (Text-to-Speech):** Speech synthesis readout with customizable speed and pitch.
- **Prompt Suggestions Carousel:** One-click sample queries for quick testing.

### 🔄 Feature 4 — Daily Routines & Habit Tracking
- **Habit Scheduling:** Define routine name, scheduled time, description, and category.
- **Day-of-Week Selector:** Assign routines to specific days (e.g., Mon–Fri weekdays or daily).
- **Today's Habit Checklist:** Track recurring routines completed for the current day.
- **Momentum Meter:** Visual progress bar calculating today's habit completion percentage.

### 📅 Feature 5 — Calendar Schedule
- **Interactive Monthly Grid:** Month navigation (Previous, Today, Next) with days-of-week headers.
- **Visual Deadline Dots:** Color-coded priority indicators and routine badges on dates.
- **Date Inspector Side Panel:** Click any date to view all tasks and recurring habits scheduled for that day, with a quick "+ Add Task" button pre-filled with the selected date.

### 📊 Feature 6 — Productivity Insights
- **100% Genuine Metrics:** No randomized or dummy statistics.
- **Completion Rate:** Exact percentage of completed vs. pending tasks.
- **7-Day Velocity Chart:** Real daily breakdown of completed tasks using actual completion timestamps.
- **Priority Distribution:** Visual breakdown of pending urgent, high, medium, and low tasks.
- **Category Weights:** Category completion ratios across active domains.

### ⚙️ Feature 7 — Settings & System Diagnostics
- **User Customization:** Configurable display name.
- **Theme Switcher:** Dark Navy (default), Deep Twilight, and Clean Slate Light.
- **Voice Preferences:** Toggle audio feedback on/off; adjust speech playback speed (0.8x to 1.4x).
- **Data Export & Import:** Export all tasks, routines, and settings as a JSON backup file; restore from JSON with schema validation.
- **Factory Reset:** Safe, double-confirmed local data reset.
- **Diagnostics Panel:** Live check of server API status, stored records count, and quota health.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS v4, Lucide React icons, Plus Jakarta Sans typography
- **Server:** Node.js, Express, tsx
- **AI SDK:** `@google/genai` (Gemini 3.8 Flash model with server-side proxy)
- **Speech:** Native Web Speech API (`SpeechSynthesis` and `webkitSpeechRecognition`)
- **Storage:** Browser `localStorage` with automated JSON schema migration & backup

---

## 4. Installation Instructions

Ensure you have **Node.js (v18+)** installed.

```bash
# 1. Clone repository
git clone <repository-url>
cd alexa-plus-smart-assistant

# 2. Install dependencies
npm install
```

---

## 5. Local Development Instructions

Start the full-stack Express server with Vite middleware:

```bash
# Start development server on port 3000
npm run dev
```

Open your browser at `http://localhost:3000`.

To build for production:

```bash
npm run build
npm start
```

---

## 6. Environment Variable Setup

The application works 100% offline using its built-in **Alexa+ Local Core** intent engine. To enable optional cloud AI reasoning via Google Gemini:

1. Create a `.env` file in the project root (based on `.env.example`):

```bash
cp .env.example .env
```

2. Add your Gemini API key:

```env
GEMINI_API_KEY="your-actual-gemini-api-key"
PORT=3000
```

> **Security Note:** `GEMINI_API_KEY` is exclusively read on the server (`server.ts`). It is never injected or bundled into the client-side JavaScript.

---

## 7. How the Local Assistant Mode Works

The application provides a deterministic rule-based natural language engine (`src/utils/localAssistantEngine.ts`):

1. **Date Parsing:**
   - Detects relative terms (*"tomorrow"*, *"today"*, *"tonight"*, *"yesterday"*, *"in 3 days"*).
   - Resolves days of the week (*"next monday"*, *"this friday"*).
   - Handles ISO date formats (`YYYY-MM-DD`).

2. **Priority & Category Extraction:**
   - Detects priority keywords (*"urgent"*, *"critical"*, *"high"*, *"minor"*, *"low"*).
   - Categorizes tasks based on word boundaries (*"study"*, *"homework"* -> Study; *"workout"*, *"doctor"* -> Health; *"tax"*, *"bill"* -> Finance; *"meeting"*, *"client"* -> Work).

3. **Action Execution:**
   - When an action is detected, the engine returns a typed action payload (`taskToCreate`, `routineToCreate`, `taskToCompleteId`, `taskToDeleteId`, etc.).
   - The application executes the state update immediately in `localStorage` and renders an interactive action card in chat.

---

## 8. Known Limitations

- **Speech Recognition:** Web Speech Recognition requires browser permission and depends on browser support (best in Google Chrome, Chromium browsers, and Safari). Fallback text input is always available.
- **Alexa+ Track Context:** This is an Amazon Developer Hackathon simulation prototype. It does not connect to physical Amazon Echo hardware or require an Alexa Developer Console skill account.
- **Single-Device Storage:** LocalStorage stores data within the specific browser. To transfer data across devices, use the **Settings > Export Backup (JSON)** feature.

---

## 9. Testing Instructions

The project includes an automated test suite verifying date parsing, priority deduction, overdue logic, productivity calculations, and assistant action dispatches:

```bash
# Run unit tests
npm test
```

Expected output:
```
--- Running Alexa+ Task Management & Assistant Engine Tests ---
✅ PASSED: Correctly parsed "tomorrow"
✅ PASSED: Correctly parsed "today"
✅ PASSED: Correctly parsed "in 3 days"
✅ PASSED: Parsed urgent priority
✅ PASSED: Parsed high priority
✅ PASSED: Parsed low priority
✅ PASSED: Defaulted to medium priority
✅ PASSED: Categorized assignment as Study
✅ PASSED: Categorized meeting as Work
✅ PASSED: Categorized workout as Health
✅ PASSED: Categorized invoice as Finance
✅ PASSED: Cleaned title correctly
✅ PASSED: Extracted "call Mom"
✅ PASSED: Detected 2020 date as overdue
✅ PASSED: Completed task is not overdue
✅ PASSED: Future date is not overdue
✅ PASSED: Total tasks calculated: 3
✅ PASSED: Completed tasks calculated: 1
✅ PASSED: Pending tasks calculated: 2
✅ PASSED: Overdue tasks calculated: 1
✅ PASSED: Completion rate calculated: 33%
✅ PASSED: Today routines completed: 1
✅ PASSED: Created task intent generated payload
✅ PASSED: Task title properly assigned
✅ PASSED: Category correctly deduced as Study
✅ PASSED: Handled empty pending list with friendly reply
✅ PASSED: Created routine intent generated payload
✅ PASSED: Routine name identified
✅ PASSED: Generated summary briefing
🎉 ALL 18 TESTS PASSED SUCCESSFULLY!
```

---

## 10. License

Apache-2.0. Built for the Amazon Developer Hackathon.
