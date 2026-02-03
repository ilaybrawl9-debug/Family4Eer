document.addEventListener("DOMContentLoaded", () => {
  const loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"));
  if (!loggedUser) window.location.href = "login.html";

  const familyCode = loggedUser.familyCode;
  const reminderInput = document.getElementById("reminderInput");
  const addBtn = document.getElementById("addReminderBtn");
  const reminderList = document.getElementById("reminderList");

  let reminders = JSON.parse(localStorage.getItem("reminders_" + familyCode) || "[]");

  function renderReminders() {
    reminderList.innerHTML = "";
    reminders.forEach((r, index) => {
      const li = document.createElement("li");
      li.className = r.done ? "done" : "";
      li.innerHTML = `
        <span>${r.text}</span>
        <div class="reminder-actions">
          <button class="toggleBtn">${r.done ? "✔️" : "❌"}</button>
          <button class="deleteBtn">🗑️</button>
        </div>
      `;
      reminderList.appendChild(li);

      li.querySelector(".toggleBtn").onclick = () => {
        reminders[index].done = !reminders[index].done;
        saveReminders();
        renderReminders();
      };

      li.querySelector(".deleteBtn").onclick = () => {
        if (confirm("למחוק את התזכורת?")) {
          reminders.splice(index, 1);
          saveReminders();
          renderReminders();
        }
      };
    });
  }

  function saveReminders() {
    localStorage.setItem("reminders_" + familyCode, JSON.stringify(reminders));
  }

  addBtn.onclick = () => {
    const text = reminderInput.value.trim();
    if (!text) return;
    reminders.push({ text, done: false });
    saveReminders();
    reminderInput.value = "";
    renderReminders();
  };

  reminderInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addBtn.click();
  });

  renderReminders();
});
