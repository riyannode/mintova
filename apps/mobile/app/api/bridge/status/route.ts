import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  // TODO: Return bridge transaction status from activity store or backend
  return NextResponse.json({ status: "not_implemented" });
}
