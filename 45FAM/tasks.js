document.addEventListener("DOMContentLoaded", () => {
  const loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"));
  if (!loggedUser) window.location.href = "login.html";

  const familyCode = loggedUser.familyCode;
  const taskInput = document.getElementById("taskInput");
  const taskDate = document.getElementById("taskDate");
  const taskStatus = document.getElementById("taskStatus");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");

  let tasks = JSON.parse(localStorage.getItem("tasks_" + familyCode) || "[]");

  function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach((t, index) => {
      const li = document.createElement("li");
      li.className = `task ${t.status}`;
      li.innerHTML = `
        <div class="task-info">
          <span class="task-text">${t.text}</span>
          <span class="task-date">${t.date || ""}</span>
          <span class="task-status">${t.status.replace('-', ' ')}</span>
        </div>
        <div class="task-actions">
          <select class="statusSelect">
            <option value="open" ${t.status === "open" ? "selected" : ""}>פתוחה</option>
            <option value="in-progress" ${t.status === "in-progress" ? "selected" : ""}>בעבודה</option>
            <option value="completed" ${t.status === "completed" ? "selected" : ""}>הושלמה</option>
          </select>
          <button class="deleteBtn">🗑️</button>
        </div>
      `;
      taskList.appendChild(li);

      // שינוי סטטוס
      li.querySelector(".statusSelect").onchange = (e) => {
        tasks[index].status = e.target.value;
        saveTasks();
        renderTasks();
      };

      // מחיקה
      li.querySelector(".deleteBtn").onclick = () => {
        if (confirm("למחוק את המטלה?")) {
          tasks.splice(index, 1);
          saveTasks();
          renderTasks();
        }
      };
    });
  }

  function saveTasks() {
    localStorage.setItem("tasks_" + familyCode, JSON.stringify(tasks));
  }

  addTaskBtn.onclick = () => {
    const text = taskInput.value.trim();
    if (!text) return;
    const date = taskDate.value;
    const status = taskStatus.value;
    tasks.push({ text, date, status });
    saveTasks();
    taskInput.value = "";
    taskDate.value = "";
    renderTasks();
  };

  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTaskBtn.click();
  });

  renderTasks();
});
