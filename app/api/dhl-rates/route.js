import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const body = await request.json();

		const dhlApiKey = process.env.DHL_API_KEY;
		const dhlApiSecret = process.env.DHL_API_SECRET;
		const dhlAccountNumber = process.env.DHL_ACCOUNT_NUMBER;
		const dhlUseProduction = process.env.DHL_USE_PRODUCTION === "true";

		if (!dhlApiKey || !dhlApiSecret) {
			return NextResponse.json(
				{ error: "DHL API credentials not configured" },
				{ status: 500 }
			);
		}

		if (!dhlAccountNumber) {
			return NextResponse.json(
				{ error: "DHL account number not configured. Please set DHL_ACCOUNT_NUMBER in your environment variables." },
				{ status: 500 }
			);
		}

		// Replace the placeholder account number with the actual account number
		if (body.accounts && body.accounts.length > 0) {
			body.accounts[0].number = dhlAccountNumber;
		}

		// Basic Auth: username = API_KEY, password = API_SECRET
		const auth = Buffer.from(`${dhlApiKey}:${dhlApiSecret}`).toString("base64");

		// API spec shows three environments:
		// 1. Mock Server: https://api-mock.dhl.com/mydhlapi (requires production access)
		// 2. Test Environment: https://express.api.dhl.com/mydhlapi/test (for sandbox/test credentials)
		// 3. Production: https://express.api.dhl.com/mydhlapi (requires production approval)
		// Using /landed-cost endpoint for duty, tax, and shipping charge calculations
		const baseUrl = dhlUseProduction
			? "https://express.api.dhl.com/mydhlapi"
			: "https://express.api.dhl.com/mydhlapi/test";
		const apiEndpoint = `${baseUrl}/landed-cost`;

		// Basic Auth: username = API_KEY, password = API_SECRET
		// Add required headers for DHL API
		const headers = {
			"Content-Type": "application/json",
			"Authorization": `Basic ${auth}`,
			"X-API-KEY": dhlApiKey,
			"x-version": "3.1.0",
		};

		console.log("DHL API Request:", {
			endpoint: apiEndpoint,
			environment: dhlUseProduction ? "production" : "test",
			hasBasicAuth: !!headers.Authorization,
			hasXApiKey: !!headers["X-API-KEY"],
			accountNumber: dhlAccountNumber?.substring(0, 3) + "***",
			itemsCount: body.items?.length,
		});

		const response = await fetch(apiEndpoint, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(body),
		});

		const data = await response.json();

		if (!response.ok) {
			console.error("DHL API Error Response:", {
				status: response.status,
				statusText: response.statusText,
				data: data,
				endpoint: apiEndpoint,
			});
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
