import { NextResponse } from "next/server";
import { submitContact } from "@/app/actions/contact";
import { contactSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const result = await submitContact(parsed.data);
  return NextResponse.json(result, { status: result.success ? 200 : 429 });
}
