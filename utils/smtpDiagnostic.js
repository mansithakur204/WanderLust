const dotenv = require("dotenv");
dotenv.config();
const { verifySmtpConnection, checkEnvStatus } = require("./mailer");

async function runSmtpDiagnostic() {
  console.log("==================================================");
  console.log("       SMTP DIAGNOSTIC & VERIFICATION TOOL");
  console.log("==================================================\n");

  // 1. Check Env Presence
  const envStatus = checkEnvStatus();
  console.log("1. ENVIRONMENT VARIABLES PRESENCE:");
  console.log(`   EMAIL_HOST: ${envStatus.EMAIL_HOST}`);
  console.log(`   EMAIL_PORT: ${envStatus.EMAIL_PORT}`);
  console.log(`   EMAIL_USER: ${envStatus.EMAIL_USER}`);
  console.log(`   EMAIL_PASS: ${envStatus.EMAIL_PASS}`);
  console.log(`   EMAIL_FROM: ${envStatus.EMAIL_FROM}\n`);

  // 2. Test Connection
  console.log("2. TESTING SMTP CONNECTION VIA TRANSPORTER.VERIFY()...");
  const result = await verifySmtpConnection();

  console.log(`\n   SMTP Configuration Detected: ${result.configured ? "YES" : "NO"}`);
  console.log(`   SMTP Connection Test: ${result.connected ? "PASS" : "FAIL"}`);
  if (result.error) {
    console.log(`   SMTP Error Details: ${result.error}`);
  }
  console.log("\n==================================================\n");
}

runSmtpDiagnostic();
