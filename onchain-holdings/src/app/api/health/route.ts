import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, service: "onchain-holdings", time: new Date().toISOString() });
}
