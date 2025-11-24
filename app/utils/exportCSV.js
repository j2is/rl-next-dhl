import { getDHLLabel, groupBreakdown } from "./dhlLabelMapping";

/**
 * Export landed cost breakdown to CSV
 * @param {Object} results - DHL API response
 * @param {Object} requestData - Request data with sender/recipient info
 * @returns {string} CSV string
 */
export function exportLandedCostToCSV(results, requestData) {
	if (!results || !results.products || results.products.length === 0) {
		return "";
	}

	const lines = [];
	const product = results.products[0]; // Usually one product for landed cost

	// Header
	lines.push("DHL Express Landed Cost Breakdown");
	lines.push("");

	// Shipment Info
	if (requestData?.customerDetails) {
		lines.push("Shipment Information");
		const shipper = requestData.customerDetails.shipperDetails;
		const receiver = requestData.customerDetails.receiverDetails;
		
		if (shipper) {
			lines.push(`From,${shipper.cityName || ""} ${shipper.postalCode || ""},${shipper.countryCode || ""}`);
		}
		if (receiver) {
			lines.push(`To,${receiver.cityName || ""} ${receiver.postalCode || ""},${receiver.countryCode || ""}`);
		}
		lines.push("");
	}

	// Total Cost
	if (product.totalPrice && product.totalPrice[0]) {
		const total = product.totalPrice[0];
		lines.push("Total Landed Cost");
		lines.push(`Amount,${formatCSVNumber(total.price)}`);
		lines.push(`Currency,${total.priceCurrency || "GBP"}`);
		lines.push("");
	}

	// Detailed Breakdown
	if (product.detailedPriceBreakdown && product.detailedPriceBreakdown.length > 0) {
		lines.push("Cost Breakdown");
		lines.push("Category,Description,Amount,Currency");

		product.detailedPriceBreakdown.forEach((priceBreakdown) => {
			if (priceBreakdown.breakdown) {
				const nonZeroItems = priceBreakdown.breakdown.filter(
					(item) => (item.price || 0) > 0
				);
				const grouped = groupBreakdown(nonZeroItems);

				// Shipping Charges
				if (grouped.shipping.length > 0) {
					grouped.shipping.forEach((item) => {
						lines.push(
							`Shipping,${escapeCSV(getDHLLabel(item.name || item.typeCode))},${formatCSVNumber(item.price)},${item.priceCurrency || "GBP"}`
						);
					});
				}

				// Duties
				if (grouped.duties.length > 0) {
					grouped.duties.forEach((item) => {
						lines.push(
							`Duties,${escapeCSV(getDHLLabel(item.name || item.typeCode))},${formatCSVNumber(item.price)},${item.priceCurrency || "GBP"}`
						);
					});
				}

				// Taxes
				if (grouped.taxes.length > 0) {
					grouped.taxes.forEach((item) => {
						lines.push(
							`Taxes,${escapeCSV(getDHLLabel(item.name || item.typeCode))},${formatCSVNumber(item.price)},${item.priceCurrency || "GBP"}`
						);
					});
				}

				// Fees
				if (grouped.fees.length > 0) {
					grouped.fees.forEach((item) => {
						lines.push(
							`Fees,${escapeCSV(getDHLLabel(item.name || item.typeCode))},${formatCSVNumber(item.price)},${item.priceCurrency || "GBP"}`
						);
					});
				}

				// Services & Surcharges
				if (grouped.services.length > 0) {
					grouped.services.forEach((item) => {
						lines.push(
							`Services & Surcharges,${escapeCSV(getDHLLabel(item.name || item.typeCode))},${formatCSVNumber(item.price)},${item.priceCurrency || "GBP"}`
						);
					});
				}

				// Other
				if (grouped.other.length > 0) {
					grouped.other.forEach((item) => {
						lines.push(
							`Other,${escapeCSV(getDHLLabel(item.name || item.typeCode))},${formatCSVNumber(item.price)},${item.priceCurrency || "GBP"}`
						);
					});
				}
			}
		});
		lines.push("");
	}

	// Item-level Breakdown
	if (product.items && product.items.length > 0) {
		lines.push("Item Cost Breakdown");
		lines.push("Item,Description,Amount,Currency");

		product.items.forEach((item) => {
			const nonZeroBreakdown =
				item.breakdown?.filter((b) => (b.price || 0) > 0) || [];
			if (nonZeroBreakdown.length > 0) {
				nonZeroBreakdown.forEach((breakdownItem) => {
					lines.push(
						`Item #${item.number},${escapeCSV(getDHLLabel(breakdownItem.name || breakdownItem.typeCode))},${formatCSVNumber(breakdownItem.price)},${breakdownItem.priceCurrency || "GBP"}`
					);
				});
			}
		});
		lines.push("");
	}

	// Footer
	lines.push("");
	lines.push(`Generated,${new Date().toLocaleString()}`);
	lines.push("Source,DHL Express MyDHL API");

	return lines.join("\n");
}

/**
 * Escape CSV special characters
 * @param {string} str
 * @returns {string}
 */
function escapeCSV(str) {
	if (!str) return "";
	const stringValue = String(str);
	// If contains comma, quote, or newline, wrap in quotes and escape quotes
	if (
		stringValue.includes(",") ||
		stringValue.includes('"') ||
		stringValue.includes("\n")
	) {
		return `"${stringValue.replace(/"/g, '""')}"`;
	}
	return stringValue;
}

/**
 * Format number for CSV
 * @param {number} num
 * @returns {string}
 */
function formatCSVNumber(num) {
	if (num === undefined || num === null) return "";
	return num.toFixed(2);
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV string
 * @param {string} filename - File name
 */
export function downloadCSV(csvContent, filename = "landed-cost-breakdown.csv") {
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);

	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	link.style.visibility = "hidden";

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Clean up the URL object
	URL.revokeObjectURL(url);
}

