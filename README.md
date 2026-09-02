# 🏫 RoomCheck

Welcome to **RoomCheck**! This is a simple, easy-to-understand web project for finding empty classrooms and labs in the CSE department.

If you are a student looking for a free room to study or do a group project, this website helps you figure out which rooms are empty and which ones have a class going on.

## 🚀 What Does It Do?
* **Find Empty Rooms:** Pick a date and time, and it will tell you exactly which rooms are free!
* **Check a Specific Room:** Want to know if Room 403 is free right now? Just search for it!
* **Daily Schedule:** Click on any room to see its full routine for the day.

## 💻 How Is It Built?
I kept this project super simple so any beginner CSE student can understand how it works. 

There are no complicated frameworks, no databases yet, and no confusing setup. It uses the pure basics of web development:
* **HTML5:** For the structure of the pages.
* **CSS3 & Bootstrap 5:** To make it look modern and beautiful.
* **Vanilla JavaScript:** To handle the search logic and figure out if a room is free or occupied.

### Where is the logic?
Check out the `js/` folder!
1. `rooms.js` holds a simple list of all 22 official CSE rooms.
2. `schedule.js` holds the class routine.
3. `room-check.js` does the math. It looks at the time you searched for, checks the routine, and decides if the room is taken!

## 🛠️ How To Run It
You don't need any servers to run this! 
1. Download or clone this folder to your computer.
2. Double-click on `index.html` to open it in Chrome, Firefox, or Edge.
3. That's it! Try searching for a room on a Saturday morning.

Happy coding! 🚀
