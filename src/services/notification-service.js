// Notification service: sends email to rider when ride status changes
import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url" ;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Create transporter using SMTP credentials from env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_PORT) === "465",
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

export async function verifyEmailTransport() {
  try {
    await transporter.verify();
    console.log("✅ Email transporter ready");
  } catch (e) {
    console.error("❌ Email transporter not ready:", e?.message || e);
  }
}

export async function sendRideStatusEmail({ to, riderName, ride, newStatus }) {
  if (!to) {
    console.warn("sendRideStatusEmail called without recipient email");
    return;
  }

  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const subject = `Your ride #${ride?.ride_id || ""} is now ${newStatus}`;
  const text = `Hello ${riderName || "Rider"},\n\n` +
    `The status of your ride${ride?.ride_id ? ` #${ride.ride_id}` : ""} has changed to: ${newStatus}.\n` +
    (ride?.pickup_location ? `Pickup: ${ride.pickup_location}\n` : "") +
    (ride?.drop_location ? `Drop: ${ride.drop_location}\n` : "") +
    `\nThank you for riding with us!`;

  const html = `
    <p>Hello ${riderName || "Rider"},</p>
    <p>The status of your ride${ride?.ride_id ? ` <strong>#${ride.ride_id}</strong>` : ""} has changed to: <strong>${newStatus}</strong>.</p>
    ${ride?.pickup_location ? `<p>Pickup: ${ride.pickup_location}</p>` : ""}
    ${ride?.drop_location ? `<p>Drop: ${ride.drop_location}</p>` : ""}
    <p>Thank you for riding with us!</p>
  `;

  try {
    await transporter.sendMail({ from, to, subject, text, html });
    console.log(`📧 Email sent to ${to} for ride status: ${newStatus}`);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}