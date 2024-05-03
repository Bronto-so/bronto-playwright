const { expect } = require("@playwright/test");
const { createClient } = require("@supabase/supabase-js");
const { decode } = require("base64-arraybuffer");
const dotenv = require("dotenv");
const fs = require("fs").promises;

const URL = "https://yyatvrltxplpauuisszy.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5YXR2cmx0eHBscGF1dWlzc3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI1OTcxNTIsImV4cCI6MjAyODE3MzE1Mn0.un4vrwhUctXBzsyHK4VCHpyqroU4i4Imz-HplO_2X-I";
dotenv.config();

async function bronto(name, page, testInfo) {
  // Create client
  const supabase = createClient(URL, ANON_KEY);

  const email = process.env.BRONTO_USERNAME;
  if (!email) {
    throw "No BRONTO_USERNAME env variable found. Please provide the environment variable BRONTO_USERNAME either via .env or pass it in the test run.";
  }

  const password = process.env.BRONTO_PASSWORD;
  if (!password) {
    throw "No BRONTO_PASSWORD env variable found. Please provide the environment variable BRONTO_PASSWORD either via .env or pass it in the test run.";
  }

  // Authenticate user
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    throw `Bronto authentication error: ${authError}`;
  }

  const user = authData.user || { id: 0 };

  // Get test
  const { data: testData, error: testError } = await supabase
    .from("tests")
    .select()
    .match({ name })
    .single();

  if (testError) {
    console.log(testError);
    throw `Bronto: could not get test ${testError.message}`;
  }

  const testId = testData.id;

  // Take screenshot
  const fileName = `bronto-screenshot-${Date.now()}.png`;
  const filePath = `./screenshots/${fileName}`;
  const buffer = await page.screenshot({
    path: filePath,
  });

  // Upload screenshot
  const { data: uploadFileData, error: uploadFileError } =
    await supabase.storage
      .from("test_files")
      .upload(
        `users/${user.id}/${Date.now()}_${fileName}`,
        decode(buffer.toString("base64")),
        { contentType: "image/png" }
      );

  // Delete screenshot
  await fs.unlink(filePath);

  // Create run
  const { data: runAddData, error: createRunAddError } = await supabase
    .from("runs")
    .insert({
      trigger: "instant",
      test_id: testId,
      status: "running",
      group_id: `${testInfo.title}-${Date.now()}`,
      image_url: uploadFileData.fullPath,
    })
    .select()
    .single();

  if (!runAddData) {
    throw "Fatal error - No run data returned after creation. 💀 Please file a Github issue. This shouldn't happen.";
  }

  // Invoke test
  const { data: testInvokeData, error: testInvokeError } =
    await supabase.functions.invoke("test", {
      body: {
        id: runAddData.id,
      },
    });

  // Get test run
  const { data: runData, error: runError } = await supabase
    .from("runs")
    .select()
    .match({ id: runAddData.id })
    .single();

  if (!runData) {
    throw "Fatal error - No run data found. 💀 Please file a Github issue. This shouldn't happen.";
  }

  const message =
    runData.status === "success"
      ? `${runData.test_snapshot.name} was successful! ✨ Message: ${runData.message}`
      : `${runData.test_snapshot.name} failed. 💀 Message: ${runData.message}`;

  expect(runData.status, message).toBe("success");
}

module.exports = bronto;
