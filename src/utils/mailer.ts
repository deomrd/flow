import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  await transporter.sendMail({
    from: `"MoneyFlow" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Code OTP - Vérification de votre email',
    html: `
      <p>Bonjour,</p>
      <p>Voici votre code OTP pour valider votre email :</p>
      <h2>${otp}</h2>
      <p>Ce code expirera dans 5 minutes.</p>
    `,
  });
};
