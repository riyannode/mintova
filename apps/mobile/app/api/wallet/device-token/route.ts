import { NextRequest, NextResponse } from "next/server";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

const circleClient = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { deviceId } = await req.json();

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId required" }, { status: 400 });
    }

    const response = await circleClient.createDeviceTokenForSocialLogin({
      deviceId,
    });

    return NextResponse.json({
      deviceToken: response.data?.deviceToken,
      deviceEncryptionKey: response.data?.deviceEncryptionKey,
    });
  } catch (error: any) {
    console.error("Device token error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create device token" },
      { status: 500 },
    );
  }
}
