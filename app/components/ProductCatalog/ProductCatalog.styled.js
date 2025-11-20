"use client";

import styled from "styled-components";
import media from "../../lib/media";

const ProductCatalogStyles = styled.section`
  padding: 30px;
  border: 1px solid #000;
  margin-bottom: 30px;

  ${media.minDevicePixelRatio2`
    border-width: 0.5px;
  `}

  h2 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .product-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .product-item {
    display: flex;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid #000;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .product-item:last-child {
    border-bottom: none;
  }

  input[type="checkbox"] {
    margin-right: 10px;
    margin-top: 4px;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  label {
    flex: 1;
    display: flex;
    flex-direction: column;
    cursor: pointer;
  }

  .product-title {
    font-weight: 700;
    margin-bottom: 4px;
  }

  .product-details {
    font-size: 13px;
    margin-bottom: 2px;
  }

  .product-dimensions {
    font-size: 12px;
    color: #666;
  }

  .product-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-left: 10px;
  }

  .quantity-input {
    display: flex;
    align-items: center;
  }

  .quantity-input label {
    margin-right: 5px;
    font-size: 13px;
  }

  .quantity-input input {
    width: 60px;
    padding: 5px;
    border: 1px solid #000;
    text-align: center;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .price-input {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .price-input label {
    font-size: 13px;
  }

  .price-input select {
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

  .price-input input {
    width: 80px;
    padding: 5px;
    border: 1px solid #000;
    text-align: center;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .package-assignment {
    color: #0066cc;
    font-weight: 600;
    margin-left: 8px;
  }
`;

export default ProductCatalogStyles;
