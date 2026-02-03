document.addEventListener("DOMContentLoaded", () => {
  const loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"));
  if (!loggedUser || loggedUser.role !== "admin") {
    alert("גישה למנהלים בלבד!");
    window.location.href = "login.html";
    return;
  }

  const username = loggedUser.username;

  // תאריך
  const currentDate = document.getElementById("currentDate");
  const today = new Date();
  currentDate.textContent = today.toLocaleDateString('he-IL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // ברוך הבא למנהל
  document.getElementById("welcomeMessage").textContent = `ברוך הבא למנהל – ${username}`;

  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const familyCode = users[username].familyCode;
  const adminContent = document.getElementById("adminContent");

  // חזרה לדף הבית
  document.getElementById("backHomeBtn").onclick = () => {
    window.location.href = "home.html";
  };

  // ---------------- ניהול משתמשים ----------------
  function renderUsersTable() {
    adminContent.innerHTML = `
      <h2>ניהול משתמשים</h2>
      <table class="users-table">
        <tr>
          <th>שם משתמש</th>
          <th>סטטוס</th>
          <th>פעולות</th>
        </tr>
        ${Object.keys(users)
          .filter(u => users[u].familyCode === familyCode && u !== username)
          .map(u => {
            const status = users[u].blocked ? "חסום" : "פעיל";
            return `
              <tr>
                <td>${u}</td>
                <td class="status">${status}</td>
                <td>
                  <button class="action-btn ${users[u].blocked ? 'unblock' : 'block'}" data-user="${u}">
                    ${users[u].blocked ? 'בטל חסימה' : 'חסום'}
                  </button>
                  <button class="action-btn change-pass" data-user="${u}">שנה סיסמה</button>
                  <button class="action-btn delete-user" data-user="${u}">🗑️ מחק משתמש</button>
                </td>
              </tr>
            `;
          }).join('')}
      </table>
    `;

    // אירועים לכפתורים
    document.querySelectorAll(".action-btn.block, .action-btn.unblock").forEach(btn => {
      btn.onclick = () => {
        const targetUser = btn.dataset.user;
        users[targetUser].blocked = !users[targetUser].blocked;
        localStorage.setItem('users', JSON.stringify(users));
        renderUsersTable(); // רענון הטבלה אחרי שינוי
      };
    });

    document.querySelectorAll(".change-pass").forEach(btn => {
      btn.onclick = () => {
        const newPass = prompt("הזן סיסמה חדשה למשתמש " + btn.dataset.user);
        if (newPass) {
          users[btn.dataset.user].password = newPass;
          localStorage.setItem('users', JSON.stringify(users));
          alert("סיסמה שונתה בהצלחה!");
        }
      };
    });

    document.querySelectorAll(".delete-user").forEach(btn => {
      btn.onclick = () => {
        if (confirm(`האם למחוק את המשתמש ${btn.dataset.user}?`)) {
          delete users[btn.dataset.user];
          localStorage.setItem('users', JSON.stringify(users));
          renderUsersTable();
        }
      };
    });
  }

  document.getElementById("manageUsersBtn").onclick = () => {
    renderUsersTable();
  };

  // ---------------- ניהול צ'אט ----------------
  document.getElementById("manageChatBtn").onclick = () => {
    const existingMessage = localStorage.getItem("familyMessage_" + familyCode) || "";
    adminContent.innerHTML = `
      <h2>שליחת הודעת מערכת</h2>
      <textarea id="systemMessage" placeholder="כתוב הודעה לבני המשפחה שלך..." rows="4">${existingMessage}</textarea>
      <div style="margin-top:10px;">
        <button id="sendMessageBtn" class="admin-btn">שלח הודעה</button>
        <button id="clearMessageBtn" class="admin-btn" style="background:#e74c3c;">מחק הודעה</button>
      </div>
    `;

    document.getElementById("sendMessageBtn").onclick = () => {
      const message = document.getElementById("systemMessage").value.trim();
      if (!message) return alert("כתוב הודעה לפני השליחה");
      localStorage.setItem("familyMessage_" + familyCode, message);
      alert("הודעת מערכת נשלחה בהצלחה!");
    };

    document.getElementById("clearMessageBtn").onclick = () => {
      if (confirm("למחוק את הודעת המערכת?")) {
        localStorage.removeItem("familyMessage_" + familyCode);
        document.getElementById("systemMessage").value = "";
        alert("הודעת המערכת נמחקה!");
      }
    };
  };

  // ---------------- שינוי תפקידים ----------------
  document.getElementById("changeRolesBtn").onclick = () => {
    adminContent.innerHTML = `
      <h2>שינוי תפקידים</h2>
      <table class="users-table">
        <tr>
          <th>שם משתמש</th>
          <th>תפקיד נוכחי</th>
          <th>פעולה</th>
        </tr>
        ${Object.keys(users)
          .filter(u => users[u].familyCode === familyCode && u !== username)
          .map(u => `
            <tr>
              <td>${u}</td>
              <td>${users[u].role}</td>
              <td>
                <button class="action-btn change-role" data-user="${u}">שנה תפקיד</button>
              </td>
            </tr>
          `).join('')}
      </table>
    `;

    document.querySelectorAll(".change-role").forEach(btn => {
      btn.onclick = () => {
        const targetUser = btn.dataset.user;
        const newRole = prompt("הזן תפקיד חדש עבור " + targetUser + " (child/guest)");
        if (newRole === "child" || newRole === "guest") {
          users[targetUser].role = newRole;
          localStorage.setItem('users', JSON.stringify(users));
          alert("תפקיד שונה בהצלחה!");
          btn.closest("tr").querySelector("td:nth-child(2)").textContent = newRole;
        } else {
          alert("תפקיד לא חוקי. יש להזין 'child' או 'guest'");
        }
      };
    });
  };
});
