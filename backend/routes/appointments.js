import express from "express";
import nodemailer from "nodemailer";
import { Appointment } from "../models/Appointment.js";

const router = express.Router();

// Helper to configure mail transporter
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: parseInt(process.env.SMTP_PORT || "2525"),
    auth: {
      user: process.env.SMTP_USER || "mock_user",
      pass: process.env.SMTP_PASS || "mock_pass",
    },
  });
};

router.post("/", async (req, res) => {
  try {
    const { fullName, email, phone, date, message } = req.body;
    if (!fullName || !email || !phone || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const appointment = new Appointment({
      fullName,
      email,
      phone,
      date,
      message,
    });

    await appointment.save();

    // Nodemailer notification sending
    try {
      const transporter = getTransporter();
      const mailOptions = {
        from: `"Aurea Dental" <${process.env.EMAIL_FROM || "hello@aurea.dental"}>`,
        to: process.env.EMAIL_FROM || "hello@aurea.dental",
        subject: `New Appointment Request from ${fullName}`,
        html: `
          <h3>New Appointment Details</h3>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Preferred Date:</strong> ${date}</p>
          <p><strong>Message:</strong> ${message || "No message provided."}</p>
        `,
      };

      // Mock/log if smtp credentials are mock, otherwise attempt send
      if (process.env.SMTP_USER === "mock_user") {
        console.log(`[Email Mock Sent] To: ${mailOptions.to}`);
        console.log(`[Email Content]:\n`, mailOptions.html);
      } else {
        await transporter.sendMail(mailOptions);
        console.log(`[Email Sent] Successful notification to ${mailOptions.to}`);
      }
    } catch (mailError) {
      console.warn(`[Mail Error]: Failed to send notification email.`, mailError.message);
      // We don't fail the request if just the email notification fails
    }

    res.status(201).json({
      message: "Appointment request submitted successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting appointment", error: error.message });
  }
});

export default router;
