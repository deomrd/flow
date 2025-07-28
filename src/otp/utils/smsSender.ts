import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const sendOtpBySms = async (phone: string, otpCode: string) => {
  try {
    const message = await client.messages.create({
      body: `Votre code de vérification est Money Flow : ${otpCode}`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone
    });

    return message.sid;
  } catch (error) {
    console.error("Erreur d'envoi SMS : ", error);
    throw new Error("Impossible d'envoyer le SMS");
  }
};
