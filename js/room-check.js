function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function getWeekday(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getDay()];
}

function formatTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    let displayH = h % 12;
    if (displayH === 0) displayH = 12;
    const displayM = m < 10 ? '0' + m : m;
    return `${displayH}:${displayM} ${ampm}`;
}

function checkRoomOccupancy(roomNumber, weekday, reqStart, reqEnd) {
    if (weekday === 'Thursday' || weekday === 'Friday') {
        return { isOccupied: false, classes: [], noData: true };
    }

    const roomClasses = schedule.filter(c => c.room === roomNumber && c.day === weekday);
    
    let isOccupied = false;
    let overlappingClasses = [];

    roomClasses.forEach(c => {
        const classStart = timeToMinutes(c.startTime);
        const classEnd = timeToMinutes(c.endTime);

        if (reqStart !== null && reqEnd !== null && classStart < reqEnd && classEnd > reqStart) {
            isOccupied = true;
            overlappingClasses.push(c);
        }
    });

    return { isOccupied, classes: roomClasses, overlappingClasses, noData: false };
}

function displayResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    const startParam = urlParams.get('start');
    const endParam = urlParams.get('end');
    const typeParam = urlParams.get('type') || '';
    const roomParam = urlParams.get('room') || '';
    const floorParam = urlParams.get('floor') || '';


    if (!dateParam) {
        return; 
    }

    const weekday = getWeekday(dateParam);
    const reqStart = startParam ? timeToMinutes(startParam) : null;
    const reqEnd = endParam ? timeToMinutes(endParam) : null;

    let filteredRooms = rooms;

    if (typeParam && typeParam !== 'Any Room') {
        filteredRooms = filteredRooms.filter(r => r.type === typeParam);
    }
    if (roomParam && roomParam !== 'Any Room') {
        filteredRooms = filteredRooms.filter(r => r.room === roomParam);
    }
    if (floorParam && floorParam !== 'Any Floor') {
        filteredRooms = filteredRooms.filter(r => r.floor === floorParam);
    }

    let availableCount = 0;
    let occupiedCount = 0;
    
    let resultsHtml = '';

    if (filteredRooms.length === 0) {
        document.getElementById('results-count').innerText = "0 rooms match your criteria";
        document.getElementById('results-container').innerHTML = `<div class="col-12"><p>No rooms match your filter criteria.</p></div>`;
        return;
    }

    let isNoData = false;

    filteredRooms.forEach(r => {
        const occupancy = checkRoomOccupancy(r.room, weekday, reqStart, reqEnd);
        
        if (occupancy.noData) {
            isNoData = true;
            availableCount++; 
        } else if (occupancy.isOccupied) {
            occupiedCount++;
        } else {
            availableCount++;
        }

        const isOccupied = occupancy.isOccupied && !occupancy.noData;
        const statusClass = isOccupied ? 'occupied' : 'available';
        const statusText = isOccupied ? 'Occupied' : 'Available';
        const statusColor = isOccupied ? '#ef4444' : '#22c55e';
        const cardClass = isOccupied ? 'room-card occupied-card' : 'room-card';

        let icon = r.type === 'Laboratory' ? 'bi-pc-display' : 'bi-door-open';
        let bg = r.type === 'Laboratory' ? 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)' : 'linear-gradient(135deg, #052e16 0%, #166534 100%)';
        if (isOccupied) bg = ''; 

        let btnHtml = isOccupied 
            ? `<a href="room-details.html?room=${r.room}&date=${dateParam}" class="btn-rc btn-rc-outline">View Schedule</a>
               <button class="btn-rc btn-rc-secondary" style="flex:1; cursor:not-allowed;" disabled>Unavailable</button>`
            : `<a href="room-details.html?room=${r.room}&date=${dateParam}" class="btn-rc btn-rc-outline">View Details</a>
               <a href="room-details.html?room=${r.room}&date=${dateParam}" class="btn-rc btn-rc-primary">Book Now</a>`;

        resultsHtml += `
            <div class="col-md-6">
                <div class="${cardClass}">
                    <div class="room-card-img">
                        <div class="room-card-img-placeholder" style="background:${bg}"><i class="bi ${icon}"></i></div>
                    </div>
                    <div class="room-card-body">
                        <div class="room-card-header">
                            <h3 class="room-card-name">${r.type === 'Laboratory' ? 'Lab' : 'Room'} ${r.room}</h3>
                            <span class="status-badge ${statusClass}"><span style="width:6px;height:6px;border-radius:50%;background:${statusColor};display:inline-block;"></span> ${statusText}</span>
                        </div>
                        <p class="room-card-type">${r.type}</p>
                        <p class="room-card-location"><i class="bi bi-geo-alt"></i> ${r.building} • ${r.floor}</p>
                        ${r.capacity ? `<p class="room-card-capacity"><i class="bi bi-people"></i> Capacity: ${r.capacity} Students</p>` : ''}
                        <div class="facility-tags">
                            ${r.type === 'Laboratory' ? '<span class="facility-tag"><i class="bi bi-pc-display"></i> Computers</span>' : '<span class="facility-tag"><i class="bi bi-projector"></i> Projector</span><span class="facility-tag"><i class="bi bi-pen"></i> Whiteboard</span>'}
                            <span class="facility-tag"><i class="bi bi-thermometer"></i> AC</span>
                            <span class="facility-tag"><i class="bi bi-wifi"></i> Wi-Fi</span>
                        </div>
                        <div class="room-card-actions">
                            ${btnHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    let countText = `Showing ${filteredRooms.length} rooms — ${availableCount} available, ${occupiedCount} occupied`;
    if (isNoData) {
        countText = "Schedule information is not available for this day.";
    } else if (availableCount === 0) {
        resultsHtml = `
        <div class="col-12 text-center" style="padding: 40px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
            <i class="bi bi-calendar-x" style="font-size: 32px; color: #94a3b8; display: block; margin-bottom: 12px;"></i>
            <h4 style="color: #0f172a; margin-bottom: 8px;">No rooms are available for this time.</h4>
            <p style="color: #64748b; margin-bottom: 0;">Try:<br>• Another time<br>• Another room type<br>• Another floor</p>
        </div>`;
    }

    const countEl = document.getElementById('results-count');
    const containerEl = document.getElementById('results-container');
    const summaryTagsEl = document.getElementById('summary-tags');

    if (countEl) countEl.innerText = countText;
    if (containerEl) containerEl.innerHTML = resultsHtml;
    if (summaryTagsEl) {
        summaryTagsEl.innerHTML = `
            <span class="summary-tag"><i class="bi bi-calendar3"></i> ${dateParam} (${weekday})</span>
            <span class="summary-tag"><i class="bi bi-clock"></i> ${formatTime(reqStart)} — ${formatTime(reqEnd)}</span>
            ${roomParam && roomParam !== 'Any Room' ? `<span class="summary-tag"><i class="bi bi-door-open"></i> Room ${roomParam}</span>` : ''}
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes('results.html')) {
        displayResults();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const searchForms = document.querySelectorAll("form[action='results.html']");
    searchForms.forEach(form => {
        form.addEventListener("submit", (e) => {
            const dateInput = form.querySelector('input[type="date"]');
            const startInput = form.querySelector('input[name="start"]');
            const endInput = form.querySelector('input[name="end"]');

            if (!dateInput) return; 

            if (!dateInput.value) {
                e.preventDefault();
                alert("Please select a date.");
                return;
            }
            if (startInput && !startInput.value) {
                e.preventDefault();
                alert("Please select a start time.");
                return;
            }
            if (endInput && !endInput.value) {
                e.preventDefault();
                alert("Please select an end time.");
                return;
            }

            if (startInput && endInput) { 
                const startMins = timeToMinutes(startInput.value);
                const endMins = timeToMinutes(endInput.value);

                if (endMins <= startMins) {
                    e.preventDefault();
                    alert("End time must be later than start time.");
                    return;
                }
            }
        });
    });
});

function displayRoomDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    let dateParam = urlParams.get('date');
    if (!roomParam) return;

    if (!dateParam) {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        dateParam = `${yyyy}-${mm}-${dd}`;
    }

    const room = rooms.find(r => r.room === roomParam);
    if (!room) return;

    const weekday = getWeekday(dateParam);
    const scheduleTitleEl = document.getElementById('rd-schedule-title');
    if (scheduleTitleEl) scheduleTitleEl.innerText = `Schedule — ${weekday}, ${dateParam}`;

    const nameEl = document.getElementById('rd-name');
    if (nameEl) nameEl.innerText = `${room.type === 'Laboratory' ? 'Lab' : 'Room'} ${room.room}`;
    
    const typeEl = document.getElementById('rd-type');
    if (typeEl) typeEl.innerHTML = `${room.type} &nbsp;&bull;&nbsp; ${room.building} &nbsp;&bull;&nbsp; ${room.floor}`;

    const capEl = document.getElementById('rd-capacity');
    if (capEl) capEl.innerText = room.capacity ? `${room.capacity} Students` : 'N/A';
    
    const rtEl = document.getElementById('rd-room-type');
    if (rtEl) rtEl.innerText = room.type;

    const bldgEl = document.getElementById('rd-building');
    if (bldgEl) bldgEl.innerText = room.building;

    const floorEl = document.getElementById('rd-floor');
    if (floorEl) floorEl.innerText = room.floor;

    const tbody = document.getElementById('rd-schedule-tbody');
    if (tbody) {
        let html = '';
        if (weekday === 'Thursday' || weekday === 'Friday') {
            html = `<tr><td colspan="3" class="text-center py-4">Schedule information is not available for this day.</td></tr>`;
        } else {
            const timeSlots = [
                { s: "08:30", e: "08:55" }, { s: "08:55", e: "09:20" }, { s: "09:20", e: "09:45" },
                { s: "09:45", e: "10:10" }, { s: "10:10", e: "10:35" }, { s: "10:35", e: "11:00" },
                { s: "11:00", e: "11:25" }, { s: "11:25", e: "11:50" }, { s: "11:50", e: "12:15" },
                { s: "12:15", e: "12:40" }, { s: "12:40", e: "13:05" }, { s: "13:05", e: "13:30" },
                { s: "13:30", e: "13:55" }, { s: "13:55", e: "14:20" }, { s: "14:20", e: "14:45" },
                { s: "14:45", e: "15:10" }, { s: "15:10", e: "15:35" }, { s: "15:35", e: "16:00" },
                { s: "17:30", e: "18:00" }
            ];

            const roomClasses = schedule.filter(c => c.room === room.room && c.day === weekday);

            if (roomClasses.length === 0) {
                html = `<tr><td colspan="3" class="text-center py-4 text-success">No scheduled classes found. Room is available all day.</td></tr>`;
            } else {
                timeSlots.forEach(slot => {
                    const slotStart = timeToMinutes(slot.s);
                    const slotEnd = timeToMinutes(slot.e);
                    
                    let activity = '—';
                    let isOccupied = false;

                    roomClasses.forEach(c => {
                        const classStart = timeToMinutes(c.startTime);
                        const classEnd = timeToMinutes(c.endTime);
                        if (classStart < slotEnd && classEnd > slotStart) {
                            activity = c.course;
                            isOccupied = true;
                        }
                    });

                    const statusClass = isOccupied ? 'occupied' : 'available';
                    const statusText = isOccupied ? 'Occupied' : 'Available';

                    html += `
                        <tr>
                            <td>${slot.s} – ${slot.e}</td>
                            <td>${activity}</td>
                            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        </tr>
                    `;
                });
            }
        }
        tbody.innerHTML = html;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes('room-details.html')) {
        displayRoomDetails();
    }
});

