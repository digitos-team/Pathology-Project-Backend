import nodemailer from "nodemailer";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendReportEmail = asyncHandler(async ({ to, pdfPath, patientName }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Your Lab" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Pathology Report",
    html: `
      <p>Dear ${patientName},</p>
      <p>Your pathology report is attached.</p>
      <p>Regards,<br/>Your Lab Team</p>
    `,
    attachments: [
      {
        filename: "Lab_Report.pdf",
        path: pdfPath
      }
    ]
  });
})
