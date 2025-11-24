/**
 * Human-readable labels for DHL API response codes
 */

export const dhlLabels = {
	// Charges
	SINSV: "Shipment Insurance",
	MACHG: "Merchandise Charge",
	SCUSV: "Shipment Custom Value",
	SPRQN: "Shipping Charge",
	STSCH: "Total Shipping Charge",
	
	// Fees
	MPF: "Merchandise Processing Fee",
	IDCA: "Import Declaration Processing Charge",
	IMPORT_PROCESSING_CHARGE: "Import Processing Charge",
	
	// Surcharges
	FF: "Fuel Surcharge",
	NX: "Demand Surcharge",
	FD: "GoGreen Plus - Carbon Reduced",
	
	// Services
	WW: "Advance Payment",
	WB: "Formal Clearance",
	II: "Insurance",
	
	// Taxes and Duties
	DUTY: "Customs Duty",
	TAX: "Tax",
	GST: "Goods and Services Tax (GST)",
	VAT: "Value Added Tax (VAT)",
	ADDITIONAL_DUTY: "Additional Duty",
	ADDITIONAL_DUTY_EO_RECIPROCAL: "Additional Duty (EO Reciprocal)",
	
	// Cost Components
	CIF: "Cost, Insurance & Freight (CIF)",
	FOB: "Free on Board (FOB)",
	
	// Totals
	"TOTAL DUTIES": "Total Duties",
	"TOTAL TAXES": "Total Taxes",
	"TOTAL FEES": "Total Fees",
	
	// Service Names
	"GOGREEN PLUS - CARBON REDUCED": "GoGreen Plus - Carbon Offset",
	"DEMAND SURCHARGE": "Peak Season Surcharge",
	"FUEL SURCHARGE": "Fuel Surcharge",
	"Advance Payment": "Advance Payment Service",
	"Formal Clearance": "Formal Customs Clearance",
};

/**
 * Get human-readable label for DHL code
 * @param {string} code - DHL API code
 * @returns {string} Human-readable label
 */
export function getDHLLabel(code) {
	return dhlLabels[code] || code;
}

/**
 * Format breakdown items with human-readable labels and filter out zero values
 * @param {Array} breakdown - Array of breakdown items from DHL API
 * @returns {Array} Formatted breakdown items
 */
export function formatBreakdown(breakdown) {
	if (!breakdown || !Array.isArray(breakdown)) return [];
	
	return breakdown
		.filter(item => {
			// Filter out zero-cost items
			const price = item.price || item.amount || 0;
			return price > 0;
		})
		.map(item => ({
			...item,
			label: getDHLLabel(item.name || item.typeCode || ""),
			displayPrice: formatPrice(item.price || item.amount, item.priceCurrency || item.currency),
		}));
}

/**
 * Format price with currency
 * @param {number} price - Price amount
 * @param {string} currency - Currency code
 * @returns {string} Formatted price string
 */
export function formatPrice(price, currency = "GBP") {
	if (price === undefined || price === null) return "N/A";
	
	const formatter = new Intl.NumberFormat("en-GB", {
		style: "currency",
		currency: currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	
	return formatter.format(price);
}

/**
 * Group breakdown items by category
 * @param {Array} breakdown - Array of breakdown items
 * @returns {Object} Grouped breakdown items
 */
export function groupBreakdown(breakdown) {
	const groups = {
		shipping: [],
		duties: [],
		taxes: [],
		fees: [],
		services: [],
		other: [],
	};
	
	breakdown.forEach(item => {
		const name = item.name || item.typeCode || "";
		const typeCode = item.typeCode || "";
		
		if (typeCode === "DUTY" || name.includes("DUTY") || name.includes("Duty")) {
			groups.duties.push(item);
		} else if (typeCode === "TAX" || name.includes("TAX") || name.includes("GST") || name.includes("VAT")) {
			groups.taxes.push(item);
		} else if (typeCode === "FEE" || name.includes("FEE") || name.includes("Fee") || name === "MPF" || name === "IDCA") {
			groups.fees.push(item);
		} else if (name.includes("SURCHARGE") || name.includes("Surcharge") || ["FF", "NX", "FD"].includes(item.serviceCode)) {
			groups.services.push(item);
		} else if (name.includes("SHIPPING") || name.includes("Shipping") || ["SPRQN", "STSCH"].includes(name)) {
			groups.shipping.push(item);
		} else if (["WW", "WB", "II"].includes(item.serviceCode)) {
			groups.services.push(item);
		} else {
			groups.other.push(item);
		}
	});
	
	return groups;
}

