require("dotenv").config();
require("colors");

const express = require("express");
const ExpressWs = require("express-ws");

const { GptService } = require("./services/gpt-service-non-streaming");
const { TextService } = require("./services/text-service");
//const welcomePrompt = require("./prompts/welcomePrompt");
const customerProfiles = require("./data/personalization");

const app = express();
ExpressWs(app);

const PORT = process.env.PORT || 3000;

async function handleDtmfInput(
  digit,
  gptService,
  textService,
  interactionCount,
  userProfile = null // Pass in the user profile
) {
  const name = userProfile?.profile?.firstName
    ? userProfile.profile.firstName
    : ""; // Get user's name if available

  const nameIntroOptions = name
    ? [
        `Sure ${name},`,
        `Okay ${name},`,
        `Alright ${name},`,
        `Got it ${name},`,
        `Certainly ${name},`,
      ]
    : ["Sure,", "Okay,", "Alright,", "Got it,", "Certainly,"];

  const randomIntro =
    nameIntroOptions[Math.floor(Math.random() * nameIntroOptions.length)];

  switch (digit) {
    case "1":
      textService.sendText(
        `${randomIntro} you want info on available apartments, let me get that for you, it will just take a few moments so hang tight.`,
        true
      ); // Run concurrently without awaiting
      await gptService.completion(
        "Please provide a listing of all available apartments, but as a summary, not a list.",
        interactionCount,
        "user",
        true // DTMF-triggered flag
      );
      break;
    case "2":
      textService.sendText(
        `${randomIntro} you want me to check on your existing appointments, gimme one sec.`,
        true
      ); // Run concurrently without awaiting
      await gptService.completion(
        "Please check all available scheduled appointments.",
        interactionCount,
        "user",
        true // DTMF-triggered flag
      );
      break;
    // Add more cases as needed for different DTMF inputs
    default:
      textService.sendText(
        `Oops! That button’s a dud. But hey, press '1' to hear about available apartments or '2' to check your scheduled appointments!`,
        true
      ); // Run concurrently without awaiting
      break;
  }
}

app.post("/incoming", (req, res) => {
  try {
    const response = `<Response>
      <Connect>
        <Voxray url="wss://${process.env.SERVER}/sockets" voice="en-US-Journey-O" dtmfDetection="true" interruptByDtmf="true" />
      </Connect>
    </Response>`;
    res.type("text/xml");
    res.end(response.toString());
  } catch (err) {
    console.log(err);
  }
});

app.ws("/sockets", (ws) => {
  try {
    ws.on("error", console.error);

    const gptService = new GptService();
    const textService = new TextService(ws);

    let interactionCount = 0;
    let awaitingUserInput = false;
    let userProfile = null;

    // Incoming from MediaStream
    ws.on("message", async function message(data) {
      const msg = JSON.parse(data);
      console.log(`[App.js] Message received: ${JSON.stringify(msg)}`);

      // Handle DTMF input and interrupt ongoing interaction
      if (msg.type === "dtmf" && msg.digit) {
        console.log("[App.js] DTMF input received, interrupting...");
        awaitingUserInput = false; // Allow new input processing
        interactionCount += 1;
        await handleDtmfInput(
          msg.digit,
          gptService,
          textService,
          interactionCount,
          userProfile
        );
        return;
      }

      if (awaitingUserInput) {
        console.log(
          "[App.js] Still awaiting user input, skipping new API call."
        );
        return;
      }

      if (msg.type === "setup") {
        // Extract the phone number from the setup message
        const phoneNumber = msg.from; // The Caller's phone number (this will only work for INBOUND calls at the moment)
        const smsSendNumber = msg.to; // Twilio's "to" number (we will use this as the 'from' number in SMS)

        // Store the numbers in gptService for future SMS calls
        gptService.setPhoneNumbers(smsSendNumber, phoneNumber);

        // Lookup the user profile from the customerProfiles object
        userProfile = customerProfiles[phoneNumber];

        // Set the user profile within GptService
        if (userProfile) {
          gptService.setUserProfile(userProfile); // Pass the profile to GptService
        }

        // Now generate a dynamic personalized greeting based on whether the user is new or returning
        const greetingText = userProfile
          ? `Generate a personalized greeting for ${userProfile.profile.firstName}, a returning customer.`
          : "Generate a warm greeting for a new user.";

        // Call the LLM to generate the greeting dynamically
        await gptService.completion(greetingText, interactionCount);

        interactionCount += 1;
      } else if (
        msg.type === "prompt" ||
        (msg.type === "interrupt" && msg.voicePrompt)
      ) {
        // Process user prompt or interrupted prompt
        awaitingUserInput = true;
        await gptService.completion(msg.voicePrompt, interactionCount);
        interactionCount += 1;
      }
    });

    gptService.on("gptreply", async (gptReply, final) => {
      textService.sendText(gptReply, final);

      if (final) {
        awaitingUserInput = false; // Reset waiting state after final response
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
