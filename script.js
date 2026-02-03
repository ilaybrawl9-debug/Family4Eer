// ====== Firebase imports ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ====== Firebase config ======
const firebaseConfig = {
  apiKey: "AIzaSyChsibo5Ga9f5U0Xkyhalrtuq1AAfjBdqE",
  authDomain: "familyapp-daa98.firebaseapp.com",
  projectId: "familyapp-daa98",
  storageBucket: "familyapp-daa98.firebasestorage.app",
  messagingSenderId: "444731850132",
  appId: "1:444731850132:web:d994154e5d17c5e4032381",
  measurementId: "G-KNQP6WXVEY"
};

// ====== Initialize Firebase ======
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ====== אלמנטים ======
const registerForm = document.getElementById('registerForm');
const toggleFamilyBtn = document.getElementById('toggleFamily');
const familyContainer = document.getElementById('familyContainer');
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const roleSelect = document.getElementById('role');
const adminCodeContainer = document.getElementById('adminCodeContainer');
const messageDiv = document.getElementById('message');

const ADMIN_SECRET = "1209";

// ====== הצגת/הסתר סיסמה ======
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

// ====== הצגת שדות מנהל לפי בחירת סוג משתמש ======
if (roleSelect && adminCodeContainer) {
  roleSelect.addEventListener("change", () => {
    adminCodeContainer.style.display = roleSelect.value === "admin" ? "block" : "none";
  });
}

// ====== הצגת שדות יצירת משפחה ======
if (toggleFamilyBtn && familyContainer) {
  toggleFamilyBtn.addEventListener("click", () => {
    familyContainer.style.display = familyContainer.style.display === 'block' ? 'none' : 'block';
  });
}

// ====== פונקציה להצגת הודעות ======
function showMessage(msg, type) {
  messageDiv.textContent = msg;
  messageDiv.className = 'message ' + (type === 'error' ? 'error' : 'success');
}

// ====== הרשמה ======
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

  // בדיקה למנהל
  if (role === 'admin' && adminCode !== ADMIN_SECRET) {
    showMessage('סיסמא למנהל שגויה!', 'error');
    return;
  }

  // ====== בדיקת שם משתמש ב-Firebase ======
  const userDoc = await getDoc(doc(db, "users", username));
  if (userDoc.exists()) {
    showMessage('שם המשתמש כבר קיים', 'error');
    return;
  }

  // ====== בדיקה ייחודיות משפחה ======
  if (familyName || familyCode) {
    const usersSnap = await getDocs(collection(db, "users"));
    let duplicateFamily = false;
    usersSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (familyName && data.familyName === familyName) duplicateFamily = true;
      if (familyCode && data.familyCode === familyCode) duplicateFamily = true;
    });
    if (duplicateFamily) {
      showMessage('שם או קוד המשפחה כבר בשימוש', 'error');
      return;
    }
  }

  // ====== יצירת משתמש ב-Firebase ======
  await setDoc(doc(db, "users", username), {
    password,
    role,
    familyName: familyName || null,
    familyCode: familyCode || null
  });

  showMessage('✅ נרשמת בהצלחה! העברת לדף ההתחברות...', 'success');
  setTimeout(() => { window.location.href = 'login.html'; }, 1500);

  registerForm.reset();
  familyContainer.style.display = 'none';
  adminCodeContainer.style.display = 'none';
  togglePasswordBtn.textContent = "👀";
});

