import { google } from "googleapis";
import nodemailer from "nodemailer";

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  const accessTokenResponse = await oauth2Client.getAccessToken();
  const accessToken = accessTokenResponse.token;

  if (!accessToken) {
    throw new Error("Failed to generate access token");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken,
    },
  });
};

export const sendMail = async (email: string, otp: string) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `Peer Awards <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Peer Awards - Your OTP",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
              .container {
                max-width: 600px; margin: 0 auto;
                background-color: #ffffff; padding: 20px;
                border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                background-color: #4CAF50; color: white;
                padding: 20px; text-align: center;
                border-radius: 8px 8px 0 0;
                margin: -20px -20px 20px -20px;
              }
              .otp-box {
                background-color: #f9f9f9; border: 2px solid #4CAF50;
                padding: 20px; text-align: center;
                border-radius: 8px; margin: 20px 0;
              }
              .otp-code {
                font-size: 32px; font-weight: bold;
                color: #4CAF50; letter-spacing: 5px;
              }
              .footer {
                font-size: 12px; color: #666; text-align: center;
                margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header"><h1>Peer Awards</h1></div>
              <div>
                <p>Hello,</p>
                <p>Your One-Time Password (OTP) for authentication is:</p>
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>
                <p><strong>Important:</strong></p>
                <ul>
                  <li>This OTP is valid for 5 minutes only</li>
                  <li>Never share this OTP with anyone</li>
                  <li>If you didn't request this OTP, please ignore this email</li>
                </ul>
              </div>
              <div class="footer">
                <p>© 2026 Peer Awards System. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email} | Message ID: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`❌ Error sending email to ${email}:`, error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};