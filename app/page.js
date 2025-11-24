"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import AddressSelector from "./components/AddressSelector/AddressSelector";
import ProductCatalog from "./components/ProductCatalog/ProductCatalog";
import ResultsDisplay from "./components/ResultsDisplay/ResultsDisplay";
import { senderAddress, recipientAddresses } from "./data/addresses";
import { assignPackages, groupByPackage, buildDHLRequest } from "./utils/packageAssignment";
import { packageSizes } from "./data/packages";
import media from "./lib/media";
import CalculateIcon from "@mui/icons-material/Calculate";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const PageStyles = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;

  ${media.tabletPortraitAndBelow`
    padding: 20px 15px;
  `}

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 30px;
    text-align: center;
  }

  .sender-info {
    padding: 20px;
    background: #f5f5f5;
    border: 1px solid #000;
    margin-bottom: 30px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .sender-info h2 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .sender-info p {
    margin: 5px 0;
    font-size: 14px;
  }

  .calculate-button {
    width: 100%;
    padding: 15px;
    background: #000;
    color: #fff;
    border: none;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 30px;

    ${media.hoverOnly`
      &:hover {
        background: #333;
      }
    `}

    &:disabled {
      background: #999;
      cursor: not-allowed;
    }
  }

  .test-button {
    width: 100%;
    padding: 15px;
    background: #666;
    color: #fff;
    border: none;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 30px;

    ${media.hoverOnly`
      &:hover {
        background: #555;
      }
    `}

    &:disabled {
      background: #999;
      cursor: not-allowed;
    }
  }

  .package-summary {
    padding: 20px;
    border: 1px solid #000;
    margin-bottom: 30px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .package-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .package-summary h2 {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
  }

  .add-package-button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 15px;
    background: #000;
    color: #fff;
    border: none;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    ${media.hoverOnly`
      &:hover {
        background: #333;
      }
    `}
  }

  .package-item {
    padding: 10px 0;
    border-bottom: 1px solid #000;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .package-item:last-child {
    border-bottom: none;
  }

  .package-name {
    font-weight: 700;
    margin-bottom: 5px;
  }

  .package-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
  }

  .package-table th {
    text-align: left;
    padding: 10px;
    border: 1px solid #000;
    background: #f5f5f5;
    font-weight: 700;
    font-size: 14px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .package-table td {
    padding: 10px;
    border: 1px solid #000;
    font-size: 14px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .package-table tr:nth-child(even) {
    background: #fafafa;
  }

  .package-name-cell {
    min-width: 120px;
  }

  .package-select {
    width: 100%;
    padding: 5px;
    border: 1px solid #000;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;
    background: #fff;
    cursor: pointer;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .package-name-input {
    width: 100%;
    padding: 5px;
    border: 1px solid #000;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .dimension-inputs {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .dimension-input {
    width: 60px;
    padding: 5px;
    border: 1px solid #000;
    text-align: center;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 13px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .weight-input {
    width: 80px;
    padding: 5px;
    border: 1px solid #000;
    text-align: center;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 13px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .remove-package-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    background: #dc3545;
    color: #fff;
    border: none;
    cursor: pointer;
    border-radius: 3px;

    ${media.hoverOnly`
      &:hover {
        background: #c82333;
      }
    `}
  }

  .currency-selector {
    padding: 20px;
    border: 1px solid #000;
    margin-bottom: 30px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .currency-selector h2 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 15px;
  }

  .currency-control {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .currency-control label {
    font-size: 14px;
    font-weight: 500;
  }

  .currency-control select {
    padding: 8px 12px;
    border: 1px solid #000;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;
    background: #fff;
    cursor: pointer;
    min-width: 120px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .loading {
    text-align: center;
    padding: 30px;
  }
`;

const obfuscateEmail = (email) => {
	if (!email) return "";
	const [localPart, domain] = email.split("@");
	if (!domain) return email;
	const visibleChars = Math.max(2, Math.floor(localPart.length * 0.3));
	const obfuscatedLocal = localPart.substring(0, visibleChars) + "*".repeat(localPart.length - visibleChars);
	const [domainName, tld] = domain.split(".");
	const visibleDomain = Math.max(2, Math.floor(domainName.length * 0.3));
	const obfuscatedDomain = domainName.substring(0, visibleDomain) + "*".repeat(domainName.length - visibleDomain);
	return `${obfuscatedLocal}@${obfuscatedDomain}.${tld}`;
};

const obfuscatePhone = (phone) => {
	if (!phone) return "";
	const digits = phone.replace(/\D/g, "");
	if (digits.length <= 4) return phone;

	// Keep first 2-3 characters and last 4 digits visible
	const visibleStart = Math.min(3, Math.max(2, Math.floor(digits.length * 0.2)));
	const visibleEnd = 4;

	// Find where digits start in the original string
	const firstDigitIndex = phone.search(/\d/);
	const prefix = phone.substring(0, firstDigitIndex);

	// Extract visible parts
	const startDigits = digits.substring(0, visibleStart);
	const endDigits = digits.substring(digits.length - visibleEnd);
	const middleStars = "*".repeat(Math.max(0, digits.length - visibleStart - visibleEnd));

	return prefix + startDigits + middleStars + endDigits;
};

export default function Home() {
	const [recipientAddress, setRecipientAddress] = useState(recipientAddresses[0]);
	const [selectedProducts, setSelectedProducts] = useState([]);
	const [results, setResults] = useState(null);
	const [requestData, setRequestData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [currency, setCurrency] = useState("GBP");
	const [packageOverrides, setPackageOverrides] = useState({}); // { packageIndex: { package: {...}, items: [...] } }
	const [customPackages, setCustomPackages] = useState([]); // Array of custom package objects
	const [removedPackages, setRemovedPackages] = useState(new Set()); // Set of package indices that have been removed

	// Reset package overrides when selected products change significantly
	useEffect(() => {
		// Only reset if the number of packages would change significantly
		// This prevents resetting on every small change
		const newAssignments = selectedProducts.length > 0 ? assignPackages(selectedProducts) : [];
		const newGrouped = selectedProducts.length > 0 ? groupByPackage(newAssignments) : [];

		// If package count changed significantly, reset overrides and removed packages
		const currentPackageCount = Object.keys(packageOverrides).length + customPackages.length + initialGrouped.length;
		if (Math.abs(currentPackageCount - newGrouped.length) > 2) {
			setPackageOverrides({});
			setRemovedPackages(new Set());
		}
	}, [selectedProducts.length]);

	const handleTestMockCall = async () => {
		setLoading(true);
		setResults(null);
		setRequestData(null);

		try {
			// Build POST request body for test environment
			// Using your actual DHL credentials from environment variables
			const requestData = {
				method: "POST",
				endpoint: "https://express.api.dhl.com/mydhlapi/test/rates",
				note: "Using your DHL API credentials on test environment",
			};

			setRequestData(requestData);

			// Call our server-side endpoint to avoid CORS issues
			// The endpoint uses test credentials (jai/viewer123) and makes a POST request
			const response = await fetch("/api/dhl-rates-test", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({}), // Server will use default test data
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.error || "Failed to test DHL API");
				console.error("Test API Error:", data);
			} else {
				setResults(data);
				toast.success("Test API call successful");
			}
		} catch (error) {
			console.error("Test API Error:", error);
			toast.error("An error occurred while testing DHL API");
		} finally {
			setLoading(false);
		}
	};

	const handleCalculate = async () => {
		if (selectedProducts.length === 0) {
			toast.error("Please select at least one product");
			return;
		}

		if (!recipientAddress.countryCode) {
			toast.error("Please select a valid recipient address");
			return;
		}

		setLoading(true);
		setResults(null);
		setRequestData(null);

		try {
			// Use the same redistribution logic as display
			const groupedPackages = getGroupedPackages();

			const dhlRequest = buildDHLRequest(senderAddress, recipientAddress, groupedPackages);

			setRequestData(dhlRequest);

			const response = await fetch("/api/dhl-rates", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(dhlRequest),
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.error || "Failed to calculate rates");
				console.error("API Error:", data);
			} else {
				setResults(data);
				toast.success("Rates calculated successfully");
			}
		} catch (error) {
			console.error("Calculate Error:", error);
			toast.error("An error occurred while calculating rates");
		} finally {
			setLoading(false);
		}
	};

	// Calculate initial package assignments
	const initialAssignments = selectedProducts.length > 0 ? assignPackages(selectedProducts) : [];
	const initialGrouped = selectedProducts.length > 0 ? groupByPackage(initialAssignments) : [];

	// Function to redistribute items from removed packages to existing packages
	const redistributeItemsToExistingPackages = (itemsToRedistribute, existingPackages) => {
		// Flatten items with quantities into individual items
		const itemsToAssign = [];
		itemsToRedistribute.forEach((item) => {
			const quantity = item.quantity || 1;
			for (let i = 0; i < quantity; i++) {
				itemsToAssign.push({ ...item, quantity: 1 });
			}
		});

		const updatedPackages = existingPackages.map((pkg) => ({
			...pkg,
			items: [...(pkg.items || [])],
		}));

		// Try to fit each item into an existing package
		const unassignedItems = [];

		itemsToAssign.forEach((item) => {
			const itemWeight = item.weight || 0;
			let assigned = false;

			// Try to find a package that can fit this item
			for (const pkg of updatedPackages) {
				// Calculate current items weight
				const currentItemsWeight = pkg.items.reduce((sum, i) => {
					return sum + ((i.weight || 0) * (i.quantity || 1));
				}, 0);

				// Calculate new total weight if we add this item
				const newItemsWeight = currentItemsWeight + itemWeight;
				const newTotalWeight = Math.max(newItemsWeight, pkg.package.weight);

				// Check if item fits in this package's weight range
				if (itemWeight >= pkg.package.minWeight && itemWeight <= pkg.package.maxWeight) {
					// Check if adding this item would exceed max weight (with some tolerance)
					if (newTotalWeight <= pkg.package.maxWeight * 1.1) { // 10% tolerance
						// Check if we can merge with existing item of same SKU
						const existingItemIndex = pkg.items.findIndex((i) => i.sku === item.sku);
						if (existingItemIndex >= 0) {
							// Merge quantities
							pkg.items[existingItemIndex].quantity = (pkg.items[existingItemIndex].quantity || 1) + 1;
						} else {
							// Add as new item
							pkg.items.push(item);
						}
						pkg.totalWeight = newTotalWeight;
						assigned = true;
						break;
					}
				}
			}

			if (!assigned) {
				unassignedItems.push(item);
			}
		});

		// Group unassigned items by SKU to restore quantities
		const groupedUnassigned = {};
		unassignedItems.forEach((item) => {
			if (!groupedUnassigned[item.sku]) {
				groupedUnassigned[item.sku] = { ...item, quantity: 0 };
			}
			groupedUnassigned[item.sku].quantity += 1;
		});

		return { updatedPackages, unassignedItems: Object.values(groupedUnassigned) };
	};

	// Merge with manual overrides and custom packages
	const getGroupedPackages = () => {
		const merged = [];

		// Add custom packages first
		customPackages.forEach((customPkg) => {
			merged.push({
				package: customPkg.package,
				items: customPkg.items || [],
				totalWeight: customPkg.totalWeight || customPkg.package.weight,
				isCustom: true,
				customIndex: customPkg.index,
			});
		});

		// Collect items from removed packages
		const itemsFromRemovedPackages = [];
		removedPackages.forEach((removedIndex) => {
			const removedPkg = initialGrouped[removedIndex];
			if (removedPkg && removedPkg.items) {
				removedPkg.items.forEach((item) => {
					itemsFromRemovedPackages.push(item);
				});
			}
		});

		// Process initial packages - use override if exists, otherwise use original
		// Skip packages that have been removed
		initialGrouped.forEach((pkg, index) => {
			if (removedPackages.has(index)) {
				return; // Skip removed packages
			}

			if (packageOverrides[index]) {
				// Use overridden package
				merged.push({
					package: packageOverrides[index].package,
					items: packageOverrides[index].items || pkg.items,
					totalWeight: packageOverrides[index].totalWeight || pkg.totalWeight,
					originalIndex: index,
				});
			} else {
				// Use original package
				merged.push({
					...pkg,
					items: [...(pkg.items || [])],
				});
			}
		});

		// Redistribute items from removed packages to existing packages
		if (itemsFromRemovedPackages.length > 0 && merged.length > 0) {
			const { updatedPackages, unassignedItems } = redistributeItemsToExistingPackages(
				itemsFromRemovedPackages,
				merged
			);

			// If there are still unassigned items, create new packages for them
			if (unassignedItems.length > 0) {
				const reassignments = assignPackages(unassignedItems);
				const reassignedGrouped = groupByPackage(reassignments);
				return [...updatedPackages, ...reassignedGrouped];
			}

			return updatedPackages;
		}

		return merged;
	};

	const groupedPackages = getGroupedPackages();

	const handlePackageChange = (packageIndex, newPackageName, isCustom = false) => {
		const newPackage = packageSizes.find((pkg) => pkg.name === newPackageName);
		if (!newPackage) return;

		if (isCustom) {
			// Update custom package
			setCustomPackages((prev) =>
				prev.map((pkg) => {
					if (pkg.index === packageIndex) {
						const itemsWeight = (pkg.items || []).reduce((sum, item) => sum + (item.weight * (item.quantity || 1)), 0);
						const newTotalWeight = Math.max(itemsWeight, newPackage.weight);
						return {
							...pkg,
							package: newPackage,
							totalWeight: newTotalWeight,
						};
					}
					return pkg;
				})
			);
		} else {
			// Find the package in initialGrouped
			const currentPkg = initialGrouped[packageIndex];
			if (!currentPkg) return;

			// Calculate new total weight based on items
			const itemsWeight = currentPkg.items.reduce((sum, item) => sum + (item.weight * (item.quantity || 1)), 0);
			const newTotalWeight = Math.max(itemsWeight, newPackage.weight);

			setPackageOverrides((prev) => ({
				...prev,
				[packageIndex]: {
					package: newPackage,
					items: currentPkg.items,
					totalWeight: newTotalWeight,
				},
			}));
		}
	};

	const handleAddCustomPackage = () => {
		const newCustomPackage = {
			index: Date.now(),
			package: {
				name: "Custom",
				length: 30,
				width: 20,
				height: 10,
				weight: 0.5,
				minWeight: 0,
				maxWeight: 10,
				isDefault: false,
			},
			items: [],
			totalWeight: 0.5,
		};
		setCustomPackages((prev) => [...prev, newCustomPackage]);
	};

	const handleRemovePackage = (packageIndex, isCustom = false) => {
		if (isCustom) {
			setCustomPackages((prev) => prev.filter((pkg) => pkg.index !== packageIndex));
		} else {
			// Mark package as removed
			setRemovedPackages((prev) => new Set([...prev, packageIndex]));
			// Also clear any override for this package
			setPackageOverrides((prev) => {
				const newOverrides = { ...prev };
				delete newOverrides[packageIndex];
				return newOverrides;
			});
		}
	};

	const handleUpdateCustomPackage = (customIndex, field, value) => {
		setCustomPackages((prev) =>
			prev.map((pkg) => {
				if (pkg.index === customIndex) {
					if (field === "name") {
						return {
							...pkg,
							package: { ...pkg.package, name: value },
						};
					} else if (["length", "width", "height", "weight", "minWeight", "maxWeight"].includes(field)) {
						return {
							...pkg,
							package: { ...pkg.package, [field]: parseFloat(value) || 0 },
						};
					} else if (field === "totalWeight") {
						return { ...pkg, totalWeight: parseFloat(value) || 0 };
					}
				}
				return pkg;
			})
		);
	};

	return (
		<PageStyles>
			<h1>DHL Landed Cost Calculator | Ratsey & Lapthorn</h1>

			<div className="sender-info">
				<h2>Sender Information</h2>
				<p><strong>{senderAddress.company}</strong></p>
				<p>{senderAddress.address1}</p>
				<p>{senderAddress.address2}</p>
				<p>{senderAddress.postalCode} {senderAddress.city}</p>
				<p>{senderAddress.country}</p>
				<p>{obfuscateEmail(senderAddress.email)}</p>
				<p>{obfuscatePhone(senderAddress.phone)}</p>
			</div>

			<AddressSelector onAddressChange={setRecipientAddress} />

			<div className="currency-selector">
				<h2>Currency</h2>
				<div className="currency-control">
					<label htmlFor="currency-select">Select Currency:</label>
					<select
						id="currency-select"
						value={currency}
						onChange={(e) => setCurrency(e.target.value)}
					>
						<option value="GBP">£ GBP</option>
						<option value="EUR">€ EUR</option>
						<option value="USD">$ USD</option>
					</select>
				</div>
			</div>

			<ProductCatalog
				onSelectionChange={setSelectedProducts}
				currency={currency}
			/>

			{groupedPackages.length > 0 && (
				<div className="package-summary">
					<div className="package-header">
						<h2>Package Assignment</h2>
						<button
							type="button"
							className="add-package-button"
							onClick={handleAddCustomPackage}
						>
							<AddIcon />
							Add Package
						</button>
					</div>
					<table className="package-table">
						<thead>
							<tr>
								<th>Box Type</th>
								<th>Items</th>
								<th>Dimensions (cm)</th>
								<th>Box Weight (kg)</th>
								<th>Total Weight (kg)</th>
								<th>Min Weight (kg)</th>
								<th>Max Weight (kg)</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{groupedPackages.map((pkg, index) => {
								const isCustom = pkg.isCustom;
								const packageKey = isCustom ? pkg.customIndex : (pkg.originalIndex !== undefined ? pkg.originalIndex : index);

								return (
									<tr key={isCustom ? `custom-${pkg.customIndex}` : `pkg-${packageKey}`}>
										<td className="package-name-cell">
											{isCustom ? (
												<input
													type="text"
													value={pkg.package.name}
													onChange={(e) => handleUpdateCustomPackage(pkg.customIndex, "name", e.target.value)}
													className="package-name-input"
												/>
											) : (
												<select
													value={pkg.package.name}
													onChange={(e) => handlePackageChange(packageKey, e.target.value, false)}
													className="package-select"
												>
													{packageSizes.map((pkgSize) => (
														<option key={pkgSize.name} value={pkgSize.name}>
															{pkgSize.name}
														</option>
													))}
												</select>
											)}
										</td>
										<td>{pkg.items.length}</td>
										<td>
											{isCustom ? (
												<div className="dimension-inputs">
													<input
														type="number"
														value={pkg.package.length}
														onChange={(e) => handleUpdateCustomPackage(pkg.customIndex, "length", e.target.value)}
														step="0.1"
														className="dimension-input"
													/>
													<span> x </span>
													<input
														type="number"
														value={pkg.package.width}
														onChange={(e) => handleUpdateCustomPackage(pkg.customIndex, "width", e.target.value)}
														step="0.1"
														className="dimension-input"
													/>
													<span> x </span>
													<input
														type="number"
														value={pkg.package.height}
														onChange={(e) => handleUpdateCustomPackage(pkg.customIndex, "height", e.target.value)}
														step="0.1"
														className="dimension-input"
													/>
												</div>
											) : (
												`${pkg.package.length} x ${pkg.package.width} x ${pkg.package.height}`
											)}
										</td>
										<td>
											{isCustom ? (
												<input
													type="number"
													value={pkg.package.weight}
													onChange={(e) => handleUpdateCustomPackage(pkg.customIndex, "weight", e.target.value)}
													step="0.01"
													className="weight-input"
												/>
											) : (
												pkg.package.weight.toFixed(3)
											)}
										</td>
										<td>
											{isCustom ? (
												<input
													type="number"
													value={pkg.totalWeight}
													onChange={(e) => handleUpdateCustomPackage(pkg.customIndex, "totalWeight", e.target.value)}
													step="0.01"
													className="weight-input"
												/>
											) : (
												pkg.totalWeight.toFixed(3)
											)}
										</td>
										<td>
											{isCustom ? (
												<input
													type="number"
													value={pkg.package.minWeight}
													onChange={(e) => handleUpdateCustomPackage(pkg.customIndex, "minWeight", e.target.value)}
													step="0.01"
													className="weight-input"
												/>
											) : (
												pkg.package.minWeight.toFixed(3)
											)}
										</td>
										<td>
											{isCustom ? (
												<input
													type="number"
													value={pkg.package.maxWeight}
													onChange={(e) => handleUpdateCustomPackage(pkg.customIndex, "maxWeight", e.target.value)}
													step="0.01"
													className="weight-input"
												/>
											) : (
												pkg.package.maxWeight.toFixed(3)
											)}
										</td>
										<td>
											<button
												type="button"
												className="remove-package-button"
												onClick={() => handleRemovePackage(packageKey, isCustom)}
											>
												<DeleteIcon />
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{/* <button
				className="test-button"
				onClick={handleTestMockCall}
				disabled={loading}
			>
				Test Mock Call
			</button>*/}

			<button
				className="calculate-button"
				onClick={handleCalculate}
				disabled={loading || selectedProducts.length === 0}
			>
				<CalculateIcon />
				{loading ? "Calculating..." : "Calculate Landed Cost"}
			</button>

			{loading && <div className="loading">Calculating rates...</div>}

			{results && <ResultsDisplay results={results} requestData={requestData} />}
		</PageStyles>
	);
}
