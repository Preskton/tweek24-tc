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
};

module.exports = customerProfiles;
