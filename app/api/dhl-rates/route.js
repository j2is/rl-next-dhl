import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const dhlApiKey = process.env.DHL_API_KEY;
    const dhlApiSecret = process.env.DHL_API_SECRET;

    if (!dhlApiKey || !dhlApiSecret) {
      return NextResponse.json(
        { error: "DHL API credentials not configured" },
        { status: 500 }
      );
    }

    const auth = Buffer.from(`${dhlApiKey}:${dhlApiSecret}`).toString("base64");

    const response = await fetch("https://api-mock.dhl.com/mydhlapi/rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "DHL API error", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("DHL API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rates", details: error.message },
      { status: 500 }
    );
  }
}
