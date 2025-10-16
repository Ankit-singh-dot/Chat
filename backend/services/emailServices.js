import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log("Gmail services connection failed");
  } else {
    console.log("Gmail configured properly and ready to send email");
  }
});
export const sendOtpToEmail = async (email, otp) => {
  const html = `
   <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #222; line-height: 1.7; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
  <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    
    <h2 style="color: #075e54; margin-bottom: 10px;">🔐 WhatsApp Web Verification</h2>
    
    <p style="font-size: 15px;">Hey there 👋,</p>

    <p style="font-size: 15px;">
      Here’s your one-time password (OTP) to verify your <strong>WhatsApp Web</strong> account.
    </p>

    <div style="margin: 25px 0; text-align: center;">
      <h1 style="background: linear-gradient(135deg, #25d366, #128c7e); color: #fff; display: inline-block; padding: 14px 32px; border-radius: 10px; letter-spacing: 3px; font-size: 26px;">
        ${otp}
      </h1>
    </div>

    <p style="font-size: 15px; color: #333;">
      ⏰ <strong>Valid for the next 5 minutes.</strong><br/>
      Keep this code private and do not share it with anyone for your security.
    </p>

    <p style="font-size: 14px; color: #555;">
      If you didn’t request this verification, you can safely ignore this message.
    </p>

    <p style="margin-top: 25px; font-size: 15px;">Best regards,<br/><strong>WhatsApp Web Security Team</strong></p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

    <small style="color: #888; font-size: 12px;">
      This is an automated message. Please do not reply.
    </small>
  </div>
</div>
  `;
  await transporter.sendMail({
    from: `WhatsApp-web < ${(process.env.EMAIL_USER)}`,
    to: email,
    subject: `OTP Dropped. Slide in Before It's Gone 💨`,
    html,
  });
};
