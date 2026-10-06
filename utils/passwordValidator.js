/**
 * Reusable password strength validator
 * Enforces:
 * - Min 8 characters
 * - Min 1 uppercase letter
 * - Min 1 lowercase letter
 * - Min 1 number
 * - Min 1 special character
 */
function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { isValid: false, message: "Password is required." };
  }

  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long." };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least 1 uppercase letter." };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least 1 lowercase letter." };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least 1 number." };
  }

  if (!/[!@#$%^&*(),.?":{}|<>\-_=+\\|[\]~`]/.test(password)) {
    return { isValid: false, message: "Password must contain at least 1 special character (e.g. @, #, $, !)." };
  }

  return { isValid: true };
}

module.exports = { validatePassword };
