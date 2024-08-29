const { Buffer } = require('node:buffer');


// Function to handle live agent handoff
async function liveAgentHandoff(args) {
  const { reason, context } = args;

  // Log the reason for the handoff
  console.log(`[LiveAgentHandoff] Initiating handoff with reason: ${reason}`);
  if (context) {
    console.log(`[LiveAgentHandoff] Context provided: ${context}`);
  }

  // Create a result message for the LLM after processing the handoff tool call
  return {
    reason: reason,
    context: context || "No additional context provided",
    message: `Handoff initiated due to: ${reason}. Context: ${
      context || "No additional context provided."
    }`,
  };
}





function lookupProfileInUnifiedProfiles(userId, phone) {
  //remove single quotes from the userId
  if (userId && userId.userId){
    userId = userId.userId;
  }
  let key = phone ? "phone" : "user_id";
  let value = phone ? phone : userId;
  console.log("Looking up profile in Unified Profiles for user ID:", userId);
  // construct url for UP lookup
  const url = 'https://preview.twilio.com/ProfileConnector/Profiles/Find';
  //add headers
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    'Authorization': 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64')
  };
  // construct body, url-form-encoded
  const body = new URLSearchParams({
    'UniqueName': 'PD91b361bdd3e2f4e633bfaf4c9c9f2463',
    'Attributes': `{"key": "${key}", "value": "${value}"}`,
  });
  console.log("body: ", body);
  // make the request
  const response =  fetch(url, {method: 'POST', headers, body});
  return response.then(responseRaw => {
    return responseRaw.json().then(data => {
      return data.profiles[0].profile;
    });
  });
}




// Export all functions
module.exports = {
  liveAgentHandoff,
  lookupProfileInUnifiedProfiles,
};
