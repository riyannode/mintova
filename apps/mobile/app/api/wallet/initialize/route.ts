import { NextRequest, NextResponse } from "next/server";
import { initiateUserControlledWalletsClient, Blockchain } from "@circle-fin/user-controlled-wallets";

const circleClient = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { userToken } = await req.json();

    if (!userToken) {
      return NextResponse.json({ error: "userToken required" }, { status: 400 });
    }

    const response = await circleClient.createUserPinWithWallets({
      userToken,
      blockchains: [
        Blockchain.EthSepolia,
        Blockchain.BaseSepolia,
        Blockchain.ArbSepolia,
        Blockchain.AvaxFuji,
        Blockchain.OpSepolia,
        Blockchain.MaticAmoy,
        Blockchain.ArcTestnet,
      ],
      accountType: "EOA",
    });

    return NextResponse.json({
      challengeId: response.data?.challengeId,
    });
  } catch (error: any) {
    if (error?.code === 155106 || error?.message?.includes("155106")) {
      return NextResponse.json({ code: 155106, message: "User already initialized" });
    }
    console.error("Initialize error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize user" },
      { status: 500 },
    );
  }
}
