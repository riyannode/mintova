import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  // TODO: Return UCW session state
  return NextResponse.json({ authenticated: false, address: null });
}

export async function POST(req: NextRequest) {
  // TODO: Create/restore UCW session
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
