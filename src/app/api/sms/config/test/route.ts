import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const config = await prisma.sMSConfig.findFirst({
      where: { isAtivo: true }
    });

    if (!config) {
      return NextResponse.json({ error: "No active config found" }, { status: 400 });
    }

    if (config.provider === "twilio") {
      const auth = Buffer.from(`${config.accountSid}:${config.apiSecret}`).toString("base64");
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`
        }
      });

      if (!response.ok) {
        return NextResponse.json({ error: "Invalid Twilio credentials" }, { status: 400 });
      }

      return NextResponse.json({ message: "Twilio connection successful" });
    }

    return NextResponse.json({ message: "SMS config validation passed" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
