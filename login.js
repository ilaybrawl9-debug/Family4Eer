// Firebase כבר מוגדר ב-login.html
const firebaseConfig = {
  apiKey: "AIzaSyChsibo5Ga9f5U0Xkyhalrtuq1AAfjBdqE",
  authDomain: "familyapp-daa98.firebaseapp.com",
  projectId: "familyapp-daa98",
  storageBucket: "familyapp-daa98.firebasestorage.app",
  messagingSenderId: "444731850132",
  appId: "1:444731850132:web:d994154e5d17c5e4032381",
  measurementId: "G-KNQP6WXVEY"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const emailInputLogin = document.getElementById("email");
const passwordInputLogin = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const messageLogin = document.getElementById("message");

loginBtn.addEventListener("click", async () => {
  const email = emailInputLogin.value.trim();
  const password = passwordInputLogin.value.trim();

  messageLogin.style.color = "red";

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return messageLogin.textContent = "משתמש לא קיים";

    const userData = userDoc.data();

    if (userData.isAdmin) {
      window.location.href = "admin.html";
    } else if (userData.familyCode) {
      window.location.href = "home.html";
    } else {
      const code = prompt("הכנס קוד משפחה כדי להצטרף למשפחה:");
      if (code === userData.familyCode) {
        window.location.href = "home.html";
      } else {
        messageLogin.textContent = "קוד משפחה לא נכון";
      }
    }
  } catch (error) {
    messageLogin.textContent = error.message;
  }
});

