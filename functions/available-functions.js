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


function lookupProfileByPhone(phone) {
    return lookupProfileInUnifiedProfiles("phone", phone);
}


function lookupProfileInUnifiedProfiles(key, identifier) {

  //remove single quotes from the userId

  console.log(`Looking up profile in Unified Profiles for Key: ${key} Identifier: ${identifier} and `);
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
    'Attributes': `{"key": "${key}", "value": "${identifier}"}`,
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

/**
 * Verifies the information provided by the user.
 * @param userId The unique identifier of the user.
 * @param email The email address
 */
async function verifyInformation(userId, email) {
  if (userId && userId.userId) {
    userId = userId.userId;
  }
  return lookupProfileInUnifiedProfiles("userId", userId).then(profile => {
    console.log(`profile: ${profile}, email: ${email}`);
    if (profile.email === email) {
      console.log("verification succeeded, email matched!");
      return finishVerification( {result: true, keysUsedToValidate: ["email"]});
    } else {
      console.log("verification failed, email not match!");
      return finishVerification({result: false, keysUsedToValidate: ["email"]});
    }
  });

}


async function finishVerification(args) {
  const { result, keysUsedToValidate } = args;

  // Log the result of the verification process
  console.log(
    `[FinishVerification] Verification result: ${
      result ? "Success" : "Failure"
    }. Keys used to validate: ${keysUsedToValidate.join(", ")}`
  );

  //Do something that invokes an action?
  // Create a result message for the LLM after processing the finish verification tool call
  return {
    result: result,
    keysUsedToValidate: keysUsedToValidate,
    message: `Verification ${
      result ? "succeeded" : "failed"
    }. Keys used to validate: ${keysUsedToValidate.join(", ")}`,
  };
}




// Export all functions
module.exports = {
  liveAgentHandoff,
  lookupProfileInUnifiedProfiles,
  lookupProfileByPhone,
  verifyInformation,
  finishVerification
};
