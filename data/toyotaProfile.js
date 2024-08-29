const carProfiles = {
  "[CAR_ID]": {
    carNumber: "[CAR_NUMBER]",
    provider: "[INSURANCE_PROVIDER]",
    policyNumber: "[POLICY_NUMBER]",
    contactNumber: "[CONTACT_NUMBER]",
    primaryDriverId: "[PRIMARY_DRIVER_ID]",
  },
};

const driverProfiles = {
  "[DRIVER_ID]": {
    id: "[DRIVER_ID]",
    firstName: "[FIRST_NAME]",
    lastName: "[LAST_NAME]",
    phoneNumber: "+[E164_PHONE_NUMBER]",
    email: "[EMAIL_ADDRESS]",
    dateOfBirth: "[DATE_OF_BIRTH]",
    emergencyContactId: "[EMERGENCY_CONTACT_ID]",
  },
};

const emergencyContactProfiles = {
  "[CONTACT_ID]": {
    id: "[CONTACT_ID]",
    name: "[CONTACT_PERSON_NAME]",
    phoneNumber: "[CONTACT_PERSON_PHONE_NUMBER]",
  },
};

module.exports = { carProfiles, driverProfiles, emergencyContactProfiles };