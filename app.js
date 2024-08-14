require("dotenv").config();
require("colors");

const express = require("express");
const ExpressWs = require("express-ws");

const { GptService } = require("./services/gpt-service");
const { TextService } = require("./services/text-service");
const welcomePrompt = require("./prompts/welcomePrompt");

const app = express();
ExpressWs(app);

const PORT = process.env.PORT || 3000;

app.post("/incoming", (req, res) => {
  try {
    const response = `<Response>
      <Connect>
        <Voxray url="wss://${process.env.SERVER}/sockets" welcomeGreeting="${welcomePrompt}" voice="en-US-Journey-O"/>
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

    gptService.on("gptreply", async (gptReply, final, icount) => {
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
