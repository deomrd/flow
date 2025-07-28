import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

export const sendOtpByEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: `"Support" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Code de vérification email",
    html: `<p>Voici votre code de vérification : <strong>${otp}</strong></p>`
  });
};
