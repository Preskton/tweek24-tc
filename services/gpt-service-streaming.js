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

function getTtsMessageForTool(toolName, userProfile = null) {
  const name = userProfile?.profile?.firstName
    ? userProfile.profile.firstName
    : ""; // Get the user's name if available

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

  switch (toolName) {
    case "listAvailableApartments":
      return `${randomIntro} let me check on the available apartments for you.`;
    case "checkExistingAppointments":
      return `${randomIntro} I'll look up your existing appointments.`;
    case "scheduleTour":
      return `${randomIntro} I'll go ahead and schedule that tour for you.`;
    case "checkAvailability":
      return `${randomIntro} let me verify the availability for the requested time.`;
    case "commonInquiries":
      return `${randomIntro} let me check on that for you! Just a moment.`;
    case "sendAppointmentConfirmationSms":
      return `${randomIntro} I'll send that SMS off to you shortly, give it a few minutes and you should see it come through.`;
    default:
      return `${randomIntro} give me a moment while I fetch the information.`;
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
    this.smsSendNumber = null; // Store the "To" number (Twilio's "from")
    this.phoneNumber = null; // Store the "From" number (user's phone)
  }

  setUserProfile(userProfile) {
    this.userProfile = userProfile;
    if (userProfile) {
      const { firstName } = userProfile.profile;
      const historySummaries = userProfile.conversationHistory
        .map(
          (history) =>
            `On ${history.date}, ${firstName} asked: ${history.summary}`
        )
        .join(" ");
      // Add the conversation history to the system context
      this.userContext.push({
        role: "system",
        content: `${firstName} has had previous interactions. Conversation history: ${historySummaries}`,
      });
    }
  }

  // Method to store the phone numbers from app.js
  setPhoneNumbers(smsSendNumber, phoneNumber) {
    this.smsSendNumber = smsSendNumber;
    this.phoneNumber = phoneNumber;
  }

  // Method to retrieve the stored numbers (can be used in the function calls)
  getPhoneNumbers() {
    return { to: this.smsSendNumber, from: this.phoneNumber };
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

        // Log each chunk as it comes in
        this.log(`[GptService] Chunk received: ${JSON.stringify(chunk)}`);

        // Check if a tool call is detected
        const toolCall = chunk.choices[0]?.delta?.tool_calls;
        if ((toolCall && toolCall[0]) || toolCallDetected) {
          toolCallDetected = true; // Set the boolean to true
          detectedTool = toolCall[0];
          // Log the parsed toolCall
          this.log(
            `[GptService] Parsed tool call: ${JSON.stringify(toolCall)}`
          );
          this.log(
            `[GptService] Tool call DETAILS 1: ${JSON.stringify(
              toolCall[0],
              null,
              2
            )}`
          );

          this.log(
            `[GptService] Tool call detected: ${toolCall[0].function.name}`
          );
        }

        // Handle regular streaming if no tool call is detected
        if (!toolCallDetected) {
          this.emit("gptreply", content, false, interactionCount);
        }

        // Check if the current chunk is the last one in the stream
        if (chunk.choices[0].finish_reason === "stop") {
          this.log(`[GptService] In finish reason === STOP`);
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
            this.log(
              `[GptService] Tool call DETAILS2: ${JSON.stringify(
                toolCall[0],
                null,
                2
              )}`
            );

            this.log(
              `[GptService] Tool call detected 2: ${toolCall[0].function.name}`
            );
            detectedTool = toolCall[0];
          }
        }
        // If we detected a tool call, process it now
        if (toolCallDetected) {
          this.log(`[GptService] In Tool Call logic`);
          this.log(
            `[GptService] DetectedTool: ${JSON.stringify(detectedTool)}`
          );
          const functionName = detectedTool.function.name;
          // Check if arguments are not empty and valid JSON
          let functionArgs;
          try {
            functionArgs = detectedTool.function.arguments
              ? JSON.parse(detectedTool.function.arguments)
              : {}; // Default to empty object if no arguments
          } catch (error) {
            this.log(
              `[GptService] Error parsing function arguments: ${error.message}`
            );
            functionArgs = {}; // Default to empty object if parsing fails
          }
          const functionToCall = availableFunctions[functionName];

          // Inject phone numbers if it's the SMS function
          if (functionName === "sendAppointmentConfirmationSms") {
            const phoneNumbers = this.getPhoneNumbers();
            functionArgs = { ...functionArgs, ...phoneNumbers };
          }

          this.log(
            `[GptService] Calling function ${functionName} with arguments: ${JSON.stringify(
              functionArgs
            )}`
          );

          if (!dtmfTriggered) {
            // Emit TTS message related to the tool call
            const ttsMessage = getTtsMessageForTool(
              functionName,
              this.userProfile
            );
            this.emit("gptreply", ttsMessage, true, interactionCount); // Emit the TTS message immediately
          }

          const functionResponse = await functionToCall(functionArgs);

          let function_call_result_message;

          function_call_result_message = {
            role: "tool",
            content: JSON.stringify(functionResponse),
            tool_call_id: detectedTool.id,
          };

          // Check if specific tool calls require additional system messages
          const systemMessages = [];
          if (functionName === "listAvailableApartments") {
            systemMessages.push({
              role: "system",
              content:
                "Do not use asterisks (*) under any circumstances in this response. Summarize the available apartments in a readable format.",
            });
          }

          // Personalize system messages based on user profile during relevant tool calls
          if (functionName === "checkAvailability" && this.userProfile) {
            const { firstName, moveInDate } = this.userProfile.profile;
            systemMessages.push({
              role: "system",
              content: `When checking availability for ${firstName}, remember that they are looking to move in on ${moveInDate}.`,
            });
          }

          // Prepare the chat completion call payload with the tool result
          const completion_payload = {
            model: model,
            messages: [
              ...this.userContext,
              ...systemMessages, // Inject dynamic system messages when relevant
              response.choices[0].message, // the tool_call message
              function_call_result_message, // The result of the tool call
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

              if (
                functionName === "scheduleTour" &&
                functionResponse.available
              ) {
                // Inject a system message to ask about SMS confirmation
                this.userContext.push({
                  role: "system",
                  content:
                    "If the user agrees to receive an SMS confirmation, immediately trigger the 'sendAppointmentConfirmationSms' tool with the appointment details and the UserProfile. Do not ask for their phone number or any other details from the user.",
                });
              }
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
      this.log(
        `[GptService] Error during tool call processing: ${error.stack}`
      );
    }
  }
}
module.exports = { GptService };
