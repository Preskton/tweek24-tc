const customerProfiles = {
  "+17632291691": {
    profile: {
      firstName: "Chris",
      lastName: "Feehan",
      phoneNumber: "+17632291691",
      email: "cfeehan@twilio.com",
      preferredApartmentType: "studio",
      budget: 1500,
      moveInDate: "2024-09-15",
      petOwner: false,
      tourPreference: "self-guided",
    },
    conversationHistory: [
      {
        date: "2024-08-10",
        summary:
          "Chris inquired about available studio apartments and the pet policy. The assistant confirmed that cats and small dogs are allowed with a fee.",
      },
      {
        date: "2024-08-08",
        summary:
          "Chris asked about scheduling a self-guided tour for a one-bedroom apartment. The assistant offered available times, but Chris did not confirm.",
      },
      {
        date: "2024-08-07",
        summary:
          "Chris asked if the rent for the one-bedroom apartment could be negotiated. The assistant clarified that the listed prices are firm.",
      },
      {
        date: "2024-08-06",
        summary:
          "Chris asked if there is a daycare facility nearby. The assistant mentioned that there is no daycare service on-site and could not provide information about local options.",
      },
      {
        date: "2024-08-05",
        summary:
          "Chris asked about the utility fees for studio apartments. The assistant explained that water and trash are included, but electricity and internet are not.",
      },
      {
        date: "2024-08-04",
        summary:
          "Chris asked if there were any restrictions on hanging artwork or decorations in the apartment. The assistant did not have that information and advised Chris to check the lease agreement for decoration policies.",
      },
      {
        date: "2024-08-03",
        summary:
          "Chris asked if there were any promotions for signing a lease. The assistant explained that there were no current promotions for studio apartments.",
      },
      {
        date: "2024-08-02",
        summary:
          "Chris asked about the availability of two-bedroom apartments and mentioned a budget of $1,200. The assistant confirmed that two-bedroom apartments are outside the budget range.",
      },
      {
        date: "2024-08-01",
        summary:
          "Chris asked if the studio apartment included parking. The assistant confirmed that parking is available but comes with an additional fee.",
      },
      {
        date: "2024-07-31",
        summary:
          "Chris asked if Parkview Apartments offered a shuttle service to downtown. The assistant explained that Parkview does not provide any transportation services.",
      },
    ],
  },
  "+16503800236": {
    profile: {
      firstName: "Austin",
      lastName: "Park",
      phoneNumber: "+16503800236",
      email: "apark@twilio.com",
      preferredApartmentType: "two-bedroom",
      budget: 2200,
      moveInDate: "2024-10-01",
      petOwner: true,
      tourPreference: "in-person",
    },
    conversationHistory: [
      {
        date: "2024-08-12",
        summary:
          "Austin inquired about two-bedroom apartments and asked for the earliest move-in date. The assistant confirmed that the earliest move-in date is September 15, 2024.",
      },
      {
        date: "2024-08-10",
        summary:
          "Austin asked about the availability of parking spots for two-bedroom apartments. The assistant confirmed that each apartment comes with one reserved parking spot and additional parking is available for a fee.",
      },
      {
        date: "2024-08-08",
        summary:
          "Austin inquired about the pet policy, particularly if there are restrictions on dog breeds. The assistant confirmed that cats and small dogs are allowed with a fee, but large dogs may not be permitted.",
      },
      {
        date: "2024-08-07",
        summary:
          "Austin asked if utilities are included for the two-bedroom apartments. The assistant explained that water, trash, and Wi-Fi are included, but electricity and gas are the tenant's responsibility.",
      },
      {
        date: "2024-08-05",
        summary:
          "Austin asked about nearby parks for walking his dog. The assistant confirmed that there are a few parks within walking distance, but had no specific recommendations.",
      },
      {
        date: "2024-08-03",
        summary:
          "Austin asked if there are any current move-in specials for two-bedroom apartments. The assistant confirmed that there are no promotions available at this time.",
      },
      {
        date: "2024-08-02",
        summary:
          "Austin asked about the availability of two-bedroom apartments with hardwood floors. The assistant confirmed that all available two-bedroom apartments have hardwood floors in the living areas.",
      },
      {
        date: "2024-08-01",
        summary:
          "Austin inquired about the security deposit for the two-bedroom apartments. The assistant confirmed that the security deposit is $300.",
      },
      {
        date: "2024-07-30",
        summary:
          "Austin asked if there is a fitness center available on-site. The assistant confirmed that there is a small gym available for residents with no additional fee.",
      },
      {
        date: "2024-07-28",
        summary:
          "Austin asked if the apartment complex offers a concierge service. The assistant clarified that there is no concierge service available.",
      },
    ],
  },
};

module.exports = customerProfiles;
