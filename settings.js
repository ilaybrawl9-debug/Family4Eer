document.addEventListener("DOMContentLoaded", () => {
  const ADMIN_SECRET = "1209";

  const loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"));
  if (!loggedUser) {
    window.location.href = "login.html";
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const user = users[loggedUser.username];

  // תאריך
  document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString('he-IL', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

  // שם משתמש
  document.getElementById("usernameDisplay").textContent = loggedUser.username;

  // תמונת פרופיל
  const profileImage = document.getElementById("profileImage");
  if (user.profileImage) {
    profileImage.src = user.profileImage;
  }

  document.getElementById("uploadImage").addEventListener("change", e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      user.profileImage = reader.result;
      localStorage.setItem("users", JSON.stringify(users));
      profileImage.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  // שינוי סיסמה
  document.getElementById("changePasswordBtn").onclick = () => {
    const newPass = document.getElementById("newPassword").value.trim();
    if (!newPass) return show("הכנס סיסמה", "red");
    user.password = newPass;
    localStorage.setItem("users", JSON.stringify(users));
    show("סיסמה עודכנה בהצלחה", "green");
  };

  // נגישות
  document.getElementById("increaseTextBtn").onclick = () => {
    document.body.style.fontSize = "larger";
  };

  document.getElementById("resetTextBtn").onclick = () => {
    document.body.style.fontSize = "";
  };

  // שינוי תפקיד
  const roleSelect = document.getElementById("roleSelect");
  const adminSecretInput = document.getElementById("adminSecret");

  roleSelect.value = user.role;

  roleSelect.onchange = () => {
    adminSecretInput.style.display =
      roleSelect.value === "admin" ? "block" : "none";
  };

  document.getElementById("changeRoleBtn").onclick = () => {
    const newRole = roleSelect.value;

    if (newRole === "admin") {
      if (adminSecretInput.value !== ADMIN_SECRET) {
        return show("קוד מנהל שגוי", "red");
      }
    }

    user.role = newRole;
    localStorage.setItem("users", JSON.stringify(users));
    sessionStorage.setItem("loggedUser", JSON.stringify({
      username: loggedUser.username,
      role: newRole
    }));

    show("התפקיד עודכן", "green");
  };

  function show(msg, color) {
    const el = document.getElementById("message");
    el.textContent = msg;
    el.style.color = color;
  }
});
