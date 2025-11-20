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

	const dhlPackages = packages.map((pkg, index) => ({
		typeCode: "3BX",
		weight: pkg.totalWeight,
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
		if (currency === "EUR") {
			return price / 1.15;
		} else if (currency === "USD") {
			return price / 1.35;
		}
		return price;
	};

	const lineItems = Object.values(uniqueItems).map((item) => {
		const priceInGBP = convertToGBP(item.price, item.currency || "GBP");
		return {
			number: 1,
			description: item.customsDescription || item.title,
			price: priceInGBP,
			quantity: {
				value: item.quantity,
				unitOfMeasurement: "PCS",
			},
			commodityCodes: [
				{
					typeCode: "outbound",
					value: item.hsCode || "",
				},
			],
			exportReasonType: "permanent",
			manufacturerCountry: item.country || sender.countryCode,
			weight: {
				netValue: item.weight || 0.1,
				grossValue: item.weight || 0.1,
			},
		};
	});

	const totalValueGBP = allItems.reduce((sum, item) => {
		const priceInGBP = convertToGBP(item.price, item.currency || "GBP");
		return sum + (priceInGBP * (item.quantity || 1));
	}, 0);

	return {
		customerDetails: {
			shipperDetails: {
				postalAddress: {
					postalCode: sender.postalCode,
					cityName: sender.city,
					countryCode: sender.countryCode,
					addressLine1: sender.address1,
					addressLine2: sender.address2 || undefined,
				},
				contactInformation: {
					email: sender.email,
					phone: sender.phone,
					companyName: sender.company,
					fullName: sender.name,
				},
			},
			receiverDetails: {
				postalAddress: {
					postalCode: recipient.postalCode,
					cityName: recipient.city,
					countryCode: recipient.countryCode,
					addressLine1: recipient.address1,
					addressLine2: recipient.address2 || undefined,
				},
				contactInformation: {
					email: recipient.email || "customer@example.com",
					phone: recipient.phone || "+1234567890",
					companyName: recipient.company || undefined,
					fullName: recipient.name,
				},
			},
		},
		accounts: [
			{
				typeCode: "shipper",
				number: "123456789",
			},
		],
		productCode: "P",
		plannedShippingDateAndTime: plannedShippingDateAndTime.toISOString().split('.')[0],
		unitOfMeasurement: "metric",
		isCustomsDeclarable: true,
		monetaryAmount: [
			{
				typeCode: "declared",
				value: totalValueGBP,
				currency: "GBP",
			},
		],
		requestAllValueAddedServices: false,
		returnStandardProductsOnly: false,
		nextBusinessDay: false,
		packages: dhlPackages,
		content: {
			packages: dhlPackages.map((pkg, index) => ({
				typeCode: "3BX",
				weight: pkg.weight,
				dimensions: pkg.dimensions,
			})),
			isCustomsDeclarable: true,
			declaredValue: totalValueGBP,
			declaredValueCurrency: "GBP",
			exportDeclaration: {
				lineItems: lineItems,
				invoice: {
					number: "INV-" + Date.now(),
					date: new Date().toISOString().split('T')[0],
				},
				exportReason: "sale",
				exportReasonType: "permanent",
			},
			description: "Leather and canvas goods",
			incoterm: "DAP",
		},
	};
}
