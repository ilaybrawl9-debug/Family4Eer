// login.js (Firebase version, מעודכן)
import { signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { doc, getDoc, updateDoc } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const auth = window.auth;
  const db = window.db;

  const loginForm = document.getElementById("loginForm");
  const messageDiv = document.getElementById("message");

  function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = "message " + (type === "error" ? "error" : "success");
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      showMessage("אנא מלא את כל השדות", "error");
      return;
    }

    // ב-Firebase אין משתמשים עם שם בלבד, נייצר אימייל וירטואלי
    const email = `${username}@familyapp.local`;

    try {
      // התחברות
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      showMessage("התחברת בהצלחה ✅", "success");

      // שליפת נתוני המשתמש מ-Firestore
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        showMessage("משתמש לא נמצא במערכת", "error");
        return;
      }

      const userData = userSnap.data();

      setupFamilySection(uid, userData);

    } catch (err) {
      console.error(err);
      showMessage("שם משתמש או סיסמה שגויים", "error");
    }
  });

  async function setupFamilySection(uid, userData) {
    const familySection = document.getElementById("familySection");
    const alreadyInFamily = document.getElementById("alreadyInFamily");
    const joinFamilyForm = document.getElementById("joinFamilyForm");
    const familyNameText = document.getElementById("familyNameText");
    const familyCodeText = document.getElementById("familyCodeText");
    const joinBtn = document.getElementById("joinFamilyBtn");

    familySection.style.display = "block";

    // אם המשתמש כבר שייך למשפחה
    if (userData.familyCode) {
      alreadyInFamily.style.display = "block";
      joinFamilyForm.style.display = "none";

      familyNameText.textContent = userData.familyName;
      familyCodeText.textContent = userData.familyCode;

      setTimeout(() => {
        window.location.href = userData.role === "admin" ? "admin.html" : "home.html";
      }, 1000);

      return;
    }

    // אם אין משפחה – אפשר להצטרף
    alreadyInFamily.style.display = "none";
    joinFamilyForm.style.display = "block";

    joinBtn.onclick = async () => {
      const code = document.getElementById("joinFamilyCode").value.trim();
      if (!code) {
        showMessage("יש להזין קוד משפחה", "error");
        return;
      }

      // חיפוש משפחה לפי הקוד
      const familyRef = doc(db, "families", code);
      const familySnap = await getDoc(familyRef);

      if (!familySnap.exists()) {
        showMessage("❌ קוד משפחה שגוי", "error");
        return;
      }

      const familyData = familySnap.data();

      // עדכון המשתמש עם קוד המשפחה
      await updateDoc(doc(db, "users", uid), {
        familyCode: code,
        familyName: familyData.familyName
      });

      showMessage("✅ הצטרפת למשפחה בהצלחה", "success");

      familyNameText.textContent = familyData.familyName;
      familyCodeText.textContent = code;
      alreadyInFamily.style.display = "block";
      joinFamilyForm.style.display = "none";

      setTimeout(() => {
        window.location.href = userData.role === "admin" ? "admin.html" : "home.html";
      }, 1200);
    };
  }

});

