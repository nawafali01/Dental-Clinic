import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const sendTestEmail = async (email, name) => {
  try {
    const response = await axios.post(`${API_URL}/users/send-email`, {
      to: email,
      subject: "Appointment Confirmed – Aurea Dental",
      message: `
        <h2>Hello ${name}! 👋</h2>
        <p>Thank you for booking an appointment with <strong>Aurea Dental</strong>.</p>
        <p>We have received your request and will confirm your appointment shortly.</p>
        <br/>
        <p>– The Aurea Dental Team</p>
      `,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Email send karne mein error aaya!");
  }
};