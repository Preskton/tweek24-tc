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

    let completeResponse = "";
    let detectedTool = null;
    let toolCallDetected = false; // Boolean to track tool call detection

    try {
      // Streaming is enabled
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: this.userContext,
        tools: tools,
        stream: true, // Always streaming
      });

      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || "";
        completeResponse += content;

        // Check if a tool call is detected
        const toolCall = chunk.choices[0]?.delta?.tool_calls;
        if ((toolCall && toolCall[0]) || toolCallDetected) {
          toolCallDetected = true; // Set the boolean to true
          this.log(
            `[GptService] Tool call detected: ${toolCall[0].function.name}`
          );

          if (!dtmfTriggered) {
            const ttsMessage = getTtsMessageForTool(toolCall[0].function.name);
            this.emit("gptreply", ttsMessage, true, interactionCount); // TTS message only
          }
        }

        // Handle regular streaming if no tool call is detected
        if (!toolCallDetected) {
          this.emit("gptreply", content, false, interactionCount);
        }

        // Check if the current chunk is the last one in the stream
        if (chunk.choices[0].finish_reason === "stop") {
          if (!toolCallDetected) {
            //only process here if the tool call wasn't detected
            // No tool call, push the final response
            this.userContext.push({
              role: "assistant",
              content: completeResponse,
            });
            this.emit("gptreply", completeResponse, true, interactionCount);
            this.log(
              `[GptService] Final GPT -> user context length: ${this.userContext.length}`
            );
            break; // Exit the loop since the response is complete
          } else {
            detectedTool = chunk.choices[0]?.delta?.tool_calls;
          }
        }
        // If we detected a tool call, process it now
        if (toolCallDetected) {
          const functionName = detectedTool.function.name;
          const functionArgs = JSON.parse(detectedTool.function.arguments);
          const functionToCall = availableFunctions[functionName];

          this.log(
            `[GptService] Calling function ${functionName} with arguments: ${JSON.stringify(
              functionArgs
            )}`
          );

          const functionResponse = await functionToCall(functionArgs);

          let function_call_result_message;
          if (functionResponse.status === "success") {
            function_call_result_message = {
              role: "tool",
              content: JSON.stringify(functionResponse.data),
              tool_call_id: detectedTool.id,
            };
          } else {
            function_call_result_message = {
              role: "tool",
              content: JSON.stringify({ message: functionResponse.message }),
              tool_call_id: detectedTool.id,
            };
          }

          // Prepare the chat completion call payload with the tool result
          const completion_payload = {
            model: model,
            messages: [
              ...this.userContext,
              {
                role: "system",
                content:
                  "Please ensure that the response is summarized, concise, and does not include any formatting characters like asterisks (*) in the output.",
              },
              response.choices[0].message,
              function_call_result_message,
            ],
          };

          // Call the API again with streaming for final response
          const finalResponseStream = await this.openai.chat.completions.create(
            {
              model: completion_payload.model,
              messages: completion_payload.messages,
              stream: true,
            }
          );

          let finalResponse = "";
          for await (const chunk of finalResponseStream) {
            const content = chunk.choices[0]?.delta?.content || "";
            finalResponse += content;
            this.emit("gptreply", content, false, interactionCount);

            if (chunk.choices[0].finish_reason === "stop") {
              this.userContext.push({
                role: "assistant",
                content: finalResponse,
              });
              this.emit("gptreply", content, true, interactionCount);
              this.log(
                `[GptService] Final GPT -> user context length: ${this.userContext.length}`
              );
              break; // Finish the loop
            }
          }
        }
      }
    } catch (error) {
      this.log(`[GptService] Error during completion: ${error.message}`);
    }
  }
}
module.exports = { GptService };
