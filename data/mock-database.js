const mockDatabase = {
  availableAppointments: [
    // Existing Week
    {
      date: "2024-09-02",
      time: "10:00 AM",
      type: "in-person",
      apartmentType: "one-bedroom",
    },
    {
      date: "2024-09-03",
      time: "1:00 PM",
      type: "in-person",
      apartmentType: "two-bedroom",
    },
    {
      date: "2024-09-04",
      time: "11:00 AM",
      type: "self-guided",
      apartmentType: "studio",
    },
    {
      date: "2024-09-05",
      time: "2:00 PM",
      type: "in-person",
      apartmentType: "three-bedroom",
    },
    {
      date: "2024-09-06",
      time: "3:00 PM",
      type: "self-guided",
      apartmentType: "one-bedroom",
    },
    {
      date: "2024-09-07",
      time: "9:00 AM",
      type: "in-person",
      apartmentType: "two-bedroom",
    },
    {
      date: "2024-09-08",
      time: "11:00 AM",
      type: "in-person",
      apartmentType: "two-bedroom",
    },
    {
      date: "2024-09-09",
      time: "10:00 AM",
      type: "self-guided",
      apartmentType: "studio",
    },
    {
      date: "2024-09-10",
      time: "4:00 PM",
      type: "in-person",
      apartmentType: "three-bedroom",
    },

    // Extended Week 1
    {
      date: "2024-09-11",
      time: "8:00 AM",
      type: "in-person",
      apartmentType: "studio",
    },
    {
      date: "2024-09-11",
      time: "11:00 AM",
      type: "in-person",
      apartmentType: "one-bedroom",
    },
    {
      date: "2024-09-11",
      time: "3:00 PM",
      type: "self-guided",
      apartmentType: "two-bedroom",
    },
    {
      date: "2024-09-12",
      time: "1:00 PM",
      type: "in-person",
      apartmentType: "three-bedroom",
    },
    {
      date: "2024-09-12",
      time: "4:00 PM",
      type: "in-person",
      apartmentType: "one-bedroom",
    },
    {
      date: "2024-09-13",
      time: "9:00 AM",
      type: "self-guided",
      apartmentType: "studio",
    },
    {
      date: "2024-09-13",
      time: "2:00 PM",
      type: "in-person",
      apartmentType: "two-bedroom",
    },
    {
      date: "2024-09-14",
      time: "10:00 AM",
      type: "in-person",
      apartmentType: "three-bedroom",
    },
    {
      date: "2024-09-14",
      time: "4:00 PM",
      type: "self-guided",
      apartmentType: "two-bedroom",
    },
    {
      date: "2024-09-15",
      time: "12:00 PM",
      type: "in-person",
      apartmentType: "studio",
    },

    // Extended Week 2
    {
      date: "2024-09-16",
      time: "11:00 AM",
      type: "in-person",
      apartmentType: "two-bedroom",
    },
    {
      date: "2024-09-16",
      time: "3:00 PM",
      type: "in-person",
      apartmentType: "three-bedroom",
    },
    {
      date: "2024-09-17",
      time: "9:00 AM",
      type: "self-guided",
      apartmentType: "one-bedroom",
    },
    {
      date: "2024-09-17",
      time: "2:00 PM",
      type: "in-person",
      apartmentType: "studio",
    },
    {
      date: "2024-09-18",
      time: "4:00 PM",
      type: "in-person",
      apartmentType: "two-bedroom",
    },
    {
      date: "2024-09-18",
      time: "12:00 PM",
      type: "self-guided",
      apartmentType: "three-bedroom",
    },
    {
      date: "2024-09-19",
      time: "10:00 AM",
      type: "in-person",
      apartmentType: "one-bedroom",
    },
    {
      date: "2024-09-19",
      time: "3:00 PM",
      type: "in-person",
      apartmentType: "two-bedroom",
    },
    {
      date: "2024-09-20",
      time: "1:00 PM",
      type: "in-person",
      apartmentType: "three-bedroom",
    },
    {
      date: "2024-09-20",
      time: "5:00 PM",
      type: "self-guided",
      apartmentType: "studio",
    },
  ],
  appointments: [],
  apartmentDetails: {
    studio: {
      layout: "Studio",
      squareFeet: 450,
      rent: 1050,
      moveInDate: "2024-09-15",
      features: ["1 bathroom", "open kitchen", "private balcony"],
      petPolicy: "No pets allowed.",
      fees: {
        applicationFee: 50,
        securityDeposit: 300,
      },
      parking: "1 reserved parking spot included.",
      specials: "First month's rent free if you move in before 2024-09-30.",
      incomeRequirements: "Income must be 2.5x the rent.",
      utilities:
        "Water, trash, and Wi-Fi internet included. Tenant pays electricity and gas.",
      location: {
        street: "1657 Coolidge Street",
        city: "Missoula",
        state: "Montana",
        zipCode: "59802",
      },
    },
    "one-bedroom": {
      layout: "One-bedroom",
      squareFeet: 600,
      rent: 1200,
      moveInDate: "2024-09-20",
      features: ["1 bedroom", "1 bathroom", "walk-in closet"],
      petPolicy: "Cats only. No dogs or any other animals.",
      fees: {
        applicationFee: 50,
        securityDeposit: 400,
      },
      parking: "1 reserved parking spot included.",
      specials: "First month's rent free if you move in before 2024-09-25.",
      incomeRequirements: "Income must be 3x the rent.",
      utilities:
        "Water, trash, gas, and Wi-Fi internet included. Tenant pays electricity.",
      location: {
        street: "1705 Adams Street",
        city: "Missoula",
        state: "Montana",
        zipCode: "59802",
      },
    },
    "two-bedroom": {
      layout: "Two-bedroom",
      squareFeet: 950,
      rent: 1800,
      moveInDate: "2024-09-10",
      features: ["2 bedrooms", "2 bathrooms", "walk-in closets", "balcony"],
      petPolicy: "Cats and dogs allowed, but only 1 each.",
      fees: {
        applicationFee: 50,
        securityDeposit: 500,
      },
      parking: "2 reserved parking spots included.",
      specials: "Waived application fee if you move in before 2024-09-20.",
      incomeRequirements: "Income must be 3x the rent.",
      utilities:
        "Water, trash, gas, and Wi-Fi internet included. Tenant pays electricity.",
      location: {
        street: "1833 Jefferson Avenue",
        city: "Missoula",
        state: "Montana",
        zipCode: "59802",
      },
    },
    "three-bedroom": {
      layout: "Three-bedroom",
      squareFeet: 1200,
      rent: 2500,
      moveInDate: "2024-09-25",
      features: [
        "3 bedrooms",
        "2 bathrooms",
        "walk-in closets",
        "private balcony",
        "extra storage",
      ],
      petPolicy:
        "Up to 2 dogs and 2 cats are allowed, and other small pets like hamsters are allwed as well. No more than 4 total pets.",
      fees: {
        applicationFee: 50,
        securityDeposit: 600,
      },
      parking: "2 reserved parking spots included.",
      specials: "No move-in fees if you sign a 12-month lease.",
      incomeRequirements: "Income must be 3x the rent.",
      utilities:
        "Water, trash, gas, and Wi-Fi internet included. Tenant pays electricity.",
      location: {
        street: "1945 Roosevelt Way",
        city: "Missoula",
        state: "Montana",
        zipCode: "59802",
      },
    },
  },
};

module.exports = mockDatabase;
