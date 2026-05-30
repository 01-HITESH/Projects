"use server";

import { headers } from "next/headers";
import { neon } from "@neondatabase/serverless";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { createHash } from "crypto";
import { contactSchema, type ContactInput } from "@/lib/validations";

type ContactResult = { success: true } | { success: false; error: string };

function getIp() {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

async function checkRateLimit(ip: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return true;
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: true,
  });
  const result = await ratelimit.limit(`contact:${ip}`);
  return result.success;
}

export async function submitContact(data: ContactInput): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Please review the highlighted fields." };
  }

  const ip = getIp();
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return { success: false, error: "Too many submissions. Try again later." };
  }

  const ipHash = createHash("sha256").update(ip).digest("hex");

  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      insert into contact_submissions (name, email, company, inquiry_type, message, ip_hash)
      values (${parsed.data.name}, ${parsed.data.email}, ${parsed.data.company || null}, ${parsed.data.inquiryType}, ${parsed.data.message}, ${ipHash})
    `;
  }

  if (process.env.RESEND_API_KEY && process.env.RESEND_TO_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Onchain Holdings <onboarding@resend.dev>",
      to: process.env.RESEND_TO_EMAIL,
      subject: `New ${parsed.data.inquiryType} inquiry from ${parsed.data.name}`,
      html: `
        <h1>New contact submission</h1>
        <p><strong>Name:</strong> ${parsed.data.name}</p>
        <p><strong>Email:</strong> ${parsed.data.email}</p>
        <p><strong>Company:</strong> ${parsed.data.company || "N/A"}</p>
        <p><strong>Type:</strong> ${parsed.data.inquiryType}</p>
        <p><strong>Message:</strong></p>
        <p>${parsed.data.message}</p>
      `,
    });
  }

  return { success: true };
}
