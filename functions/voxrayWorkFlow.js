const { carProfiles, driverProfiles, emergencyContactProfiles } = require('../data/toyotaProfile.js');

function handleIncomingCall(carId) {
    const carProfile = carProfiles[carId];
    if (!carProfile) {
        console.log('Car profile not found');
        return;
    }

    const driverProfile = driverProfiles[carProfile.primaryDriverId];
    if (!driverProfile) {
        console.log('Driver profile not found');
        return;
    }

    const emergencyContact = emergencyContactProfiles[driverProfile.emergencyContactId];
    if (!emergencyContact) {
        console.log('Emergency contact not found');
        return;
    }

    // Simulate VOXRAY joining the conference
    console.log('VOXRAY joins the conference with personalization');
    console.log(`VOXRAY asks: "Hello ${driverProfile.firstName}, what is the emergency about?"`);

    // Simulate customer mentioning 'emergency'
    const customerResponse = 'emergency';

    if (customerResponse.includes('emergency')) {
        console.log('VOXRAY detected an emergency');
        console.log(`VOXRAY is contacting emergency person at ${emergencyContact.phoneNumber}...`);
        // TODO: Logic to add emergency contact to the conference
        console.log('Emergency contact added to the conference');
        console.log('VOXRAY is gathering information while emergency contact is also chatting');
    }
}

module.exports = { handleIncomingCall };