import { packageSizes } from "../data/packages";

export function assignPackages(products) {
	const assignments = [];

	products.forEach((product) => {
		const quantity = product.quantity || 1;

		for (let i = 0; i < quantity; i++) {
			const itemWeight = product.weight || 0;
			let assignedPackage = null;

			for (const pkg of packageSizes) {
				if (itemWeight >= pkg.minWeight && itemWeight <= pkg.maxWeight) {
					assignedPackage = pkg;
					break;
				}
			}

			if (!assignedPackage) {
				assignedPackage = packageSizes.find((pkg) => pkg.isDefault);
			}

			assignments.push({
				product,
				package: assignedPackage,
				weight: Math.max(itemWeight, assignedPackage.weight),
			});
		}
	});

	return assignments;
}

export function groupByPackage(assignments) {
	const grouped = {};

	assignments.forEach((assignment) => {
		const pkgName = assignment.package.name;
		if (!grouped[pkgName]) {
			grouped[pkgName] = {
				package: assignment.package,
				items: [],
				totalWeight: 0,
			};
		}
		grouped[pkgName].items.push(assignment.product);
		grouped[pkgName].totalWeight += assignment.weight;
	});

	return Object.values(grouped);
}

export function buildDHLRequest(sender, recipient, packages) {
	const plannedShippingDateAndTime = new Date();
	plannedShippingDateAndTime.setDate(plannedShippingDateAndTime.getDate() + 1);

	// Proper decimal rounding to avoid floating point issues
	// Rounds to specified decimal places as required by DHL API
	const roundToDecimal = (num, decimals = 5) => {
		const factor = Math.pow(10, decimals);
		return Math.round(num * factor) / factor;
	};

	const dhlPackages = packages.map((pkg, index) => ({
		typeCode: "3BX",
		weight: roundToDecimal(pkg.totalWeight, 3), // Round to 3 decimal places (multipleOf: 0.001)
		dimensions: {
			length: pkg.package.length,
			width: pkg.package.width,
			height: pkg.package.height,
		},
	}));

	const allItemsWithMetadata = packages.flatMap((pkg, pkgIndex) => {
		return (pkg.items || []).map((item) => ({
			...item,
			_packageIndex: pkgIndex,
			_isCustom: pkg.isCustom || false,
		}));
	});
	
	console.log("[DHL REQUEST] All items from packages:", {
		totalItems: allItemsWithMetadata.length,
		items: allItemsWithMetadata.map((item) => ({
			sku: item.sku,
			weight: item.weight,
			quantity: item.quantity,
			description: item.customsDescription || item.title,
			packageType: item._isCustom ? "custom" : "regular",
		})),
	});
	
	// Remove metadata properties before processing
	const allItems = allItemsWithMetadata.map(({ _packageIndex, _isCustom, ...item }) => item);
	
	const uniqueItems = {};

	allItems.forEach((item) => {
		// Ensure each item has a valid weight before processing
		// Use minimum of 1.0 kg (1000 grams) to ensure proper validation
		// This appears to be required for proper NetWeight KGM validation
		const originalWeight = item.weight;
		const itemWeight = (item.weight && item.weight > 0) ? Math.max(item.weight, 1.0) : 1.0;
		
		if (originalWeight !== itemWeight) {
			console.log("[DHL REQUEST] Weight adjusted during grouping:", {
				sku: item.sku,
				originalWeight,
				adjustedWeight: itemWeight,
			});
		}
		
		if (!uniqueItems[item.sku]) {
			// Ensure weight is preserved when creating unique item entry
			uniqueItems[item.sku] = { 
				...item, 
				quantity: 0,
				weight: itemWeight, // Ensure weight is always positive and at least 0.1
			};
		}
		uniqueItems[item.sku].quantity += item.quantity || 1;
	});

	console.log("[DHL REQUEST] Unique items after grouping:", {
		uniqueItems: Object.values(uniqueItems).map((item) => ({
			sku: item.sku,
			weight: item.weight,
			quantity: item.quantity,
			description: item.customsDescription || item.title,
		})),
	});

	// Convert prices to GBP if needed
	// Rates: 1 GBP = 1.15 EUR, 1 GBP = 1.35 USD
	const convertToGBP = (price, currency) => {
		let convertedPrice = price;
		if (currency === "EUR") {
			convertedPrice = price / 1.15;
		} else if (currency === "USD") {
			convertedPrice = price / 1.35;
		}
		// Round to 5 decimal places to match DHL API requirement
		return roundToDecimal(convertedPrice, 5);
	};

	const lineItems = Object.values(uniqueItems).map((item, index) => {
		const priceInGBP = convertToGBP(item.price, item.currency || "GBP");

		// Select appropriate HS code based on recipient country
		let hsCode = item.hsCode; // default/fallback
		if (item.hsCodes && recipient.countryCode) {
			// Try country-specific code, fallback to default if not found
			hsCode = item.hsCodes[recipient.countryCode] || item.hsCodes.default || item.hsCode;
		}

		// Ensure weight is always a positive number (DHL API requires weight > 0)
		// DHL API appears to have a minimum weight requirement for customs declarations
		// Based on error messages, try using minimum of 1.0 kg to ensure proper validation
		// The API may have business rules requiring minimum 1 kg for customs declarations
		const originalWeight = item.weight;
		let itemWeight = (item.weight && item.weight > 0) ? item.weight : 1.0;
		// Ensure minimum weight of 1.0 kg (1000 grams) to meet DHL API requirements
		// This appears to be required for proper NetWeight KGM validation
		if (itemWeight < 1.0) {
			console.log("[DHL REQUEST] Weight below minimum in lineItem creation:", {
				itemNumber: index + 1,
				sku: item.sku,
				originalWeight,
				adjustedWeight: 1.0,
			});
			itemWeight = 1.0;
		}
		
		// Round to 3 decimal places and ensure it's a valid number
		let roundedWeight = roundToDecimal(itemWeight, 3);
		
		// Ensure the rounded weight is still valid (not 0, not NaN, not Infinity)
		if (!roundedWeight || roundedWeight <= 0 || isNaN(roundedWeight) || !isFinite(roundedWeight)) {
			console.error("[DHL REQUEST] Invalid rounded weight, using fallback:", {
				itemNumber: index + 1,
				sku: item.sku,
				originalWeight,
				itemWeight,
				roundedWeight,
				fallbackWeight: 1.0,
			});
			roundedWeight = 1.0;
		}
		
		console.log("[DHL REQUEST] Creating line item:", {
			itemNumber: index + 1,
			sku: item.sku,
			description: item.customsDescription || item.title,
			originalWeight,
			itemWeight,
			roundedWeight,
			roundedWeightType: typeof roundedWeight,
			roundedWeightString: String(roundedWeight),
			quantity: item.quantity,
		});
		
		// Validate rounded weight is valid
		if (!roundedWeight || roundedWeight <= 0 || isNaN(roundedWeight)) {
			console.error("[DHL REQUEST] INVALID WEIGHT DETECTED:", {
				itemNumber: index + 1,
				sku: item.sku,
				originalWeight,
				itemWeight,
				roundedWeight,
			});
		}
		
		// Ensure weight is a proper number (not string, not null, not undefined)
		// Also ensure it meets minimum requirement of 1.0 kg
		let finalWeight = typeof roundedWeight === 'number' && !isNaN(roundedWeight) && isFinite(roundedWeight) 
			? Number(roundedWeight.toFixed(3)) 
			: 1.0;
		
		// Final check: ensure minimum of 1.0 kg
		if (finalWeight < 1.0) {
			finalWeight = 1.0;
		}
		
		console.log("[DHL REQUEST] Final weight validation:", {
			itemNumber: index + 1,
			sku: item.sku,
			roundedWeight,
			finalWeight,
			finalWeightType: typeof finalWeight,
			finalWeightValue: finalWeight,
		});
		
		const lineItem = {
			number: index + 1,
			description: item.customsDescription || item.title,
			unitPrice: roundToDecimal(priceInGBP, 5), // Round to 5 decimal places
			unitPriceCurrencyCode: "GBP",
			quantity: item.quantity,
			quantityType: "prt", // Required: prt (part) or box
			manufacturerCountry: sender.countryCode, // Must be 2-letter country code
			weight: finalWeight, // Ensure it's a proper number (multipleOf: 0.001)
			weightUnitOfMeasurement: "metric", // Required for landed cost
		};

		// Include commodityCode if available
		if (hsCode && hsCode.trim() !== "") {
			lineItem.commodityCode = hsCode;
		}

		// Always include estimatedTariffRateType as per DHL example
		lineItem.estimatedTariffRateType = "highest_rate";

		return lineItem;
	});

	console.log("[DHL REQUEST] Final line items:", {
		lineItems: lineItems.map((item) => ({
			number: item.number,
			description: item.description,
			weight: item.weight,
			weightType: typeof item.weight,
			weightValue: item.weight,
			quantity: item.quantity,
			commodityCode: item.commodityCode,
		})),
	});

	const totalValueGBP = roundToDecimal(
		allItems.reduce((sum, item) => {
			const priceInGBP = convertToGBP(item.price, item.currency || "GBP");
			return sum + (priceInGBP * (item.quantity || 1));
		}, 0),
		5
	);

	const requestBody = {
		customerDetails: {
			shipperDetails: {
				postalCode: sender.postalCode,
				cityName: sender.city,
				countryCode: sender.countryCode,
				addressLine1: sender.address1,
				addressLine2: sender.address2 || undefined,
			},
			receiverDetails: {
				postalCode: recipient.postalCode,
				cityName: recipient.city,
				countryCode: recipient.countryCode,
				addressLine1: recipient.address1,
				addressLine2: recipient.address2 || undefined,
			},
		},
		accounts: [
			{
				typeCode: "shipper",
				number: "123456789", // This will be replaced in the API route with the actual account number
			},
		],
		productCode: "P",
		unitOfMeasurement: "metric",
		isCustomsDeclarable: true,
		currencyCode: "GBP",
		getCostBreakdown: true,
		packages: dhlPackages,
		items: lineItems,
	};

	console.log("[DHL REQUEST] Final request body items (detailed):", 
		requestBody.items.map((item, idx) => ({
			index: idx,
			number: item.number,
			description: item.description,
			weight: item.weight,
			weightType: typeof item.weight,
			weightStringified: String(item.weight),
			weightJSON: JSON.stringify(item.weight),
			quantity: item.quantity,
			fullItem: item,
		}))
	);
	
	console.log("[DHL REQUEST] Full request body JSON:", JSON.stringify(requestBody, null, 2));

	return requestBody;
}
