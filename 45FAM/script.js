document.addEventListener("DOMContentLoaded", () => {
  // שמירת משתמשים ב-localStorage
  function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '{}');
  }

  function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  const ADMIN_SECRET = "1209";

  // אלמנטים
  const registerForm = document.getElementById('registerForm');
  const toggleFamilyBtn = document.getElementById('toggleFamily');
  const familyContainer = document.getElementById('familyContainer');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const roleSelect = document.getElementById('role');
  const adminCodeContainer = document.getElementById('adminCodeContainer');

  // הצגת/הסתר סיסמה עם אימוגי
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      if(passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePasswordBtn.textContent = "🙈";
      } else {
        passwordInput.type = "password";
        togglePasswordBtn.textContent = "👀";
      }
    });
  }

  // הצגת שדות מנהל לפי בחירת סוג משתמש
  if (roleSelect && adminCodeContainer) {
    roleSelect.addEventListener("change", () => {
      if(roleSelect.value === "admin") {
        adminCodeContainer.style.display = "block";
      } else {
        adminCodeContainer.style.display = "none";
      }
    });
  }

  // הצגת שדות יצירת משפחה
  if (toggleFamilyBtn && familyContainer) {
    toggleFamilyBtn.addEventListener("click", () => {
      familyContainer.style.display = familyContainer.style.display === 'block' ? 'none' : 'block';
    });
  }

  // פונקציה להצגת הודעות
  function showMessage(msg, type) {
    const msgDiv = document.getElementById('message');
    if (!msgDiv) return;
    msgDiv.textContent = msg;
    msgDiv.className = 'message ' + (type === 'error' ? 'error' : 'success');
  }

  // הרשמה
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = passwordInput.value.trim();
      const role = roleSelect ? roleSelect.value : "child";
      const adminCodeInput = document.getElementById('adminCode');
      const adminCode = adminCodeInput ? adminCodeInput.value.trim() : "";

      const familyNameInput = document.getElementById('familyName');
      const familyCodeInput = document.getElementById('familyCode');
      const familyName = familyNameInput ? familyNameInput.value.trim() : "";
      const familyCode = familyCodeInput ? familyCodeInput.value.trim() : "";

      if (!username || !password) {
        showMessage('אנא מלא את כל השדות', 'error');
        return;
      }

      const users = getUsers();

      // בדיקת שם משתמש
      if (users[username]) {
        showMessage('שם המשתמש כבר קיים', 'error');
        return;
      }

      // בדיקה למנהל
      if (role === 'admin' && adminCode !== ADMIN_SECRET) {
        showMessage('סיסמא למנהל שגויה!', 'error');
        return;
      }

      // בדיקה ייחודיות משפחה
      if (familyName) {
        for (let key in users) {
          if (users[key].familyName === familyName) {
            showMessage('שם המשפחה כבר קיים', 'error');
            return;
          }
        }
      }

      if (familyCode) {
        for (let key in users) {
          if (users[key].familyCode === familyCode) {
            showMessage('קוד המשפחה כבר בשימוש', 'error');
            return;
          }
        }
      }

      // יצירת משתמש חדש
      users[username] = {
        password,
        role,
        familyName: familyName || null,
        familyCode: familyCode || null
      };

      saveUsers(users);

      showMessage('✅ נרשמת בהצלחה! העברת לדף ההתחברות...', 'success');

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);

      registerForm.reset();
      if (familyContainer) familyContainer.style.display = 'none';
      if (adminCodeContainer) adminCodeContainer.style.display = 'none';
      if (togglePasswordBtn) togglePasswordBtn.textContent = "👀";
    });
  }
});
