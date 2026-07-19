// ============================================
// This is our first bit of JavaScript.
// JavaScript's job is to make the page DO things,
// not just look a certain way (that's CSS's job).
// ============================================

// Step 1: Get today's date from the browser.
const today = new Date();
// "new Date()" creates an object representing right now
// (this exact second, on your computer).

// Step 2: Turn that date into a nice readable sentence,
// like "Sunday, July 12, 2026" instead of raw numbers.
const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
const formattedDate = today.toLocaleDateString(undefined, options);

// Step 3: Find the <p id="today-date"> element in our HTML file...
const dateElement = document.getElementById("today-date");

// ...and change its text to show the formatted date.
dateElement.textContent = formattedDate;

// Step 4: A friendly message in the developer console,
// just so we can confirm this file is connected and running.
// (You can see this by right-clicking the page -> Inspect -> Console tab)
console.log("script.js is connected and running correctly!");

// ============================================
// STEP 2: CALENDAR + DAILY PLANNER LOGIC
// ============================================

// "State" = the information our app needs to remember while running.
let viewDate = new Date();        // which month is currently shown on screen
let selectedDate = new Date();    // which day the user has clicked on

// Grab the HTML elements we'll be updating often.
const monthYearLabel = document.getElementById("month-year-label");
const calendarGrid = document.getElementById("calendar-grid");
const selectedDateLabel = document.getElementById("selected-date-label");
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");

// Helper: turns a Date object into a text key like "2026-07-12".
// We use this as the "storage box name" in Local Storage for that day's tasks.
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-11, so +1
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper: are two dates the same calendar day? (ignores time of day)
function isSameDay(a, b) {
  return toDateKey(a) === toDateKey(b);
}

// ============================================
// RENDER THE CALENDAR GRID FOR viewDate's MONTH
// ============================================
function renderCalendar() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0 = January, 11 = December

  // Update the "July 2026" label at the top
  monthYearLabel.textContent = viewDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  // Clear out whatever was in the grid before
  calendarGrid.innerHTML = "";

  // Add weekday header labels: Sun, Mon, Tue...
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  weekdays.forEach((day) => {
    const label = document.createElement("div");
    label.className = "weekday-label";
    label.textContent = day;
    calendarGrid.appendChild(label);
  });

  // Figure out what weekday the 1st of the month falls on (0-6)
  const firstDayWeekday = new Date(year, month, 1).getDay();

  // Figure out how many days are in this month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add empty blank cells before day 1, so day 1 lines up under the right weekday
  for (let i = 0; i < firstDayWeekday; i++) {
    const blank = document.createElement("div");
    blank.className = "day-cell empty";
    calendarGrid.appendChild(blank);
  }

  // Add one button per day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    const cell = document.createElement("button");
    cell.className = "day-cell";
    cell.textContent = day;

    if (isSameDay(cellDate, new Date())) {
      cell.classList.add("today");
    }
    if (isSameDay(cellDate, selectedDate)) {
      cell.classList.add("selected");
    }

    // When clicked, this day becomes the selected day
    cell.addEventListener("click", () => {
      selectedDate = cellDate;
      renderCalendar();  // redraw so the "selected" highlight moves
      renderPlanner();   // load that day's tasks
    });

    calendarGrid.appendChild(cell);
  }
}

// ============================================
// TASK STORAGE (using Local Storage)
// Local Storage only stores TEXT, so we convert
// our task list to text (JSON) to save it, and
// back to a real list to read it.
// ============================================
function getTasksForDate(date) {
  const key = "tasks-" + toDateKey(date);
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : []; // empty list if nothing saved yet
}

function saveTasksForDate(date, tasks) {
  const key = "tasks-" + toDateKey(date);
  localStorage.setItem(key, JSON.stringify(tasks));
}

// ============================================
// RENDER THE TASK LIST FOR selectedDate
// ============================================
function renderPlanner() {
  selectedDateLabel.textContent = selectedDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const tasks = getTasksForDate(selectedDate);
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const item = document.createElement("li");
    item.className = "task-item" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasksForDate(selectedDate, tasks);
      renderPlanner(); // redraw so the strike-through style updates
    });

    const text = document.createElement("span");
    text.textContent = task.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "\u2715"; // an "x" symbol
    deleteBtn.addEventListener("click", () => {
      tasks.splice(index, 1); // remove this task from the list
      saveTasksForDate(selectedDate, tasks);
      renderPlanner();
    });

    item.appendChild(checkbox);
    item.appendChild(text);
    item.appendChild(deleteBtn);
    taskList.appendChild(item);
  });
}

