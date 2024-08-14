const tools = [
  {
    type: "function",
    function: {
      name: "scheduleTour",
      description: "Schedules a tour for the user at the apartment complex.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description:
              "The date the user wants to schedule the tour for (YYYY-MM-DD).",
          },
          time: {
            type: "string",
            description:
              'The time the user wants to schedule the tour for (e.g., "10:00 AM").',
          },
          type: {
            type: "string",
            enum: ["in-person", "self-guided"],
            description: "The type of tour, either in-person or self-guided.",
          },
          apartmentType: {
            type: "string",
            enum: ["studio", "one-bedroom", "two-bedroom", "three-bedroom"],
            description:
              "The layout of the apartment the user is interested in.",
          },
        },
        required: ["date", "time", "type", "apartmentType"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "checkAvailability",
      description:
        "Checks the availability of tour slots based on the user’s preferences.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description:
              "The date the user wants to check for tour availability (YYYY-MM-DD).",
          },
          time: {
            type: "string",
            description:
              'The time the user wants to check for availability (e.g., "10:00 AM").',
          },
          type: {
            type: "string",
            enum: ["in-person", "self-guided"],
            description: "The type of tour, either in-person or self-guided.",
          },
          apartmentType: {
            type: "string",
            enum: ["studio", "one-bedroom", "two-bedroom", "three-bedroom"],
            description:
              "The layout of the apartment the user is interested in.",
          },
        },
        required: ["date", "type", "apartmentType"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listAvailableApartments",
      description:
        "Lists available apartments based on optional user criteria.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description:
              "The move-in date the user prefers (optional, YYYY-MM-DD).",
          },
          budget: {
            type: "integer",
            description:
              "The budget the user has for rent per month (optional).",
          },
          apartmentType: {
            type: "string",
            enum: ["studio", "one-bedroom", "two-bedroom", "three-bedroom"],
            description:
              "The layout of the apartment the user is interested in (optional).",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "checkExistingAppointments",
      description: "Retrieves the list of appointments already booked.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "commonInquiries",
      description:
        "Handles common inquiries such as pet policy, fees, and other complex details, with the option to specify the apartment type.",
      parameters: {
        type: "object",
        properties: {
          inquiryType: {
            type: "string",
            enum: [
              "pet policy",
              "fees",
              "parking",
              "specials",
              "income requirements",
              "utilities",
            ],
            description:
              "The type of inquiry the user wants information about.",
          },
          apartmentType: {
            type: "string",
            enum: ["studio", "one-bedroom", "two-bedroom", "three-bedroom"],
            description:
              "The apartment type for which the inquiry is being made (optional).",
          },
        },
        required: ["inquiryType"],
      },
    },
  },
];

module.exports = tools;
