import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		// Use actual DHL credentials from environment variables
		// Mock server may not accept the test credentials (jai/viewer123)
		const dhlApiKey = process.env.DHL_API_KEY;
		const dhlApiSecret = process.env.DHL_API_SECRET;
		const dhlAccountNumber = process.env.DHL_ACCOUNT_NUMBER || "123456789";

		if (!dhlApiKey || !dhlApiSecret) {
			return NextResponse.json(
				{ error: "DHL API credentials not configured. Set DHL_API_KEY and DHL_API_SECRET in .env file." },
				{ status: 500 }
			);
		}

		const auth = Buffer.from(`${dhlApiKey}:${dhlApiSecret}`).toString("base64");

		// Build test request body for /rates endpoint
		// Note: /rates has a simpler structure than /landed-cost
		const plannedShippingDate = new Date(Date.now() + 86400000);
		const requestBody = {
			customerDetails: {
				shipperDetails: {
					postalCode: "PO31 8PB",
					cityName: "Cowes",
					countryCode: "GB",
				},
				receiverDetails: {
					postalCode: "94027",
					cityName: "Atherton",
					countryCode: "US",
				},
			},
			accounts: [
				{
					typeCode: "shipper",
					number: dhlAccountNumber,
				},
			],
			productCode: "P",
			plannedShippingDateAndTime: plannedShippingDate.toISOString().split('.')[0],
			unitOfMeasurement: "metric",
			isCustomsDeclarable: true,
			packages: [
				{
					typeCode: "3BX",
					weight: 1.5,
					dimensions: {
						length: 20,
						width: 15,
						height: 10,
					},
				},
			],
		};

		// Generate message reference and date as per DHL API requirements
		const messageReference = `test-${Date.now()}`;
		const messageReferenceDate = new Date().toISOString().split('T')[0];

		// Set up headers as per DHL API documentation
		const headers = {
			"Content-Type": "application/json",
			"Message-Reference": messageReference,
			"Message-Reference-Date": messageReferenceDate,
			"Plugin-Name": "RL-DHL-Calculator",
			"Plugin-Version": "1.0.0",
			"Shipping-System-Platform-Name": "Next.js",
			"Shipping-System-Platform-Version": "15.0.0",
			"Webstore-Platform-Name": "Custom",
			"Webstore-Platform-Version": "1.0.0",
			"x-version": "3.1.0",
			"Authorization": `Basic ${auth}`,
		};

		// Use POST /rates endpoint (test environment)
		const apiEndpoint = "https://express.api.dhl.com/mydhlapi/test/rates";

		console.log("DHL Test Environment Request:", {
			endpoint: apiEndpoint,
			method: "POST",
			messageReference: messageReference,
			accountNumber: dhlAccountNumber,
			hasApiKey: !!dhlApiKey,
			apiKeyLength: dhlApiKey?.length,
		});

		const response = await fetch(apiEndpoint, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(requestBody),
		});

		const data = await response.json();

		if (!response.ok) {
			console.error("DHL Mock API Error Response:", {
				status: response.status,
				statusText: response.statusText,
				data: data,
				endpoint: apiEndpoint,
				accountNumber: requestBody?.accounts?.[0]?.number,
				authHeader: `Basic ${auth.substring(0, 10)}...`,
			});

			// Log the full error details
			if (data.detail || data.reasons) {
				console.error("Full error details:", JSON.stringify(data, null, 2));
			}

			return NextResponse.json(
				{
					error: data.message || data.detail || "DHL API error",
					details: data,
					endpoint: apiEndpoint,
					note: "Test environment request. Ensure DHL_API_KEY, DHL_API_SECRET, and DHL_ACCOUNT_NUMBER are set correctly."
				},
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("DHL Mock API Error:", error);
		return NextResponse.json(
			{ error: "Failed to test mock API", details: error.message },
			{ status: 500 }
		);
	}
}

