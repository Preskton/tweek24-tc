const tools = [
  {
    type: "function",
    function: {
      name: "lookupProfileByCarId",
      description:
        "Looks up the car's profile in the unified profiles database.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          carId: {
            type: "string",
            description: "The ID of the car to use for lookup",
          }
        },
        required: ["carId"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "lookupProfileByDriverId",
      description:
        "Looks up the driver's profile in the unified profiles database.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          primaryDriverId: {
            type: "string",
            description: "The ID of the driver to use for lookup",
          }
        },
        required: ["primaryDriverId"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "lookupProfileByEmergencyContactId",
      description:
        "Looks up the emergency contact's profile in the unified profiles database.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          emergencyContactId: {
            type: "string",
            description: "The ID of the emergency contact.",
          }
        },
        required: ["emergencyContactId"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "lookupProfileByPhone",
      description:
        "Looks up the user's profile in the unified profiles database.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          phone: {
            type: "string",
            description: "The phone number to lookup.",
          }
        },
        required: ["phone"],
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
