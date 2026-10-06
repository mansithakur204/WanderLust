const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/user");
const { validatePassword } = require("../utils/passwordValidator");
const dotenv = require("dotenv");
dotenv.config();

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function runResetTests() {
  console.log("Starting Sprint 4.5 Forgot & Reset Password Security Tests...\n");
  let testUser;

  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB.");

    const testUsername = "reset_test_user_" + Date.now();
    const testEmail = `reset_${Date.now()}@example.com`;
    const initialPass = "Initial@123";
    const newValidPass = "NewStrong#99";
    const weakPass = "weak123";

    // 1. Create Test User
    console.log("\n[TEST 1] Creating test user with strong password...");
    testUser = new User({ email: testEmail, username: testUsername });
    await User.register(testUser, initialPass);
    console.log("✓ Test user registered successfully.");

    // 2. Generate Reset Token
    console.log("\n[TEST 2] Requesting Password Reset (Token Generation & Hashing)...");
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    testUser.resetPasswordToken = hashedToken;
    testUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await testUser.save();

    const dbUserAfterToken = await User.findById(testUser._id);
    if (dbUserAfterToken.resetPasswordToken === rawToken) {
      throw new Error("SECURITY FAILURE: Raw token was stored in database instead of hashed token!");
    }
    if (dbUserAfterToken.resetPasswordToken !== hashedToken) {
      throw new Error("Token hashing mismatch!");
    }
    console.log("✓ Token stored as SHA-256 hash in DB (Raw token NOT exposed).");

    // 3. Test Invalid Token Rejection
    console.log("\n[TEST 3] Testing Invalid / Tampered Token...");
    const fakeToken = "invalid_tampered_token_12345";
    const fakeHashed = crypto.createHash("sha256").update(fakeToken).digest("hex");
    const invalidUser = await User.findOne({
      resetPasswordToken: fakeHashed,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (invalidUser) {
      throw new Error("SECURITY FAILURE: Invalid token was accepted!");
    }
    console.log("✓ Tampered/Invalid token correctly rejected.");

    // 4. Test Expired Token Rejection
    console.log("\n[TEST 4] Testing Expired Token Rejection...");
    testUser.resetPasswordExpires = Date.now() - 1000; // Expired 1 sec ago
    await testUser.save();

    const expiredUser = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (expiredUser) {
      throw new Error("SECURITY FAILURE: Expired token was accepted!");
    }
    console.log("✓ Expired token correctly rejected.");

    // Restore token validity for reset test
    testUser.resetPasswordExpires = Date.now() + 3600000;
    await testUser.save();

    // 5. Test Weak Password Policy Enforcing
    console.log("\n[TEST 5] Enforcing Strong Password Policy on Reset...");
    const weakValidation = validatePassword(weakPass);
    if (weakValidation.isValid) {
      throw new Error("Validation failure: Weak password was allowed!");
    }
    console.log("✓ Weak password correctly blocked by passwordValidator:", weakValidation.message);

    // 6. Test Successful Password Reset & Passport Hashing
    console.log("\n[TEST 6] Performing Valid Password Reset...");
    const validValidation = validatePassword(newValidPass);
    if (!validValidation.isValid) {
      throw new Error("Valid password failed validation!");
    }

    const resetTargetUser = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    await resetTargetUser.setPassword(newValidPass);
    resetTargetUser.resetPasswordToken = undefined;
    resetTargetUser.resetPasswordExpires = undefined;
    await resetTargetUser.save();
    console.log("✓ Password updated via Passport-local-mongoose setPassword.");

    // 7. Verify Token Invalidation (Single-Use Rule)
    console.log("\n[TEST 7] Verifying Token Invalidation (Single-Use)...");
    const reusedUser = await User.findOne({ resetPasswordToken: hashedToken });
    if (reusedUser) {
      throw new Error("SECURITY FAILURE: Used reset token was not invalidated!");
    }
    console.log("✓ Token successfully cleared/invalidated after reset.");

    // 8. Test Login Authentication with New Password
    console.log("\n[TEST 8] Verifying Login with New Password...");
    const authResultNew = await User.authenticate()(testUsername, newValidPass);
    if (!authResultNew.user) {
      throw new Error("Authentication failed with new password!");
    }
    console.log("✓ Successfully authenticated with new password!");

    const authResultOld = await User.authenticate()(testUsername, initialPass);
    if (authResultOld.user) {
      throw new Error("Old password still works after reset!");
    }
    console.log("✓ Old password correctly rejected after reset!");

    console.log("\n==================================================");
    console.log("ALL SPRINT 4.5 RESET PASSWORD TESTS PASSED!");
    console.log("==================================================\n");

  } catch (err) {
    console.error("\nTEST SUITE FAILED:", err);
  } finally {
    if (testUser && testUser._id) {
      await User.deleteOne({ _id: testUser._id });
      console.log("Cleaned up test user.");
    }
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runResetTests();
