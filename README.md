# 🌱 Daily Habit Tracker

A lightweight, browser-based app to track your daily habits — no account or server required.

## Features

- **Add habits** with a simple text input
- **Check off habits** each day with a single click
- **🔥 Streak tracking** — consecutive days you've completed a habit
- **Daily progress bar** showing how many habits you've done today
- **Persistent data** — habits and streaks are saved in your browser's `localStorage`
- **Automatic day-rollover** — uncompleted habits reset automatically on a new day

## Getting Started

Just open `index.html` in any modern browser — no build step or dependencies needed.

```
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

## File Structure

```
Tracker/
├── index.html   # App shell and markup
├── style.css    # Styling
├── app.js       # Habit tracker logic
└── README.md
```

## Usage

1. Type a habit name in the input box and press **Add** (or hit Enter).
2. Click the circle next to a habit to mark it ✓ done for today.
3. Click again to unmark it.
4. Click **✕** to permanently delete a habit.
5. Come back each day — streaks grow as you stay consistent!