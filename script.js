import { doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

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

  // הצגת שדות משפחה
  toggleFamilyBtn.addEventListener("click", () => {
    familyContainer.style.display = familyContainer.style.display === 'block' ? 'none' : 'block';
  });

  // הצגת הודעות
  function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = 'message ' + (type === 'error' ? 'error' : 'success');
  }

  // הרשמה
  registerForm.addEventListener('submit', async (e) => {
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

    if(role === 'admin' && adminCode !== ADMIN_SECRET){
      showMessage('סיסמא למנהל שגויה!', 'error');
      return;
    }

    // בדיקה אם שם משתמש קיים ב-Firestore
    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);
    if(userSnap.exists()){
      showMessage('שם המשתמש כבר קיים', 'error');
      return;
    }

    // בדיקה ייחודיות משפחה
    if(familyName){
      const familiesSnap = await getDocs(collection(db, "users"));
      const nameExists = familiesSnap.docs.some(doc => doc.data().familyName === familyName);
      if(nameExists){
        showMessage('שם המשפחה כבר קיים', 'error');
        return;
      }
    }

    if(familyCode){
      const familiesSnap = await getDocs(collection(db, "users"));
      const codeExists = familiesSnap.docs.some(doc => doc.data().familyCode === familyCode);
      if(codeExists){
        showMessage('קוד המשפחה כבר בשימוש', 'error');
        return;
      }
    }

    // שמירת המשתמש ב-Firebase
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
;

