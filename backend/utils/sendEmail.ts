import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can also use "outlook", "yahoo", etc.
      auth: {
        user: process.env.EMAIL_USER,      // Your Gmail address
        pass: process.env.EMAIL_PASS,      // App Password (not normal password)
      },
    });

    const mailOptions = {
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Thumblify! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ec4899;">Welcome, ${name}! 👋</h2>
          <p>Thank you for creating an account with us.</p>
          <p>We're excited to have you on board. You can now start generating amazing AI thumbnails!</p>
          <br/>
          <p>Best regards,<br/>The Thumblify Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.log("Error sending welcome email:", error);
  }
};