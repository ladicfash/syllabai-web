import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

// Brevo SMTP transporter
function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: "syllibai@gmail.com", // Brevo account email (sender)
      pass: ENV.brevoApiKey,
    },
  });
}

export interface DeadlineReminderPayload {
  toEmail: string;
  toName: string;
  deadlines: Array<{
    title: string;
    dueDate: number; // UTC ms
    subject?: string;
    priority?: string;
  }>;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysUntil(ms: number): string {
  const diff = ms - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

export async function sendDeadlineReminder(payload: DeadlineReminderPayload): Promise<void> {
  if (!ENV.brevoApiKey) {
    console.warn("[Email] BREVO_API_KEY not set — skipping email send");
    return;
  }

  const transporter = getTransporter();

  const deadlineRows = payload.deadlines
    .map(
      (d) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">
          <strong style="color:#111827;">${d.title}</strong>
          ${d.subject ? `<br/><span style="font-size:12px;color:#6b7280;">${d.subject}</span>` : ""}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;white-space:nowrap;color:#374151;">
          ${formatDate(d.dueDate)}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;white-space:nowrap;">
          <span style="
            display:inline-block;padding:2px 8px;border-radius:9999px;font-size:12px;font-weight:600;
            background:${d.priority === "high" ? "#fee2e2" : d.priority === "medium" ? "#fef3c7" : "#dcfce7"};
            color:${d.priority === "high" ? "#991b1b" : d.priority === "medium" ? "#92400e" : "#166534"};
          ">${daysUntil(d.dueDate)}</span>
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:28px 32px;">
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#f8fafc;letter-spacing:-0.3px;">
        📚 SyllibAI — Deadline Reminder
      </h1>
      <p style="margin:6px 0 0;font-size:14px;color:#94a3b8;">
        Hey ${payload.toName}, you have ${payload.deadlines.length} upcoming deadline${payload.deadlines.length !== 1 ? "s" : ""}.
      </p>
    </div>

    <!-- Table -->
    <div style="padding:24px 32px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:10px 12px;text-align:left;font-weight:600;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Assignment / Exam</th>
            <th style="padding:10px 12px;text-align:left;font-weight:600;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Due</th>
            <th style="padding:10px 12px;text-align:left;font-weight:600;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${deadlineRows}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        You're receiving this because you enabled deadline reminders in SyllibAI Settings.<br/>
        <a href="#" style="color:#6b7280;">Manage notification preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"SyllibAI" <syllibai@gmail.com>`,
    to: `"${payload.toName}" <${payload.toEmail}>`,
    subject: `📚 You have ${payload.deadlines.length} upcoming deadline${payload.deadlines.length !== 1 ? "s" : ""} — SyllibAI`,
    html,
  });
}

export async function testBrevoConnection(): Promise<boolean> {
  if (!ENV.brevoApiKey) return false;
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return true;
  } catch (err) {
    console.error("[Email] Brevo connection test failed:", err);
    return false;
  }
}
