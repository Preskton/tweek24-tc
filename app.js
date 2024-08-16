require("dotenv").config();
require("colors");

const express = require("express");
const ExpressWs = require("express-ws");

const { GptService } = require("./services/gpt-service-non-streaming");
const { TextService } = require("./services/text-service");
const welcomePrompt = require("./prompts/welcomePrompt");

const app = express();
ExpressWs(app);

const PORT = process.env.PORT || 3000;

async function handleDtmfInput(
  digit,
  gptService,
  textService,
  interactionCount
) {
  switch (digit) {
    case "1":
      await textService.sendText(
        "You want info on available apartments, got it. One second while I get that for you.",
        true
      );
      await gptService.completion(
        "Please list all available apartments.",
        interactionCount,
        "user",
        true // DTMF-triggered flag
      );
      break;
    case "2":
      await textService.sendText(
        "You want me to check on your existing appointments, got it. Gimme one sec.",
        true
      );
      await gptService.completion(
        "Please check all available scheduled appointments.",
        interactionCount,
        "user",
        true // DTMF-triggered flag
      );
      break;
    // Add more cases as needed for different DTMF inputs
    default:
      await textService.sendText(
        `Oops! That button’s a dud. But hey, press '1' to hear about available apartments or '2' to check your scheduled appointments!`,
        true
      );
      break;
  }
}

app.post("/incoming", (req, res) => {
  try {
    const response = `<Response>
      <Connect>
        <Voxray url="wss://${process.env.SERVER}/sockets" welcomeGreeting="${welcomePrompt}" voice="en-US-Journey-O" dtmfDetection="true" interruptByDtmf="true" />
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

    // Incoming from MediaStream
    ws.on("message", async function message(data) {
      const msg = JSON.parse(data);
      console.log(`[App.js] Message received: ${JSON.stringify(msg)}`);

      // Handle DTMF input and interrupt ongoing interaction
      if (msg.type === "dtmf" && msg.digit) {
        console.log("[App.js] DTMF input received, interrupting...");
        awaitingUserInput = false; // Allow new input processing
        await handleDtmfInput(msg.digit, gptService, textService);
        return;
      }

      if (awaitingUserInput) {
        console.log(
          "[App.js] Still awaiting user input, skipping new API call."
        );
        return;
      }

      if (msg.type === "setup") {
        // Handle setup message if needed
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
