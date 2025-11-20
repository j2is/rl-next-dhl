"use client";

import React, { useState, useEffect, useMemo } from "react";
import ProductCatalogStyles from "./ProductCatalog.styled";
import { catalog } from "../../data/catalog";
import { assignPackages } from "../../utils/packageAssignment";

export default function ProductCatalog({ onSelectionChange, currency = "GBP" }) {
	const [selectedProducts, setSelectedProducts] = useState({});
	const [quantities, setQuantities] = useState({});
	const [prices, setPrices] = useState({});

	// Initialize prices from catalog
	useEffect(() => {
		const initialPrices = {};
		catalog.forEach((item) => {
			initialPrices[item.sku] = item.price;
		});
		setPrices(initialPrices);
	}, []);

	// Calculate package assignments for selected products
	const packageAssignments = useMemo(() => {
		const selectedItems = catalog
			.filter((item) => selectedProducts[item.sku])
			.map((item) => ({
				...item,
				quantity: quantities[item.sku] || 1,
				price: prices[item.sku] !== undefined ? prices[item.sku] : item.price,
				currency: currency,
			}));

		if (selectedItems.length === 0) return [];
		return assignPackages(selectedItems);
	}, [selectedProducts, quantities, prices, currency]);

	// Create a map of SKU to assigned package for quick lookup
	const packageMap = useMemo(() => {
		const map = {};
		packageAssignments.forEach((assignment) => {
			if (!map[assignment.product.sku]) {
				map[assignment.product.sku] = assignment.package.name;
			}
		});
		return map;
	}, [packageAssignments]);

	const handleCheckboxChange = (sku) => {
		const newSelected = { ...selectedProducts };
		const newQuantities = { ...quantities };

		if (newSelected[sku]) {
			delete newSelected[sku];
			delete newQuantities[sku];
		} else {
			newSelected[sku] = true;
			newQuantities[sku] = 1;
		}

		setSelectedProducts(newSelected);
		setQuantities(newQuantities);

		updateSelectedItems(newSelected, newQuantities, prices);
	};

	const handleQuantityChange = (sku, value) => {
		const qty = parseInt(value) || 1;
		const newQuantities = { ...quantities, [sku]: qty };
		setQuantities(newQuantities);

		updateSelectedItems(selectedProducts, newQuantities, prices);
	};

	const handlePriceChange = (sku, value) => {
		const enteredPrice = parseFloat(value) || 0;

		// Convert entered price back to GBP for storage
		let priceInGBP = enteredPrice;
		if (currency === "EUR") {
			priceInGBP = enteredPrice / 1.15;
		} else if (currency === "USD") {
			priceInGBP = enteredPrice / 1.35;
		}

		const newPrices = { ...prices, [sku]: priceInGBP };
		setPrices(newPrices);

		updateSelectedItems(selectedProducts, quantities, newPrices);
	};

	const updateSelectedItems = (selected, qty, prc) => {
		const selectedItems = catalog
			.filter((item) => selected[item.sku])
			.map((item) => {
				// Always use stored prices from catalog for EUR and USD
				let finalPrice;
				if (currency === "EUR") {
					finalPrice = item.priceEUR || item.price;
				} else if (currency === "USD") {
					finalPrice = item.priceUSD || item.price;
				} else {
					// For GBP, use edited price if available, otherwise catalog price
					finalPrice = prc[item.sku] !== undefined ? prc[item.sku] : item.price;
				}

				return {
					...item,
					quantity: qty[item.sku] || 1,
					price: finalPrice,
					currency: currency,
				};
			});

		onSelectionChange(selectedItems);
	};

	// Update selected items when currency changes
	useEffect(() => {
		if (Object.keys(selectedProducts).length > 0) {
			updateSelectedItems(selectedProducts, quantities, prices);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currency]);

	const formatWeight = (weight) => {
		if (weight === 0) return "0 kg";
		if (weight < 0.01) {
			return `${weight.toFixed(4)} kg`;
		}
		if (weight < 0.1) {
			return `${weight.toFixed(3)} kg`;
		}
		return `${weight.toFixed(2)} kg`;
	};

	const formatPrice = (sku) => {
		const item = catalog.find((item) => item.sku === sku);
		if (!item) return "£0.00";

		let symbol = "£";
		let displayPrice;

		// Always use stored prices from catalog for EUR and USD
		if (currency === "EUR") {
			symbol = "€";
			displayPrice = item.priceEUR || item.price;
		} else if (currency === "USD") {
			symbol = "$";
			displayPrice = item.priceUSD || item.price;
		} else {
			// For GBP, use edited price if available, otherwise catalog price
			displayPrice = prices[sku] !== undefined ? prices[sku] : item.price;
		}

		return `${symbol}${displayPrice.toFixed(2)}`;
	};

	const getDisplayPrice = (sku) => {
		const item = catalog.find((item) => item.sku === sku);
		if (!item) return 0;

		// Always use stored prices from catalog for EUR and USD
		if (currency === "EUR") {
			return item.priceEUR || item.price;
		} else if (currency === "USD") {
			return item.priceUSD || item.price;
		} else {
			// For GBP, use edited price if available, otherwise catalog price
			return prices[sku] !== undefined ? prices[sku] : item.price;
		}
	};

	return (
		<ProductCatalogStyles>
			<h2>Select Products</h2>

			<div className="product-list">
				{catalog.map((item) => (
					<div key={item.sku} className="product-item">
						<input
							type="checkbox"
							id={item.sku}
							checked={!!selectedProducts[item.sku]}
							onChange={() => handleCheckboxChange(item.sku)}
						/>
						<label htmlFor={item.sku}>
							<span className="product-title">
								{item.title} - {item.color}
							</span>
							<span className="product-details">
								{item.sku} | {item.customsDescription} | HS Code: {item.hsCode} | {formatPrice(item.sku)}
							</span>
							<span className="product-dimensions">
								{item.height}x{item.width}x{item.length}cm | {formatWeight(item.weight)}
								{packageMap[item.sku] && (
									<span className="package-assignment"> → Box: {packageMap[item.sku]}</span>
								)}
							</span>
						</label>
						{selectedProducts[item.sku] && (
							<div className="product-controls">
								<div className="quantity-input">
									<label htmlFor={`qty-${item.sku}`}>Qty:</label>
									<input
										type="number"
										id={`qty-${item.sku}`}
										min="1"
										value={quantities[item.sku] || 1}
										onChange={(e) => handleQuantityChange(item.sku, e.target.value)}
									/>
								</div>
								<div className="price-input">
									<label htmlFor={`price-${item.sku}`}>Price:</label>
									<input
										type="number"
										id={`price-${item.sku}`}
										min="0"
										step="0.01"
										value={getDisplayPrice(item.sku).toFixed(2)}
										onChange={(e) => handlePriceChange(item.sku, e.target.value)}
									/>
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</ProductCatalogStyles>
	);
}
