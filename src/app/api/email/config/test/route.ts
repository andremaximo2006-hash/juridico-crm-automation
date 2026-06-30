import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const config = await prisma.emailConfig.findFirst({
      where: { isAtivo: true }
    });

    if (!config) {
      return NextResponse.json({ error: "No active config found" }, { status: 400 });
    }

    if (config.provider === "smtp") {
      // Test SMTP connection
      const transporter = nodemailer.createTransport({
        host: config.smtpHost || "localhost",
        port: parseInt(String(config.smtpPort || 587)),
        secure: parseInt(String(config.smtpPort || 587)) === 465,
        auth: config.smtpUser ? {
          user: config.smtpUser,
          pass: config.smtpPassword
        } : undefined
      } as any);

      await transporter.verify();
      return NextResponse.json({ message: "SMTP connection successful" });
    } else if (config.provider === "sendgrid") {
      // Test SendGrid connection
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: config.fromEmail }],
              subject: "SendGrid Test"
            }
          ],
          from: { email: config.fromEmail, name: config.fromName },
          content: [
            {
              type: "text/plain",
              value: "Test email from Jurídico CRM"
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.errors?.[0]?.message || "SendGrid error" }, { status: 400 });
      }

      return NextResponse.json({ message: "SendGrid connection successful" });
    }

    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
