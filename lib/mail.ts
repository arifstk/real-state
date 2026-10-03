// lib/mail.ts

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailData {
  to: string;
  userName: string;
  hotelName: string;
  checkIn: string | Date;
  checkOut: string | Date;
  totalPrice: number;
  bookingId: string;
  paymentStatus?: string;
  paymentType?: string;
}

export async function sendBookingEmail(
  type: "CONFIRMED" | "PAYMENT_COMPLETED" | "CHECKED_OUT",
  data: EmailData,
) {
  let subject = "";
  let htmlContent = "";

  const formattedCheckIn = new Date(data.checkIn).toLocaleDateString();
  const formattedCheckOut = new Date(data.checkOut).toLocaleDateString();

  // STACK-STRICT CHECK: Only mark as paid if paymentStatus explicitly equals "paid" or "completed"
  const statusLower = (data.paymentStatus || "").toLowerCase();
  const isPaid = statusLower === "paid" || statusLower === "completed";

  // Format payment method text nicely
  const rawType = (data.paymentType || "").toLowerCase();
  const formattedPaymentMethod =
    rawType === "online" || rawType === "stripe" || rawType === "sslcommerz"
      ? "Online Payment"
      : rawType === "direct" || rawType === "pay_at_hotel"
        ? "Pay at Hotel (Direct)"
        : data.paymentType || "N/A";

  switch (type) {
    case "CONFIRMED":
      if (isPaid) {
        // Confirmed AND Paid Email
        subject = `Booking & Payment Confirmed! - ${data.hotelName}`;
        htmlContent = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #059669;">Booking & Payment Confirmed 🎉</h2>
            <p>Hi <strong>${data.userName}</strong>,</p>
            <p>Your booking at <strong>${data.hotelName}</strong> has been confirmed by admin, and your payment is fully processed.</p>
            
            <div style="background: #f8fafc; border-left: 4px solid #059669; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 4px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>
              <p style="margin: 4px 0;"><strong>Check-in:</strong> ${formattedCheckIn}</p>
              <p style="margin: 4px 0;"><strong>Check-out:</strong> ${formattedCheckOut}</p>
              <p style="margin: 4px 0;"><strong>Total Paid:</strong> $${data.totalPrice}</p>
              <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${formattedPaymentMethod}</p>
              <p style="margin: 4px 0;"><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">PAID ✅</span></p>
            </div>
            
            <p style="color: #475569;">No further payment is required. Have a safe journey!</p>
          </div>
        `;
      } else {
        // Confirmed BUT Unpaid Email (Works for Unpaid Online & Pay at Hotel)
        subject = `Booking Confirmed (Payment Pending) - ${data.hotelName}`;
        htmlContent = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">Booking Confirmed 🎉</h2>
            <p>Hi <strong>${data.userName}</strong>,</p>
            <p>Your booking at <strong>${data.hotelName}</strong> has been confirmed by the admin.</p>
            
            <div style="background: #f8fafc; border-left: 4px solid #d97706; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 4px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>
              <p style="margin: 4px 0;"><strong>Check-in:</strong> ${formattedCheckIn}</p>
              <p style="margin: 4px 0;"><strong>Check-out:</strong> ${formattedCheckOut}</p>
              <p style="margin: 4px 0;"><strong>Amount Due:</strong> $${data.totalPrice}</p>
              <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${formattedPaymentMethod}</p>
              <p style="margin: 4px 0;"><strong>Payment Status:</strong> <span style="color: #dc2626; font-weight: bold;">UNPAID ⏳</span></p>
            </div>
            
            <p style="color: #475569;">Please ensure your payment is completed as required upon check-in or via your account dashboard.</p>
          </div>
        `;
      }
      break;

    case "PAYMENT_COMPLETED":
      subject = `Payment Received! - ${data.hotelName}`;
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #059669;">Payment Received ✅</h2>
          <p>Hi <strong>${data.userName}</strong>,</p>
          <p>We've received your payment of <strong>$${data.totalPrice}</strong> for your stay at <strong>${data.hotelName}</strong>.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 4px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p style="margin: 4px 0;"><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">PAID ✅</span></p>
          </div>
        </div>
      `;
      break;

    case "CHECKED_OUT":
      subject = `Thank you for staying with us! - ${data.hotelName}`;
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #059669;">Hope You Enjoyed Your Stay! 🏨</h2>
          <p>Hi <strong>${data.userName}</strong>,</p>
          <p>You have successfully checked out from <strong>${data.hotelName}</strong>.</p>
          <p>Thank you for booking with us!</p>
        </div>
      `;
      break;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Luxury Stays" <${process.env.SMTP_USER}>`,
    to: data.to,
    subject,
    html: htmlContent,
  });
}
