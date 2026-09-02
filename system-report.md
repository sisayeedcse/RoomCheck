# ROOMCHECK — System Architecture Report

## Overview
ROOMCHECK is a frontend prototype of a university classroom and laboratory availability system, designed specifically for the CSE Department. This report serves as a handoff document for future AI agents or developers continuing the project.

## Project Philosophy
* **Beginner-Friendly:** The codebase is designed for a beginner CSE student to understand. 
* **No Frameworks:** No React, Vue, Angular, Node.js, or complex build tools.
* **No Comments:** Code files (HTML, CSS, JS) explicitly contain ZERO comments, as per strict project requirements.
* **Vanilla Stack:** HTML5, CSS3, Bootstrap 5 (via CDN), and Vanilla JavaScript.
* **Static Data:** The backend is mocked using static JavaScript arrays (`rooms.js`, `schedule.js`).

## File Structure
```
d:\Softwares\RoomCheck\
├── css/
│   ├── style.css         (Core design system, color variables)
│   ├── responsive.css    (Media queries for mobile/tablet)
│   └── admin.css         (Specific styles for the admin dashboard)
├── js/
│   ├── rooms.js          (Data: 22 official CSE rooms)
│   ├── schedule.js       (Data: Spring 2026 class routine map)
│   └── room-check.js     (Logic: Overlap calculation, DOM injection)
├── index.html            (Landing page with hero and quick search)
├── search.html           (Dedicated search interface)
├── results.html          (Search results with dynamic JS injection)
├── room-details.html     (Individual room view with dynamic daily schedule)
├── dashboard.html        (Student portal dashboard)
├── bookings.html         (Student bookings list)
├── login.html            (Authentication UI)
├── register.html         (Authentication UI)
├── admin.html            (Admin dashboard with dynamic room status)
├── add-room.html         (Admin interface to add a room)
└── README.md             (Project documentation)
```

## Core Logic (`room-check.js`)
The application computes room availability on the client side:
1. **Inputs:** Date (converted to Weekday), Start Time, End Time, Room Type, Floor.
2. **Time Normalization:** Times (e.g., `08:30`) are converted to minutes from midnight (`510`) for safe mathematical comparisons.
3. **Overlap Formula:** A room is occupied if an existing class overlaps the requested time:
   `classStart < reqEnd && classEnd > reqStart`
4. **Data States:**
   - Overlap detected -> `OCCUPIED`
   - No overlap -> `AVAILABLE`
   - Thursday/Friday selected -> `Schedule information is not available for this day`

## DOM Manipulation
* Forms submit via `GET` to `results.html` (e.g., `results.html?date=2026-09-10&start=10:00&end=11:00`).
* `room-check.js` intercepts page loads, parses the `URLSearchParams`, filters the data, and dynamically replaces the `innerHTML` of target container IDs (e.g., `#results-container`, `#rd-schedule-tbody`).

## Next Steps for Future Agents
1. **Expand Schedule:** Populate `schedule.js` with the full exhaustive list of Spring 2026 classes (currently contains a representative sample to prove the logic).
2. **Database Migration:** Convert the logic to a backend (PHP/Node.js) and migrate `rooms.js` and `schedule.js` into MySQL tables.
