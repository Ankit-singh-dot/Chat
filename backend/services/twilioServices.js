import twilio from "twilio";
const ServiceSid = process.env.TWILIO_SERVICE_SID;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authTOken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authTOken);

export const sendOtpToPhoneNumber = async (phoneNumber) => {
  try {
    console.log("sending otp to this number", phoneNumber);
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }
    const response = await client.verify.v2
      .services(ServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });
    console.log("this is my otp response", response);
    return response;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send otp");
  }
};
export const verifyOtp = async (phoneNumber, otp) => {
  try {
    console.log("this is my otp", otp);
    console.log("this is my phoneNumber", phoneNumber);
    if (!phoneNumber) {
      throw new error("phone number is required");
    }
    const response = await client.verify._v2
      .services(ServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: otp,
      });
    console.log("this is my otp response", response);
    return response;
  } catch (error) {
    console.error(error);
    throw new Error("otp verification failed");
  }
};


