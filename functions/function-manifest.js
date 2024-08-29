const tools = [
  {
    type: "function",
    function: {
      name: "lookupProfileInUnifiedProfiles",
      description:
        "Looks up the user's profile in the unified profiles database.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "The unique identifier of the user.",
          }
        },
        required: ["userId"],
        additionalProperties: false
      }

    }
  },
  {
    type: "function",
    function: {
      name: "liveAgentHandoff",
      description:
        "Initiates a handoff to a live agent based on user request or sensitive topics.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description:
              "The reason for the handoff, such as user request, legal issue, financial matter, or other sensitive topics.",
          },
          context: {
            type: "string",
            description:
              "Any relevant conversation context or details leading to the handoff.",
          },
        },
        required: ["reason"],
      },
    },
  },
];

module.exports = tools;
