const { validatePassword } = require("./passwordValidator");

const testCases = [
  { input: "12345678", expected: false, label: "Numeric only (12345678)" },
  { input: "password", expected: false, label: "Lowercase only (password)" },
  { input: "Password", expected: false, label: "No number/special (Password)" },
  { input: "Password123", expected: false, label: "No special character (Password123)" },
  { input: "password@123", expected: false, label: "No uppercase letter (password@123)" },
  { input: "PASSWORD@123", expected: false, label: "No lowercase letter (PASSWORD@123)" },
  { input: "Password@123", expected: true, label: "Compliant password (Password@123)" },
];

console.log("=== RUNNING PASSWORD VALIDATOR TEST SUITE ===");
let passed = 0;

for (let tc of testCases) {
  const result = validatePassword(tc.input);
  if (result.isValid === tc.expected) {
    console.log(`[PASS] ${tc.label} -> isValid: ${result.isValid}`);
    passed++;
  } else {
    console.error(`[FAIL] ${tc.label} -> Expected ${tc.expected}, got ${result.isValid} (${result.message})`);
  }
}

console.log(`Test Results: ${passed}/${testCases.length} Passed.`);
if (passed === testCases.length) {
  process.exit(0);
} else {
  process.exit(1);
}
