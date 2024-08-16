const OpenAI = require("openai"); // or the appropriate module import
const EventEmitter = require("events");
const availableFunctions = require("../functions/available-functions");
const tools = require("../functions/function-manifest");
let prompt = require("../prompts/prompt");
const welcomePrompt = require("../prompts/welcomePrompt");
const model = "gpt-4o";

const currentDate = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

prompt = prompt.replace("{{currentDate}}", currentDate);
function getTtsMessageForTool(toolName) {
  switch (toolName) {
    case "listAvailableApartments":
      return "Let me check on the available apartments for you.";
    case "checkExistingAppointments":
      return "I'll look up your existing appointments.";
    case "scheduleTour":
      return "I'll go ahead and schedule that tour for you.";
    case "checkAvailability":
      return "Let me verify the availability for the requested time.";
    case "commonInquiries":
      return "Let me check on that for you! Just a moment.";
    default:
      return "Give me a moment while I fetch the information.";
  }
}

class GptService extends EventEmitter {
  constructor() {
    super();
    this.openai = new OpenAI();
    this.userContext = [
      { role: "system", content: prompt },
      {
        role: "assistant",
        content: `${welcomePrompt}`,
      },
    ];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  updateUserContext(role, text) {
    this.userContext.push({ role: role, content: text });
  }

  async completion(
    text,
    interactionCount,
    role = "user",
    dtmfTriggered = false
  ) {
    if (!text || typeof text !== "string") {
      this.log(`[GptService] Invalid prompt received: ${text}`);
      return;
    }

    this.updateUserContext(role, text);

    try {
      // Streaming is disabled explicitly
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: this.userContext,
        tools: tools, // Include the tools, so the model knows what functions are available
        stream: false, // Always non-streaming
      });

      // Handle tool calls if detected
      const toolCall = response.choices[0]?.message?.tool_calls;
      if (toolCall && toolCall[0]) {
        this.log(
          `[GptService] Tool call detected: ${toolCall[0].function.name}`
        );

        const functionName = toolCall[0].function.name;
        const functionArgs = JSON.parse(toolCall[0].function.arguments);
        const functionToCall = availableFunctions[functionName];

        if (functionToCall) {
          this.log(
            `[GptService] Calling function ${functionName} with arguments: ${JSON.stringify(
              functionArgs
            )}`
          );

          if (!dtmfTriggered) {
            // Emit TTS message related to the tool call
            const ttsMessage = getTtsMessageForTool(functionName);
            this.emit("gptreply", ttsMessage, true, interactionCount); // Emit the TTS message immediately
          }

          const functionResponse = await functionToCall(functionArgs);

          let function_call_result_message;

          function_call_result_message = {
            role: "tool",
            content: JSON.stringify(functionResponse),
            tool_call_id: response.choices[0].message.tool_calls[0].id,
          };

          // Prepare the chat completion call payload with the tool result
          const completion_payload = {
            model: model,
            messages: [
              ...this.userContext,
              ...(functionName === "listAvailableApartments"
                ? [
                    {
                      role: "system",
                      content:
                        "Do not use asterisks (*) under any circumstances in this response. Summarize the available apartments in a readable format.",
                    },
                  ]
                : []),
              response.choices[0].message, // the tool_call message
              function_call_result_message, // The result of the tool call
            ],
          };

          // Call the API again to get the final response after tool processing
          const finalResponse = await this.openai.chat.completions.create({
            model: completion_payload.model,
            messages: completion_payload.messages,
            stream: false, // Always non-streaming
          });

          const finalContent = finalResponse.choices[0]?.message?.content || "";
          this.userContext.push({
            role: "assistant",
            content: finalContent,
          });

          // Emit the final response to the user
          this.emit("gptreply", finalContent, true, interactionCount);
          return; // Exit after processing the tool call
        }
      }

      // If no tool call is detected, emit the final completion response
      const finalResponse = response.choices[0]?.message?.content || "";
      if (finalResponse.trim()) {
        this.userContext.push({
          role: "assistant",
          content: finalResponse,
        });
        this.emit("gptreply", finalResponse, true, interactionCount);
      }
    } catch (error) {
      this.log(`[GptService] Error during completion: ${error.message}`);
    }
  }
}
module.exports = { GptService };
