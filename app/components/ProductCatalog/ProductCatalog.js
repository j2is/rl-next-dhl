"use client";

import React, { useState } from "react";
import ProductCatalogStyles from "./ProductCatalog.styled";
import { catalog } from "../../data/catalog";

export default function ProductCatalog({ onSelectionChange }) {
  const [selectedProducts, setSelectedProducts] = useState({});
  const [quantities, setQuantities] = useState({});

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

    const selectedItems = catalog
      .filter((item) => newSelected[item.sku])
      .map((item) => ({
        ...item,
        quantity: newQuantities[item.sku] || 1,
      }));

    onSelectionChange(selectedItems);
  };

  const handleQuantityChange = (sku, value) => {
    const qty = parseInt(value) || 1;
    const newQuantities = { ...quantities, [sku]: qty };
    setQuantities(newQuantities);

    const selectedItems = catalog
      .filter((item) => selectedProducts[item.sku])
      .map((item) => ({
        ...item,
        quantity: newQuantities[item.sku] || 1,
      }));

    onSelectionChange(selectedItems);
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
                {item.sku} | {item.customsDescription} | £{item.price.toFixed(2)}
              </span>
              <span className="product-dimensions">
                {item.height}x{item.width}x{item.length}cm | {item.weight}kg
              </span>
            </label>
            {selectedProducts[item.sku] && (
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
            )}
          </div>
        ))}
      </div>
    </ProductCatalogStyles>
  );
}
