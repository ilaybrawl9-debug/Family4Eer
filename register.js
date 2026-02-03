// Firebase שלך
const firebaseConfig = {
  apiKey: "AIzaSyChsibo5Ga9f5U0Xkyhalrtuq1AAfjBdqE",
  authDomain: "familyapp-daa98.firebaseapp.com",
  projectId: "familyapp-daa98",
  storageBucket: "familyapp-daa98.firebasestorage.app",
  messagingSenderId: "444731850132",
  appId: "1:444731850132:web:d994154e5d17c5e4032381",
  measurementId: "G-KNQP6WXVEY"
};

// אתחול Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// אלמנטים מהדף
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const familyCodeInput = document.getElementById("familyCode");
const isAdminCheckbox = document.getElementById("isAdmin");
const adminCodeInput = document.getElementById("adminCode");
const registerBtn = document.getElementById("registerBtn");
const message = document.getElementById("message");

// הצגת שדה קוד מנהל אם נבחר
isAdminCheckbox.addEventListener("change", () => {
  adminCodeInput.style.display = isAdminCheckbox.checked ? "block" : "none";
});

// פונקציית הרשמה
registerBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const familyCode = familyCodeInput.value.trim();
  const isAdmin = isAdminCheckbox.checked;
  const adminCode = adminCodeInput.value.trim();

  message.style.color = "red";

  if (!email.includes("@")) return message.textContent = "אימייל לא תקין";
  if (password.length < 6) return message.textContent = "סיסמה קצרה מדי";
  if (isAdmin && adminCode !== "1234") return message.textContent = "קוד מנהל לא נכון"; // שנה לפי הצורך

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;

    await db.collection("users").doc(uid).set({
      email,
      familyCode,
      isAdmin
    });

    message.style.color = "green";
    message.textContent = "נרשמת בהצלחה!";
    setTimeout(() => window.location.href = "login.html", 1500);
  } catch (error) {
    message.textContent = error.message;
  }
});
