import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const serviceSid = process.env.TWILIO_SERVICE_SID!; // Twilio Verify service SID

const client = twilio(accountSid, authToken);

export const sendOtpToPhone = async (phone: string) => {
  return client.verify.v2
    .services(serviceSid)
    .verifications.create({ to: phone, channel: "sms" });
};

export const verifyOtpForPhone = async (phone: string, code: string) => {
  return client.verify.v2
    .services(serviceSid)
    .verificationChecks.create({ to: phone, code });
};
