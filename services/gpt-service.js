const OpenAI = require("openai"); // or the appropriate module import
const EventEmitter = require("events");
const availableFunctions = require("../functions/available-functions");
const tools = require("../functions/function-manifest");
const prompt = require("../prompts/prompt");
const welcomePrompt = require("../prompts/welcomePrompt");
const model = "gpt-4o";

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

    this.isInterrupted = false;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  setCallSid(callSid) {
    this.userContext.push({ role: "system", content: `callSid: ${callSid}` });
  }

  interrupt() {
    this.isInterrupted = true;
  }

  updateUserContext(role, text) {
    this.userContext.push({ role: role, content: text });
  }

  async completion(text, interactionCount, role = "user", name = "user") {
    if (!text || typeof text !== "string") {
      this.log(`[GptService] Invalid prompt received: ${text}`);
      return;
    }

    this.isInterrupted = false;
    this.updateUserContext(role, text);

    let completeResponse = "";
    let partialResponse = "";
    let detectedToolCall = null;

    try {
      // Start with streaming enabled
      const responseStream = await this.openai.chat.completions.create({
        model: model,
        messages: this.userContext,
        tools: tools, // Ensure this aligns with your tool definitions
        stream: true,
      });

      for await (const chunk of responseStream) {
        if (this.isInterrupted) {
          break;
        }

        const content = chunk.choices[0]?.delta?.content || "";
        completeResponse += content;
        partialResponse += content;

        // Check if a tool call is detected
        const toolCalls = chunk.choices[0]?.delta?.tool_calls;

        if (toolCalls && toolCalls[0]) {
          this.log(
            `[GptService] Tool call detected: ${toolCalls[0].function.name}`
          );
          detectedToolCall = toolCalls[0]; // Store the tool call
          break; // Exit the loop to process the tool call
        }

        // Emit partial response as it comes in for regular conversation
        if (content.trim().slice(-1) === "•") {
          this.emit("gptreply", partialResponse, false, interactionCount);
          partialResponse = "";
        } else if (chunk.choices[0].finish_reason === "stop") {
          this.emit("gptreply", partialResponse, true, interactionCount);
        }
      }

      // If a tool call was detected, handle it with a non-streaming API call
      if (detectedToolCall) {
        // Make a non-streaming API call to handle the tool response
        const response = await this.openai.chat.completions.create({
          model: model,
          messages: this.userContext,
          tools: tools,
          stream: false, // Disable streaming to process the tool response
        });

        const toolCall = response.choices[0]?.message?.tool_calls;
        // If no tool call is detected after the non-streaming API call
        if (!toolCall || !toolCall[0]) {
          this.log(
            "[GptService] No tool call detected after non-streaming API call"
          );
          // Log the message content that would have been sent back to the user
          this.log(
            `[GptService] NON-TOOL-BASED Message content: ${
              response.choices[0]?.message?.content || "No content available"
            }`
          );

          // Add the response to the user context to preserve conversation history
          this.userContext.push({
            role: "assistant",
            content:
              response.choices[0]?.message?.content || "No content available",
          });

          // Emit the non-tool response to the user
          this.emit(
            "gptreply",
            response.choices[0]?.message?.content ||
              "I apologize, can you repeat that again just so I'm clear?",
            true,
            interactionCount
          );

          return;
        }

        const functionName = toolCall[0].function.name;
        const functionArgs = JSON.parse(toolCall[0].function.arguments);

        const functionToCall = availableFunctions[functionName];
        if (!functionToCall) {
          this.log(`[GptService] Function ${functionName} is not available.`);
          this.emit(
            "gptreply",
            "I'm unable to complete that action.",
            true,
            interactionCount
          );
          return;
        }

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
            tool_call_id: response.choices[0].message.tool_calls[0].id,
          };
        } else {
          function_call_result_message = {
            role: "tool",
            content: JSON.stringify({ message: functionResponse.message }),
            tool_call_id: response.choices[0].message.tool_calls[0].id,
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
            response.choices[0].message, // the tool_call message
            function_call_result_message,
          ],
        };

        // Call the API again with streaming enabled to process the tool response
        const finalResponseStream = await this.openai.chat.completions.create({
          model: completion_payload.model,
          messages: completion_payload.messages,
          stream: true, // Enable streaming for the final response
        });

        let finalCompleteResponse = "";
        let finalPartialResponse = "";

        for await (const chunk of finalResponseStream) {
          const content = chunk.choices[0]?.delta?.content || "";
          finalCompleteResponse += content;
          finalPartialResponse += content;

          if (content.trim().slice(-1) === "•") {
            this.emit(
              "gptreply",
              finalPartialResponse,
              false,
              interactionCount
            );
            finalPartialResponse = "";
          } else if (chunk.choices[0].finish_reason === "stop") {
            this.emit("gptreply", finalPartialResponse, true, interactionCount);
          }
        }

        this.userContext.push({
          role: "assistant",
          content: finalCompleteResponse,
        });
        this.log(
          `[GptService] Final GPT -> user context length: ${this.userContext.length}`
        );

        // Clear the detected tool call after processing
        detectedToolCall = null;
        return; // Exit after processing the tool call
      }

      // If no tool call was detected, add the complete response to the user context
      if (completeResponse.trim()) {
        this.userContext.push({ role: "assistant", content: completeResponse });
        this.log(
          `[GptService] GPT -> user context length: ${this.userContext.length}`
        );
      }
    } catch (error) {
      this.log(`Error during completion: ${error.message}`);
    }
  }
}
module.exports = { GptService };
