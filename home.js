document.addEventListener("DOMContentLoaded", () => {
  const loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"));
  if (!loggedUser) {
    window.location.href = "login.html";
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const username = loggedUser.username;
  const userData = users[username];

  // בדיקה אם המשתמש חסום
  if (userData.blocked) {
    alert("❌ המשתמש חסום! אין לך גישה.");
    sessionStorage.removeItem("loggedUser");
    window.location.href = "login.html";
    return;
  }

  const familyCode = userData.familyCode;

  // הצגת התאריך
  const currentDate = document.getElementById("currentDate");
  const today = new Date();
  currentDate.textContent = today.toLocaleDateString('he-IL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  // ברוך הבא במרכז
  document.getElementById("welcomeMessage").textContent = `ברוך הבא למשפחת ${userData.familyName} – ${username}`;

  // תפריט
  const menuBtn = document.getElementById("menuBtn");
  const menuDropdown = document.getElementById("menuDropdown");
  menuBtn.addEventListener("click", () => {
    menuDropdown.style.display = menuDropdown.style.display === "none" ? "block" : "none";
  });

  // התנתקות
  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("loggedUser");
    window.location.href = "login.html";
  });

  // רשימת בני משפחה מחוברים
  const familyMembersBtn = document.getElementById("familyMembersBtn");
  const familyMembersList = document.getElementById("familyMembersList");

  familyMembersBtn.addEventListener("click", () => {
    if (familyMembersList.style.display === "none") {
      let html = "";
      Object.keys(users).forEach(u => {
        const session = sessionStorage.getItem("loggedUser_" + u);
        if (users[u].familyCode === familyCode && session) {
          html += `<div>👤 ${u}</div>`;
        }
      });
      if (html === "") html = "<div>אין בני משפחה מחוברים כרגע</div>";
      familyMembersList.innerHTML = html;
      familyMembersList.style.display = "block";
    } else {
      familyMembersList.style.display = "none";
    }
  });

  // סימון המשתמש הנוכחי כ”מחובר”
  sessionStorage.setItem("loggedUser_" + username, "true");

  // הודעת מערכת מהמנהל
  const systemMessage = localStorage.getItem("familyMessage_" + familyCode);
  if (systemMessage) {
    alert("📢 הודעת מערכת מהמנהלים:\n" + systemMessage);
  }
});
