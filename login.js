import { getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const db = window.db;

  const loginForm = document.getElementById("loginForm");
  const messageDiv = document.getElementById("message");

  const familySection = document.getElementById("familySection");
  const alreadyInFamily = document.getElementById("alreadyInFamily");
  const joinFamilyForm = document.getElementById("joinFamilyForm");
  const familyNameText = document.getElementById("familyNameText");
  const familyCodeText = document.getElementById("familyCodeText");
  const joinBtn = document.getElementById("joinFamilyBtn");

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

    try {
      // שליפת המשתמש מ-Firestore
      const userRef = doc(db, "users", username);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        showMessage("משתמש לא נמצא במערכת", "error");
        return;
      }

      const userData = userSnap.data();

      // בדיקת סיסמה
      if (userData.password !== password) {
        showMessage("סיסמה שגויה", "error");
        return;
      }

      showMessage("✅ התחברת בהצלחה!", "success");

      // שמירת המשתמש ב-sessionStorage לצורך שימוש ב-home/chat
      sessionStorage.setItem("loggedUser", JSON.stringify({
        username,
        role: userData.role,
        familyCode: userData.familyCode || null,
        familyName: userData.familyName || null
      }));

      setupFamilySection(userData);

    } catch (err) {
      console.error(err);
      showMessage("אירעה שגיאה בכניסה", "error");
    }
  });

  function setupFamilySection(userData) {
    familySection.style.display = "block";

    // אם כבר יש משפחה
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

    // אין משפחה – אפשר להצטרף
    alreadyInFamily.style.display = "none";
    joinFamilyForm.style.display = "block";

    joinBtn.onclick = async () => {
      const code = document.getElementById("joinFamilyCode").value.trim();
      if (!code) {
        showMessage("יש להזין קוד משפחה", "error");
        return;
      }

      const familyRef = doc(db, "users", code); // כאן נבדוק את המשפחה לפי קוד
      const familySnap = await getDoc(familyRef);

      if (!familySnap.exists()) {
        showMessage("❌ קוד משפחה שגוי", "error");
        return;
      }

      const familyData = familySnap.data();

      // עדכון המשתמש עם קוד המשפחה והשם שלה
      await updateDoc(doc(db, "users", userData.username), {
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

