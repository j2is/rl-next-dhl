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

	const allItems = packages.flatMap((pkg) => pkg.items);
	const uniqueItems = {};

	allItems.forEach((item) => {
		if (!uniqueItems[item.sku]) {
			uniqueItems[item.sku] = { ...item, quantity: 0 };
		}
		uniqueItems[item.sku].quantity += item.quantity || 1;
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

		const lineItem = {
			number: index + 1,
			description: item.customsDescription || item.title,
			unitPrice: roundToDecimal(priceInGBP, 5), // Round to 5 decimal places
			unitPriceCurrencyCode: "GBP",
			quantity: item.quantity,
			quantityType: "prt", // Required: prt (part) or box
			manufacturerCountry: sender.countryCode, // Must be 2-letter country code
			weight: roundToDecimal(item.weight || 0.1, 3), // Round to 3 decimal places (multipleOf: 0.001)
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

	const totalValueGBP = roundToDecimal(
		allItems.reduce((sum, item) => {
			const priceInGBP = convertToGBP(item.price, item.currency || "GBP");
			return sum + (priceInGBP * (item.quantity || 1));
		}, 0),
		5
	);

	return {
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
}
