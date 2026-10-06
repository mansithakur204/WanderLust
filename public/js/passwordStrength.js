document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const strengthContainer = document.getElementById("strengthContainer");
  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");
  const matchText = document.getElementById("matchText");

  const reqLength = document.getElementById("req-length");
  const reqUpper = document.getElementById("req-upper");
  const reqLower = document.getElementById("req-lower");
  const reqNumber = document.getElementById("req-number");
  const reqSpecial = document.getElementById("req-special");

  if (!passwordInput) return;

  function updateChecklist(val) {
    const isLength = val.length >= 8;
    const isUpper = /[A-Z]/.test(val);
    const isLower = /[a-z]/.test(val);
    const isNumber = /[0-9]/.test(val);
    const isSpecial = /[!@#$%^&*(),.?":{}|<>\-_=+\\|[\]~`]/.test(val);

    toggleReq(reqLength, isLength);
    toggleReq(reqUpper, isUpper);
    toggleReq(reqLower, isLower);
    toggleReq(reqNumber, isNumber);
    toggleReq(reqSpecial, isSpecial);

    let score = 0;
    if (isLength) score++;
    if (isUpper) score++;
    if (isLower) score++;
    if (isNumber) score++;
    if (isSpecial) score++;

    if (val.length === 0) {
      const passwordFeedback = document.getElementById("passwordFeedback");
      if (passwordFeedback) passwordFeedback.classList.add("d-none");
      if (strengthContainer) strengthContainer.classList.add("d-none");
      if (strengthBar) strengthBar.style.width = "0%";
      if (strengthText) strengthText.textContent = "";
      return;
    }

    const passwordFeedback = document.getElementById("passwordFeedback");
    if (passwordFeedback) passwordFeedback.classList.remove("d-none");
    if (strengthContainer) strengthContainer.classList.remove("d-none");

    if (!strengthBar || !strengthText) return;

    if (score <= 2) {
      strengthBar.style.width = "33%";
      strengthBar.className = "progress-bar bg-danger";
      strengthText.textContent = "Weak";
      strengthText.className = "small text-danger fw-bold";
    } else if (score === 3 || score === 4) {
      strengthBar.style.width = "66%";
      strengthBar.className = "progress-bar bg-warning";
      strengthText.textContent = "Medium";
      strengthText.className = "small text-warning fw-bold";
    } else {
      strengthBar.style.width = "100%";
      strengthBar.className = "progress-bar bg-success";
      strengthText.textContent = "Strong";
      strengthText.className = "small text-success fw-bold";
    }
  }

  function toggleReq(el, isValid) {
    if (!el) return;
    const icon = el.querySelector("i");
    if (isValid) {
      el.classList.remove("text-muted");
      el.classList.add("text-dark", "fw-medium");
      if (icon) icon.className = "fa-solid fa-check text-success me-1";
    } else {
      el.classList.remove("text-dark", "fw-medium");
      el.classList.add("text-muted");
      if (icon) icon.className = "fa-regular fa-circle me-1 small opacity-50";
    }
  }

  function checkMatch() {
    if (!confirmInput || !matchText) return;
    const pass = passwordInput.value;
    const confirm = confirmInput.value;

    if (confirm.length === 0) {
      matchText.textContent = "";
      return;
    }

    if (pass === confirm) {
      matchText.textContent = "✓ Passwords match";
      matchText.className = "form-text text-success fw-semibold small mt-1";
    } else {
      matchText.textContent = "✕ Passwords do not match";
      matchText.className = "form-text text-danger fw-semibold small mt-1";
    }
  }

  passwordInput.addEventListener("input", (e) => {
    updateChecklist(e.target.value);
    checkMatch();
  });

  if (confirmInput) {
    confirmInput.addEventListener("input", checkMatch);
  }
});

