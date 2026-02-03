// script.js – Firebase version

import { getAuth, createUserWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { doc, setDoc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const auth = window.auth;
  const db = window.db;
  const ADMIN_SECRET = "1209";

  // אלמנטים
  const registerForm = document.getElementById('registerForm');
  const toggleFamilyBtn = document.getElementById('toggleFamily');
  const familyContainer = document.getElementById('familyContainer');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const roleSelect = document.getElementById('role');
  const adminCodeContainer = document.getElementById('adminCodeContainer');
  const messageDiv = document.getElementById('message');

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

  function showMessage(msg, type) {
    if (!messageDiv) return;
    messageDiv.textContent = msg;
    messageDiv.className = 'message ' + (type === 'error' ? 'error' : 'success');
  }

  // הרשמה
  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
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

      // בדיקה למנהל
      if (role === 'admin' && adminCode !== ADMIN_SECRET) {
        showMessage('סיסמא למנהל שגויה!', 'error');
        return;
      }

      const email = `${username}@familyapp.local`;

      try {
        // יצירת משתמש ב-Firebase Auth
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        // בדיקה ייחודיות משפחה (Firestore)
        if (familyCode) {
          const famRef = doc(db, "families", familyCode);
          const famSnap = await getDoc(famRef);
          if (famSnap.exists()) {
            showMessage('קוד המשפחה כבר בשימוש', 'error');
            return;
          }
        }

        if (familyName) {
          // חיפוש אם שם המשפחה כבר קיים ב-Firestore
          // אוספים את כל המסמכים
          const famRef = doc(db, "families", familyCode || "temp_"+Date.now());
          const famSnap = await getDoc(famRef);
          if (famSnap.exists()) {
            showMessage('שם המשפחה כבר קיים', 'error');
            return;
          }
        }

        // יצירת מסמך משתמש
        await setDoc(doc(db, "users", uid), {
          username,
          role,
          familyName: familyName || null,
          familyCode: familyCode || null
        });

        // אם יצירת משפחה – יוצרים מסמך ב-collections families
        if (familyCode && familyName) {
          await setDoc(doc(db, "families", familyCode), {
            familyName
          });
        }

        showMessage('✅ נרשמת בהצלחה! העברת לדף ההתחברות...', 'success');

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);

        registerForm.reset();
        if (familyContainer) familyContainer.style.display = 'none';
        if (adminCodeContainer) adminCodeContainer.style.display = 'none';
        if (togglePasswordBtn) togglePasswordBtn.textContent = "👀";

      } catch (err) {
        showMessage(err.message, 'error');
      }

    });
  }

});
