import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  // TODO: Fetch USDC balances per chain via UCW/API
  return NextResponse.json({ balances: [] });
}
