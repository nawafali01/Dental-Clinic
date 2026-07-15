import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

// POST /api/users/send-email
// Customer ko confirmation + Admin ko notification dono emails bhejta hai
router.post("/send-email", async (req, res) => {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
        return res.status(400).json({ success: false, error: "to, subject aur message required hain" });
    }

    try {
        // 1. Customer ko confirmation email
        await sendEmail({
            to,
            subject,
            html: message,
        });

        // 2. Admin (aap) ko notification email
        await sendEmail({
            to: process.env.EMAIL_USER, // aapki apni Gmail
            subject: `📅 New Appointment Booked – ${subject}`,
            html: `
        <h2>New Appointment Request!</h2>
        <p><strong>Customer Email:</strong> ${to}</p>
        <p><strong>Details:</strong></p>
        ${message}
        <hr/>
        <p style="color:gray;font-size:12px;">Aurea Dental – Auto Notification</p>
      `,
        });

        res.status(200).json({
            success: true,
            message: "Customer aur admin dono ko email send ho gayi!",
        });
    } catch (err) {
        console.error("Email error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;