function displayAdminDashboard() {
    const tbody = document.getElementById('admin-room-tbody');
    if (!tbody) return;

    const now = new Date();
    let weekday = getWeekday(now.toISOString().split('T')[0]);
    if (weekday === 'Thursday' || weekday === 'Friday') {
        weekday = 'Saturday'; 
    }
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    let testWeekday = weekday;
    let testMins = currentMins;
    if (currentMins < 480 || currentMins > 1080) { 
        testWeekday = 'Saturday';
        testMins = 630; 
    }

    let html = '';
    let availableCount = 0;
    let occupiedCount = 0;

    rooms.forEach(r => {
        const occupancy = checkRoomOccupancy(r.room, testWeekday, testMins, testMins + 30);
        const isOccupied = occupancy.isOccupied;

        if (isOccupied) {
            occupiedCount++;
        } else {
            availableCount++;
        }

        const statusClass = isOccupied ? 'occupied' : 'available';
        const statusText = isOccupied ? 'Occupied' : 'Available';
        const statusColor = isOccupied ? '#ef4444' : '#22c55e';

        html += `
            <tr>
                <td class="room-number-cell">${r.type === 'Laboratory' ? 'Lab' : 'Room'} ${r.room}</td>
                <td>${r.type}</td>
                <td>${r.building} &bull; ${r.floor}</td>
                <td>${r.capacity || '-'}</td>
                <td><span class="status-badge ${statusClass}"><span style="width:6px;height:6px;border-radius:50%;background:${statusColor};display:inline-block;"></span> ${statusText}</span></td>
            </tr>
        `;
    });

    tbody.innerHTML = html;

    const totalRoomsEl = document.getElementById('admin-total-rooms');
    const availRoomsEl = document.getElementById('admin-avail-rooms');
    const occRoomsEl = document.getElementById('admin-occ-rooms');

    if (totalRoomsEl) totalRoomsEl.innerText = rooms.length;
    if (availRoomsEl) availRoomsEl.innerText = availableCount;
    if (occRoomsEl) occRoomsEl.innerText = occupiedCount;
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes('admin.html')) {
        displayAdminDashboard();
    }
});
