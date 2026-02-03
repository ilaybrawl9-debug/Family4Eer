document.addEventListener("DOMContentLoaded", () => {

  function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '{}');
  }

  function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  function showMessage(msg, type) {
    const msgDiv = document.getElementById('message');
    if (!msgDiv) return;
    msgDiv.textContent = msg;
    msgDiv.className = 'message ' + (type === 'error' ? 'error' : 'success');
  }

  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
      showMessage('אנא מלא את כל השדות', 'error');
      return;
    }

    const users = getUsers();

    if (!users[username] || users[username].password !== password) {
      showMessage('שם משתמש או סיסמה שגויים', 'error');
      return;
    }

    // שמירת המשתמש המחובר
    sessionStorage.setItem(
      'loggedUser',
      JSON.stringify({ username, role: users[username].role })
    );

    // עכשיו מציגים את ה־familySection במקום לעבור מיד
    setupFamilySection(username, users);
  });

  function setupFamilySection(username, users) {
    const familySection = document.getElementById("familySection");
    const alreadyInFamily = document.getElementById("alreadyInFamily");
    const joinFamilyForm = document.getElementById("joinFamilyForm");
    const familyNameText = document.getElementById("familyNameText");
    const familyCodeText = document.getElementById("familyCodeText");
    const joinBtn = document.getElementById("joinFamilyBtn");

    if (!familySection) return;
    familySection.style.display = "block";

    const user = users[username];

    // אם כבר יש משפחה
    if (user.familyCode) {
      alreadyInFamily.style.display = "block";
      joinFamilyForm.style.display = "none";

      familyNameText.textContent = user.familyName;
      familyCodeText.textContent = user.familyCode;

      // מעבר לדף הבית אחרי 1 שניה
      setTimeout(() => {
        const role = user.role;
        window.location.href = role === 'admin' ? 'admin.html' : 'home.html';
      }, 1000);

      return;
    }

    // אם אין משפחה – מאפשרים להצטרף
    alreadyInFamily.style.display = "none";
    joinFamilyForm.style.display = "block";

    joinBtn.onclick = () => {
      const code = document.getElementById("joinFamilyCode").value.trim();
      if (!code) {
        showMessage("יש להזין קוד משפחה", "error");
        return;
      }

      const familyOwner = Object.values(users).find(
        u => u.familyCode === code
      );

      if (!familyOwner) {
        showMessage("❌ קוד משפחה שגוי", "error");
        return;
      }

 


      // צירוף המשתמש למשפחה
      user.familyCode = familyOwner.familyCode;
      user.familyName = familyOwner.familyName;
      saveUsers(users);

      showMessage("✅ הצטרפת למשפחה בהצלחה", "success");

      alreadyInFamily.style.display = "block";
      joinFamilyForm.style.display = "none";
      familyNameText.textContent = familyOwner.familyName;
      familyCodeText.textContent = familyOwner.familyCode;

      // מעבר לדף הבית אחרי 1.2 שניות
      setTimeout(() => {
        const role = user.role;
        window.location.href = role === 'admin' ? 'admin.html' : 'home.html';
      }, 1200);
    };
  }

});
