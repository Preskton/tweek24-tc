const tools = [
  {
    type: "function",
    function: {
      name: "verifyInformation",
      description:
        "Looks up the user's profile in the unified profiles database and verify email and Date Of Birth.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "The unique identifier of the user.",
          },
          email: {
            type: "string",
            description: "The email address of the user"
          }
        },
        required: ["userId", "email"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "finishVerification",
      description:
        "Finishes the verification process.",
      parameters: {
        type: "object",
        properties: {
          result: {
            type: "boolean",
            description:
              "Whether or not the user was successfully verified.",
          },
          keysUsedToValidate: {
            type: "array",
            items: {
              type: "string",
            },
            description:
              "The keys used to validate the user, such as VIN or email address.",
          },
        },
        required: ["reason"],
      },
    },
  },
];

module.exports = tools;