// Adds whatever is typed in the input box as a new task
function addTask() {
  const text = taskInput.value.trim(); // trim removes extra spaces
  if (text === "") return; // ignore empty submissions

  const tasks = getTasksForDate(selectedDate);
  tasks.push({ text: text, done: false });
  saveTasksForDate(selectedDate, tasks);

  taskInput.value = ""; // clear the input box
  renderPlanner();
}

// ============================================
// EVENT LISTENERS (connect buttons to actions)
// ============================================
document.getElementById("prev-month").addEventListener("click", () => {
  viewDate.setMonth(viewDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
  viewDate.setMonth(viewDate.getMonth() + 1);
  renderCalendar();
});

addTaskBtn.addEventListener("click", addTask);

// Also let the user press Enter instead of clicking "Add"
taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTask();
});

// ============================================
// FIRST RUN: draw the calendar and planner
// as soon as the page loads
// ============================================
renderCalendar();
renderPlanner();

// ============================================
// STEP 3: SWIPE GESTURES, REMINDERS, EXPORT/IMPORT
// ============================================

// ---------- SWIPE LEFT/RIGHT TO CHANGE MONTH ----------
let touchStartX = 0;

calendarGrid.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].screenX; // where the finger first touched
});

calendarGrid.addEventListener("touchend", (event) => {
  const touchEndX = event.changedTouches[0].screenX; // where the finger lifted off
  const distance = touchEndX - touchStartX;
  const minSwipeDistance = 50; // ignore tiny accidental movements

  if (distance > minSwipeDistance) {
    // swiped right (finger moved left-to-right) -> go to previous month
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderCalendar();
  } else if (distance < -minSwipeDistance) {
    // swiped left (finger moved right-to-left) -> go to next month
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderCalendar();
  }
});

// ---------- REMINDERS (shown only while the app is open) ----------
const enableRemindersBtn = document.getElementById("enable-reminders-btn");
const reminderStatus = document.getElementById("reminder-status");

function updateReminderStatusText() {
  if (Notification.permission === "granted") {
    reminderStatus.textContent = "Reminders are ON.";
  } else if (Notification.permission === "denied") {
    reminderStatus.textContent = "Reminders are blocked in your browser settings.";
  } else {
    reminderStatus.textContent = "Reminders are OFF.";
  }
}

function checkTodaysTasksAndNotify() {
  if (Notification.permission !== "granted") return;

  const todaysTasks = getTasksForDate(new Date());
  const unfinished = todaysTasks.filter((t) => !t.done);

  if (unfinished.length > 0) {
    new Notification("Life Planner", {
      body: `You have ${unfinished.length} task(s) left for today.`,
      icon: "icon-192.png",
    });
  }
}

enableRemindersBtn.addEventListener("click", () => {
  if (!("Notification" in window)) {
    reminderStatus.textContent = "Your browser doesn't support notifications.";
    return;
  }
  Notification.requestPermission().then(() => {
    updateReminderStatusText();
    checkTodaysTasksAndNotify(); // give one right away as a test
  });
});

// If permission was already granted on a previous visit, check right away.
if ("Notification" in window) {
  updateReminderStatusText();
  if (Notification.permission === "granted") {
    checkTodaysTasksAndNotify();
  }
}

// ---------- EXPORT DATA (save all tasks to a downloadable file) ----------
document.getElementById("export-btn").addEventListener("click", () => {
  const allData = {};

  // Go through every key saved in Local Storage...
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // ...and only grab the ones that belong to our planner's tasks.
    if (key.startsWith("tasks-")) {
      allData[key] = JSON.parse(localStorage.getItem(key));
    }
  }

  // Turn that data into a downloadable file.
  const fileContent = JSON.stringify(allData, null, 2);
  const blob = new Blob([fileContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "life-planner-backup.json";
  link.click();

  URL.revokeObjectURL(url); // cleans up memory
});

// ---------- IMPORT DATA (load tasks from a previously exported file) ----------
const importBtn = document.getElementById("import-btn");
const importFileInput = document.getElementById("import-file-input");

importBtn.addEventListener("click", () => {
  importFileInput.click(); // opens the phone/computer's file picker
});

importFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const importedData = JSON.parse(reader.result);
      // Write each imported day's tasks back into Local Storage.
      Object.keys(importedData).forEach((key) => {
        localStorage.setItem(key, JSON.stringify(importedData[key]));
      });
      renderPlanner(); // refresh the screen to show imported tasks
      alert("Import complete!");
    } catch (err) {
      alert("That file couldn't be read. Make sure it's a Life Planner backup file.");
    }
  };
  reader.readAsText(file);
});
