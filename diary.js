document.addEventListener("DOMContentLoaded", () => {
  const loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"));
  if (!loggedUser) window.location.href = "login.html";

  const currentDateDiv = document.getElementById("currentDate");
  const today = new Date();
  currentDateDiv.textContent = today.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const calendarDiv = document.getElementById("calendar");
  const eventForm = document.getElementById("eventForm");
  const eventTitle = document.getElementById("eventTitle");
  const eventDesc = document.getElementById("eventDesc");
  const saveEventBtn = document.getElementById("saveEventBtn");
  const cancelEventBtn = document.getElementById("cancelEventBtn");
  const selectedDaySpan = document.getElementById("selectedDay");

  const familyCode = loggedUser.familyCode;
  let events = JSON.parse(localStorage.getItem("diary_" + familyCode) || "[]");
  let selectedDate = null;

  function renderCalendar() {
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    calendarDiv.innerHTML = "";

    for (let day = 1; day <= daysInMonth; day++) {
      const dateDiv = document.createElement("div");
      dateDiv.classList.add("day");
      dateDiv.textContent = day;

      const dayEvents = events.filter(e => e.date === day);
      if (dayEvents.length > 0) {
        dateDiv.classList.add("has-event");
      }

      dateDiv.onclick = () => {
        selectedDate = day;
        selectedDaySpan.textContent = day;
        const existingEvent = events.find(e => e.date === day);
        eventTitle.value = existingEvent ? existingEvent.title : "";
        eventDesc.value = existingEvent ? existingEvent.desc : "";
        eventForm.style.display = "block";
      };

      // הצגת אירועים בתוך היום
      dayEvents.forEach(ev => {
        const evDiv = document.createElement("div");
        evDiv.classList.add("day-event");
        evDiv.textContent = ev.title;
        evDiv.title = ev.desc;
        evDiv.onclick = (e) => {
          e.stopPropagation();
          if (confirm("למחוק את האירוע הזה?")) {
            events = events.filter(ev2 => !(ev2.date === day && ev2.title === ev.title));
            localStorage.setItem("diary_" + familyCode, JSON.stringify(events));
            renderCalendar();
          }
        };
        dateDiv.appendChild(evDiv);
      });

      calendarDiv.appendChild(dateDiv);
    }
  }

  saveEventBtn.onclick = () => {
    if (!eventTitle.value.trim()) return alert("כותרת אירוע דרושה!");
    events = events.filter(e => e.date !== selectedDate);
    events.push({ date: selectedDate, title: eventTitle.value, desc: eventDesc.value });
    localStorage.setItem("diary_" + familyCode, JSON.stringify(events));
    eventForm.style.display = "none";
    renderCalendar();
  };

  cancelEventBtn.onclick = () => eventForm.style.display = "none";

  renderCalendar();
});
