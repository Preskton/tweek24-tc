const mockDatabase = require("../data/mock-database");

// Utility function to normalize the time format
function normalizeTimeFormat(time) {
  const timeParts = time.split(":");
  let hour = parseInt(timeParts[0], 10);
  const minutes = timeParts[1].slice(0, 2);
  const period = hour >= 12 ? "PM" : "AM";

  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minutes} ${period}`;
}

// Function to schedule a tour
async function scheduleTour(args) {
  const { date, time, type, apartmentType } = args;

  console.log(
    `[scheduleTour] Current available appointments:`,
    mockDatabase.availableAppointments
  );
  console.log(`[scheduleTour] Received arguments:`, args);

  const normalizedTime = normalizeTimeFormat(time);
  console.log(`[scheduleTour] Normalized Time: ${normalizedTime}`);

  const index = mockDatabase.availableAppointments.findIndex(
    (slot) =>
      slot.date === date &&
      slot.time === normalizedTime &&
      slot.type === type &&
      slot.apartmentType === apartmentType
  );

  console.log(`[scheduleTour] Index found: ${index}`);

  if (index === -1) {
    console.log(`[scheduleTour] The requested slot is not available.`);
    return {
      status: "error",
      message: `The ${normalizedTime} slot on ${date} is no longer available. Would you like to choose another time or date?`,
    };
  }

  mockDatabase.appointments.push({
    date,
    time: normalizedTime,
    type,
    apartmentType,
    id: mockDatabase.appointments.length + 1,
  });
  mockDatabase.availableAppointments.splice(index, 1); // Remove the slot from available appointments

  console.log(`[scheduleTour] Appointment successfully scheduled.`);
  return {
    status: "success",
    data: {
      message: `Your tour is scheduled for ${date} at ${normalizedTime}. Would you like a confirmation via SMS?`,
    },
  };
}

// Function to check availability
async function checkAvailability(args) {
  const { date, time, type, apartmentType } = args;

  console.log(
    `[checkAvailability] Current available appointments:`,
    mockDatabase.availableAppointments
  );
  console.log(`[checkAvailability] Received arguments:`, args);

  let availableSlots = mockDatabase.availableAppointments.filter(
    (slot) =>
      slot.date === date &&
      slot.type === type &&
      slot.apartmentType === apartmentType
  );

  console.log(`[checkAvailability] Available slots found:`, availableSlots);

  const requestedSlot = availableSlots.find((slot) => slot.time === time);

  if (requestedSlot) {
    console.log(`[checkAvailability] The requested slot is available.`);
    return {
      status: "success",
      data: {
        availableSlots: [requestedSlot],
        message: `The ${time} slot on ${date} is available for an ${type} tour of a ${apartmentType} apartment.`,
      },
    };
  } else {
    availableSlots = availableSlots.filter((slot) => slot.time !== time);
    console.log(
      `[checkAvailability] Alternate available slots:`,
      availableSlots
    );

    if (availableSlots.length > 0) {
      return {
        status: "success",
        data: {
          availableSlots,
          message: `The ${time} slot on ${date} isn't available. Here are the available slots on ${date}: ${availableSlots
            .map((slot) => slot.time)
            .join(", ")}.`,
        },
      };
    } else {
      const broaderSlots = mockDatabase.availableAppointments.filter(
        (slot) => slot.apartmentType === apartmentType && slot.type === type
      );

      console.log(`[checkAvailability] Broader available slots:`, broaderSlots);

      if (broaderSlots.length > 0) {
        return {
          status: "success",
          data: {
            availableSlots: broaderSlots,
            message: `There are no available slots on ${date} for a ${apartmentType} apartment, but we have these options on other dates: ${broaderSlots
              .map((slot) => `${slot.date} at ${slot.time}`)
              .join(", ")}.`,
          },
        };
      } else {
        console.log(`[checkAvailability] No available slots found.`);
        return {
          status: "error",
          message: `There are no available slots for a ${apartmentType} apartment at this time.`,
        };
      }
    }
  }
}

// Function to check existing appointments
async function checkExistingAppointments() {
  const userAppointments = mockDatabase.appointments;

  if (userAppointments.length > 0) {
    return {
      status: "success",
      data: userAppointments,
    };
  } else {
    return {
      status: "error",
      message:
        "You don't have any appointments scheduled. Would you like to book a tour or check availability?",
    };
  }
}

// Function to handle common inquiries
async function commonInquiries({ inquiryType, apartmentType }) {
  let inquiryDetails;

  if (apartmentType) {
    inquiryDetails = mockDatabase.apartmentDetails[apartmentType][inquiryType];
  } else {
    inquiryDetails = Object.keys(mockDatabase.apartmentDetails)
      .map((key) => mockDatabase.apartmentDetails[key][inquiryType])
      .filter(Boolean)
      .join(" ");
  }

  if (inquiryDetails) {
    return {
      status: "success",
      data: { inquiryDetails },
    };
  } else {
    return {
      status: "error",
      message: `I'm sorry, I don't have information about ${inquiryType}.`,
    };
  }
}

// Function to list available apartments
async function listAvailableApartments(args) {
  try {
    let apartments = Object.keys(mockDatabase.apartmentDetails).map((type) => ({
      type,
      ...mockDatabase.apartmentDetails[type],
    }));

    // Filter based on user input
    if (args.date) {
      apartments = apartments.filter(
        (apt) => new Date(apt.availabilityDate) <= new Date(args.date)
      );
    }
    if (args.budget) {
      apartments = apartments.filter((apt) => apt.rent <= args.budget);
    }
    if (args.apartmentType) {
      apartments = apartments.filter((apt) => apt.type === args.apartmentType);
    }

    const summary = apartments
      .map(
        (apt) =>
          `${apt.layout}: ${apt.rent}/month, available from ${
            apt.availabilityDate
          }. Features: ${apt.features.join(", ")}.`
      )
      .join("\n\n");

    return {
      status: "success",
      data: {
        availableApartments: summary,
      },
    };
  } catch (error) {
    console.log(
      `[listAvailableApartments] Error listing available apartments: ${error.message}`
    );
    return {
      status: "error",
      message: "An error occurred while listing available apartments.",
    };
  }
}

// Export all functions
module.exports = {
  scheduleTour,
  checkAvailability,
  checkExistingAppointments,
  commonInquiries,
  listAvailableApartments,
};
