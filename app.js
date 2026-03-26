/**
 * Daily Habit Tracker — app.js
 *
 * Data shape (stored in localStorage under "habits"):
 * [
 *   {
 *     id:        string,          // unique id
 *     name:      string,          // habit label
 *     streak:    number,          // consecutive days completed
 *     lastDone:  string | null,   // ISO date string of last completion ("YYYY-MM-DD")
 *     doneToday: boolean          // true if marked done on today's date
 *   },
 *   ...
 * ]
 */

(function () {
  'use strict';

  /* ── Helpers ──────────────────────────────────────────────────── */

  function todayISO() {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  }

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ── Persistence ──────────────────────────────────────────────── */

  function loadHabits() {
    try {
      return JSON.parse(localStorage.getItem('habits')) || [];
    } catch {
      return [];
    }
  }

  function saveHabits(habits) {
    localStorage.setItem('habits', JSON.stringify(habits));
  }

  /* ── State ────────────────────────────────────────────────────── */

  let habits = loadHabits();

  /**
   * On every page load, check whether it is a new day and reset doneToday
   * for any habit whose lastDone differs from today.
   */
  function reconcileDay() {
    const today = todayISO();
    habits.forEach((h) => {
      if (h.doneToday && h.lastDone !== today) {
        // Missed yesterday — streak breaks if lastDone is not yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayISO = yesterday.toISOString().slice(0, 10);
        if (h.lastDone !== yesterdayISO) {
          h.streak = 0;
        }
        h.doneToday = false;
      }
    });
    saveHabits(habits);
  }

  /* ── DOM references ───────────────────────────────────────────── */

  const habitList       = document.getElementById('habit-list');
  const habitInput      = document.getElementById('habit-input');
  const habitForm       = document.getElementById('habit-form');
  const emptyState      = document.getElementById('empty-state');
  const progressSection = document.getElementById('progress-section');
  const progressFill    = document.getElementById('progress-fill');
  const progressText    = document.getElementById('progress-text');
  const todayDateEl     = document.getElementById('today-date');

  /* ── Render ───────────────────────────────────────────────────── */

  function updateProgress() {
    if (habits.length === 0) {
      progressSection.hidden = true;
      return;
    }
    progressSection.hidden = false;
    const done  = habits.filter((h) => h.doneToday).length;
    const total = habits.length;
    const pct   = Math.round((done / total) * 100);
    progressFill.style.width = pct + '%';
    progressText.textContent = done + ' / ' + total;
  }

  function createHabitEl(habit) {
    const li = document.createElement('li');
    li.className = 'habit-item';
    li.dataset.id = habit.id;

    const check = document.createElement('div');
    check.className = 'habit-check' + (habit.doneToday ? ' done' : '');
    check.setAttribute('role', 'checkbox');
    check.setAttribute('aria-checked', habit.doneToday ? 'true' : 'false');
    check.setAttribute('aria-label', 'Mark ' + habit.name + ' as done');
    check.setAttribute('tabindex', '0');
    if (habit.doneToday) check.textContent = '✓';

    const info = document.createElement('div');
    info.className = 'habit-info';

    const name = document.createElement('div');
    name.className = 'habit-name' + (habit.doneToday ? ' done' : '');
    name.textContent = habit.name;

    const streakEl = document.createElement('div');
    streakEl.className = 'habit-streak';
    if (habit.streak > 0) {
      const badge = document.createElement('span');
      badge.className = 'streak-badge';
      badge.textContent = '🔥 ' + habit.streak + ' day streak';
      streakEl.appendChild(badge);
    }

    info.appendChild(name);
    info.appendChild(streakEl);

    const del = document.createElement('button');
    del.className = 'habit-delete';
    del.textContent = '✕';
    del.setAttribute('aria-label', 'Delete ' + habit.name);
    del.title = 'Delete habit';

    li.appendChild(check);
    li.appendChild(info);
    li.appendChild(del);

    /* Events */
    const toggleDone = () => toggleHabit(habit.id);
    check.addEventListener('click', toggleDone);
    check.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDone(); }
    });
    del.addEventListener('click', () => deleteHabit(habit.id));

    return li;
  }

  function render() {
    habitList.innerHTML = '';
    emptyState.hidden = habits.length > 0;

    habits.forEach((habit) => {
      habitList.appendChild(createHabitEl(habit));
    });

    updateProgress();
  }

  /* ── Actions ──────────────────────────────────────────────────── */

  function addHabit(name) {
    const trimmed = name.trim();
    if (!trimmed) return;

    habits.push({
      id:        uid(),
      name:      trimmed,
      streak:    0,
      lastDone:  null,
      doneToday: false,
    });
    saveHabits(habits);
    render();
  }

  function toggleHabit(id) {
    const today = todayISO();
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    if (!habit.doneToday) {
      // Mark as done — only extend streak if lastDone was yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString().slice(0, 10);

      habit.streak = habit.lastDone === yesterdayISO ? habit.streak + 1 : 1;
      habit.lastDone  = today;
      habit.doneToday = true;
    } else {
      // Unmark
      habit.doneToday = false;
      habit.streak    = Math.max(0, habit.streak - 1);
      if (habit.streak === 0) habit.lastDone = null;
    }

    saveHabits(habits);
    render();
  }

  function deleteHabit(id) {
    habits = habits.filter((h) => h.id !== id);
    saveHabits(habits);
    render();
  }

  /* ── Event listeners ──────────────────────────────────────────── */

  habitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addHabit(habitInput.value);
    habitInput.value = '';
  });

  /* ── Init ─────────────────────────────────────────────────────── */

  todayDateEl.textContent = formatDate(todayISO());
  reconcileDay();
  render();
})();
