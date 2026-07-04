import { NextRequest, NextResponse } from "next/server";
import { quoteBridge } from "@/lib/bridge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceChain, destinationChain, amount, recipient } = body;

    const quote = await quoteBridge({ sourceChain, destinationChain, amount, recipient });
    return NextResponse.json({ quote });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Quote failed" },
      { status: 400 },
    );
  }
}
