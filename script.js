import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const ADMIN_SECRET = "1209";

  const registerForm = document.getElementById('registerForm');
  const toggleFamilyBtn = document.getElementById('toggleFamily');
  const familyContainer = document.getElementById('familyContainer');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const roleSelect = document.getElementById('role');
  const adminCodeContainer = document.getElementById('adminCodeContainer');
  const db = window.db;

  // הצגת/הסתר סיסמה
  togglePasswordBtn.addEventListener("click", () => {
    if(passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePasswordBtn.textContent = "🙈";
    } else {
      passwordInput.type = "password";
      togglePasswordBtn.textContent = "👀";
    }
  });

  // הצגת שדות מנהל
  roleSelect.addEventListener("change", () => {
    adminCodeContainer.style.display = roleSelect.value === "admin" ? "block" : "none";
  });

  // הצגת שדות יצירת משפחה
  toggleFamilyBtn.addEventListener("click", () => {
    familyContainer.style.display = familyContainer.style.display === 'block' ? 'none' : 'block';
  });

  function showMessage(msg, type) {
    const msgDiv = document.getElementById('message');
    msgDiv.textContent = msg;
    msgDiv.className = 'message ' + (type === 'error' ? 'error' : 'success');
  }

  registerForm.addEventListener('submit', async e => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value.trim();
    const role = roleSelect.value;
    const adminCode = document.getElementById('adminCode').value.trim();

    const familyName = document.getElementById('familyName').value.trim();
    const familyCode = document.getElementById('familyCode').value.trim();

    if (!username || !password) {
      showMessage('אנא מלא את כל השדות', 'error');
      return;
    }

    // בדיקה למנהל
    if (role === 'admin' && adminCode !== ADMIN_SECRET) {
      showMessage('סיסמא למנהל שגויה!', 'error');
      return;
    }

    // בדיקה אם שם המשתמש קיים
    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      showMessage('שם המשתמש כבר קיים', 'error');
      return;
    }

    // בדיקה ייחודיות משפחה
    if (familyCode) {
      const familyRef = doc(db, "families", familyCode);
      const familySnap = await getDoc(familyRef);
      if (familySnap.exists()) {
        showMessage('קוד המשפחה כבר בשימוש', 'error');
        return;
      }
    }

    if (familyName && familyCode) {
      await setDoc(doc(db, "families", familyCode), { familyName });
    }

    // יצירת משתמש
    await setDoc(userRef, {
      password,
      role,
      familyName: familyName || null,
      familyCode: familyCode || null
    });

    showMessage('✅ נרשמת בהצלחה! העברת לדף ההתחברות...', 'success');

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);

    registerForm.reset();
    familyContainer.style.display = 'none';
    adminCodeContainer.style.display = 'none';
    togglePasswordBtn.textContent = "👀";
  });
});


