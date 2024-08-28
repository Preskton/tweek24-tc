require("dotenv").config();
require("colors");

const express = require("express");
const ExpressWs = require("express-ws");

//const { GptService } = require("./services/gpt-service-streaming");
const { GptService } = require("./services/gpt-service-non-streaming");
const { TextService } = require("./services/text-service");
const { EndSessionService } = require("./services/end-session-service");

const availableFunctions = require("./functions/available-functions");

const { handleIncomingCall } = require('./functions/voxrayWorkflow');
handleIncomingCall('[CAR_ID]');

const app = express();
ExpressWs(app);

const PORT = process.env.PORT || 3000;

async function processUserInputForHandoff(userInput) {
  const handoffKeywords = [
    "live agent",
    "real person",
    "talk to a representative",
    "transfer me to a human",
    "speak to a person",
    "customer service",
  ];

  // Check if the input contains any of the keywords
  if (
    handoffKeywords.some((keyword) =>
      userInput.toLowerCase().includes(keyword.toLowerCase())
    )
  ) {
    console.log(`[App.js] Live agent handoff requested by user input.`);
    return true; // Signals that we should perform a handoff
  }
  return false; // No handoff needed
}

async function handleLiveAgentHandoff(
  gptService,
  endSessionService,
  textService,
  userProfile,
  userInput
) {
  const name = userProfile?.firstName
    ? userProfile.firstName
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

  const handoffMessages = [
    `${randomIntro} one moment, I'll transfer you to a live agent now.`,
    `${randomIntro} let me get a live agent to assist you. One moment please.`,
    `${randomIntro} I'll connect you with a live person right away. Just a moment.`,
    `${randomIntro} sure thing, I'll transfer you to customer service. Please hold for a moment.`,
  ];

  const randomHandoffMessage =
    handoffMessages[Math.floor(Math.random() * handoffMessages.length)];

  console.log(`[App.js] Hand off message: ${randomHandoffMessage}`);

  // Send the random handoff message to the user
  textService.sendText(randomHandoffMessage, true); // Final message before handoff

  // Add the final user input to userContext for summarization
  gptService.updateUserContext("user", userInput);

  // Add the randomHandoffMessage to the userContext
  gptService.updateUserContext("assistant", randomHandoffMessage);

  // Proceed with summarizing the conversation, including the latest messages
  const conversationSummary = await gptService.summarizeConversation();

  // End the session and include the conversation summary in the handoff data
  // Introduce a delay before ending the session
  setTimeout(() => {
    // End the session and include the conversation summary in the handoff data
    endSessionService.endSession({
      reasonCode: "live-agent-handoff",
      reason: "User requested to speak to a live agent.",
      conversationSummary: conversationSummary,
    });
  }, 1000); // 1 second delay
}

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
    //WITH WELCOME PROMPT
    // const response = `<Response>
    //   <Connect action="https://voxray-6456.twil.io/live-agent-handoff">
    //     <Voxray url="wss://${process.env.SERVER}/sockets" welcomeGreeting="${welcomePrompt}" welcomeGreetingInterruptible="false" voice="en-US-Journey-O" dtmfDetection="true" interruptByDtmf="true" />
    //   </Connect>
    // </Response>`;
    const response = `<Response>
      <Connect action="https://voxray-6456.twil.io/live-agent-handoff">
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
    const carUserId = "1-4runner";

    const gptService = new GptService();
    const endSessionService = new EndSessionService(ws);
    const textService = new TextService(ws);

    let interactionCount = 0;
    let awaitingUserInput = false;
    let userProfile = null;

    //console.log('carProfile: ', carProfile.profiles[0]);
    // Lookup the user profile from carProfile
    // Lookup the user profile from carProfile

    //console.log('userProfile: ', userProfile);

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
        console.log("[App.js] Setup message received.");
        // Extract the phone number from the setup message
        const phoneNumber = msg.from; // The Caller's phone number (this will only work for INBOUND calls at the moment)
        const smsSendNumber = msg.to; // Twilio's "to" number (we will use this as the 'from' number in SMS)

        // Store the numbers in gptService for future SMS calls
        gptService.setPhoneNumbers(smsSendNumber, phoneNumber);


        availableFunctions.lookupProfileInUnifiedProfiles(undefined, phoneNumber).then(async (userProfileRequest) => {
          userProfile = userProfileRequest;
          gptService.setUserProfile(userProfile);

          // Now generate a dynamic personalized greeting based on whether the user is new or returning
          console.log("userProfile: ", userProfile);
          const greetingText = userProfile
            ? `Generate a warm, personalized greeting for ${userProfile.given_name}, a returning Toyota Connect subscriber.' + 
         'Avoid any messaging-style elements like numbered lists, special characters, or emojis, never read out a literal emoji.' + 
         'Keep it brief, and use informal/casual language so you sound like a friend, not a call center agent. Mention the ' +
         'car that the user is driving. You can infer the details from the id in ${carUserId} it's in the format number-{carModel}.`
            : "Generate a warm greeting for a new Toyota Connect subscriber. Keep it brief, and use informal/casual language so you sound like a friend, not a call center agent." +
            "don't ever read emoji's out loud. ";

          // Call the LLM to generate the greeting dynamically, and it should be a another "system" prompt
          await gptService.completion(greetingText, interactionCount, "system");

          interactionCount += 1;
        });

      } else if (
        msg.type === "prompt" ||
        (msg.type === "interrupt" && msg.voicePrompt)
      ) {
        const shouldHandoff = await processUserInputForHandoff(msg.voicePrompt);

        if (shouldHandoff) {
          // Call handleLiveAgentHandoff without awaiting the handoff message
          handleLiveAgentHandoff(
            gptService,
            endSessionService,
            textService,
            userProfile,
            msg.voicePrompt
          );
          return; // End session here if live agent handoff is triggered
        }
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

    // Listen for the 'endSession' event emitted by gpt-service-non-streaming
    gptService.on("endSession", (handoffData) => {
      // Log the handoffData for debugging purposes
      console.log(
        `[App.js] Received endSession event: ${JSON.stringify(handoffData)}`
      );

      // Call the endSessionService to handle the session termination
      endSessionService.endSession(handoffData);
    });
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
