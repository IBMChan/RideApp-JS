// src/services/notification-service.js
import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT === "465",
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

export async function verifyEmailTransport() {
  try {
    await transporter.verify();
    console.log("Email transporter ready");
  } catch (e) {
    console.error("Email transporter not ready:", e?.message || e);
  }
}

export async function sendRideStatusEmail({ to, riderName, ride, newStatus }) {
  if (!to) return;

  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const subject = `Your ride is now ${newStatus}`;
  const text = `Hello ${riderName},\n\nYour ride #${ride.ride_id} status has changed to: ${newStatus}.\nPickup: ${ride.pickup_location}\nDrop: ${ride.drop_location}\n\nThank you.`;

  const html = `<p>Hello ${riderName},</p>
                <p>Your ride <strong>#${ride.ride_id}</strong> status has changed to: <strong>${newStatus}</strong>.</p>
                <p>Pickup: ${ride.pickup_location}</p>
                <p>Drop: ${ride.drop_location}</p>
                <p>Thank you for riding with us!</p>`;

  try {
    await transporter.sendMail({ from, to, subject, text, html });
    console.log(`Email sent to ${to} for ride status ${newStatus}`);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}
