// ====== זיהוי משתמש ======
const currentUser = JSON.parse(sessionStorage.getItem("loggedUser"));
if (!currentUser) {
  window.location.href = "login.html";
}

// ====== אלמנטים ======
const chatContainer = document.getElementById("chatContainer");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendMessageBtn");
const systemNotice = document.getElementById("systemNotice");
const adminControls = document.getElementById("adminControls");
const resetChatBtn = document.getElementById("resetChatBtn");
const muteUserBtn = document.getElementById("muteUserBtn");
const warnUserBtn = document.getElementById("warnUserBtn");

// ====== נתונים ======
let messages = JSON.parse(localStorage.getItem("familyChat")) || [];
let mutedUsers = JSON.parse(localStorage.getItem("mutedUsers")) || [];
let warnings = JSON.parse(localStorage.getItem("userWarnings")) || [];

// ====== הרשאות מנהל ======
if (currentUser.role === "admin") {
  adminControls.style.display = "flex";
}

// ====== בדיקת השתקה ======
function isMuted(username) {
  return mutedUsers.includes(username);
}

// ====== הצגת הודעות ======
function renderMessages() {
  messages = JSON.parse(localStorage.getItem("familyChat")) || [];
  warnings = JSON.parse(localStorage.getItem("userWarnings")) || [];

  chatContainer.innerHTML = "";

  messages.forEach(msg => {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message");
    if (msg.username === currentUser.username) msgDiv.classList.add("me");

    let warningHTML = warnings[msg.username] ? `⚠️ ${warnings[msg.username]}` : "";
    if (currentUser.role === "admin" && warnings[msg.username]) {
      warningHTML += ` <button class="remove-warning-btn" data-user="${msg.username}">❌</button>`;
    }

    msgDiv.innerHTML = `
      <div class="avatar"><img src="${msg.avatar || 'default-avatar.png'}"></div>
      <div class="message-content">
        <div class="username">${msg.username} ${warningHTML}</div>
        <div class="text">${msg.text}</div>
      </div>
    `;

    chatContainer.appendChild(msgDiv);
  });

  // הוספת אירועים להסרת אזהרות
  document.querySelectorAll(".remove-warning-btn").forEach(btn => {
    btn.onclick = () => {
      const user = btn.dataset.user;
      delete warnings[user];
      localStorage.setItem("userWarnings", JSON.stringify(warnings));
      renderMessages();
    };
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ====== שליחת הודעה ======
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  if (isMuted(currentUser.username)) {
    showSystemNotice("⛔ אתה מושתק ואינך יכול לכתוב");
    return;
  }

  const newMessage = {
    username: currentUser.username,
    text,
    avatar: currentUser.avatar || "",
    time: Date.now()
  };

  messages.push(newMessage);
  localStorage.setItem("familyChat", JSON.stringify(messages));
  messageInput.value = "";
  renderMessages();
}

// ====== הודעת מערכת ======
function showSystemNotice(text) {
  systemNotice.innerText = text;
  systemNotice.style.display = "block";
  setTimeout(() => { systemNotice.style.display = "none"; }, 3000);
}

// ====== כפתורי מנהל ======
muteUserBtn.onclick = () => {
  const user = prompt("הכנס שם משתמש להשתקה/שיחרור:");
  if (!user || !messages.find(m => m.username === user)) return alert("משתמש לא קיים");
  if (mutedUsers.includes(user)) {
    mutedUsers = mutedUsers.filter(u => u !== user);
    alert(`${user} מותר לכתוב שוב`);
  } else {
    mutedUsers.push(user);
    alert(`${user} מושתק`);
  }
  localStorage.setItem("mutedUsers", JSON.stringify(mutedUsers));
};

warnUserBtn.onclick = () => {
  const user = prompt("הכנס שם משתמש לקבלת אזהרה:");
  if (!user || !messages.find(m => m.username === user)) return alert("משתמש לא קיים");
  const text = prompt("כתוב את האזהרה:");
  if (!text) return;
  warnings[user] = text;
  localStorage.setItem("userWarnings", JSON.stringify(warnings));
  renderMessages();
};

resetChatBtn.onclick = () => {
  if (!confirm("למחוק את כל ההודעות?")) return;
  messages = [];
  localStorage.removeItem("familyChat");
  renderMessages();
};

// ====== טעינה ראשונית ======
renderMessages();

// ====== עדכון בזמן אמת ======
setInterval(() => {
  renderMessages();
}, 500); // כל חצי שנייה
