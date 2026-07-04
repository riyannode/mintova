import { NextRequest, NextResponse } from "next/server";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

const circleClient = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { userToken, walletId } = await req.json();

    if (!userToken || !walletId) {
      return NextResponse.json({ error: "userToken and walletId required" }, { status: 400 });
    }

    const response = await circleClient.getWalletTokenBalance({
      walletId,
      userToken,
    });

    return NextResponse.json({
      balances: response.data?.tokenBalances || [],
    });
  } catch (error: any) {
    console.error("Balance error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch balances" },
      { status: 500 },
    );
  }
}
