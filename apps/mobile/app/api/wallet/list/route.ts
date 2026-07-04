import { NextRequest, NextResponse } from "next/server";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

const circleClient = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { userToken } = await req.json();

    if (!userToken) {
      return NextResponse.json({ error: "userToken required" }, { status: 400 });
    }

    const response = await circleClient.listWallets({ userToken });

    return NextResponse.json({
      wallets: response.data?.wallets || [],
    });
  } catch (error: any) {
    console.error("List wallets error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list wallets" },
      { status: 500 },
    );
  }
}
