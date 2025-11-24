"use client";

import styled from "styled-components";
import media from "../../lib/media";

const ResultsDisplayStyles = styled.section`
  padding: 30px;
  border: 1px solid #000;
  margin-bottom: 30px;

  ${media.minDevicePixelRatio2`
    border-width: 0.5px;
  `}

  .header-with-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
  }

  h2 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 0;
  }

  .download-csv-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: 1px solid #000;
    background: #fff;
    cursor: pointer;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s ease;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}

    ${media.hoverOnly`
      &:hover {
        background: #f5f5f5;
      }
    `}

    &:active {
      background: #e0e0e0;
    }

    svg {
      font-size: 18px;
    }
  }

  h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 15px;
  }

  h4 {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 10px;
    margin-top: 15px;
  }

  .product-result {
    margin-bottom: 30px;
    padding-bottom: 30px;
    border-bottom: 1px solid #000;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .product-result:last-child {
    border-bottom: none;
  }

  .price-summary {
    margin-bottom: 20px;
  }

  .price-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #000;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .price-row.total {
    font-weight: 700;
    font-size: 18px;
    padding: 12px 0;
    background: #f5f5f5;
    padding-left: 10px;
    padding-right: 10px;
    margin: 0 -10px;
  }

  .price-row.indent {
    padding-left: 20px;
    font-size: 13px;
  }

  .total-amount {
    font-size: 20px;
  }

  .breakdown {
    margin-top: 20px;
  }

  .breakdown-section {
    margin-bottom: 25px;
  }

  .breakdown-section h4 {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 10px;
    margin-top: 5px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .item-breakdown {
    margin-bottom: 15px;
    padding: 10px;
    background: #fafafa;
    border: 1px solid #000;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .item-header {
    font-weight: 700;
    margin-bottom: 10px;
    font-size: 13px;
  }

  .price-section {
    margin-bottom: 10px;
  }

  .no-results {
    padding: 20px;
    text-align: center;
  }

  .accordion {
    margin-top: 30px;
  }

  .accordion-header {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #000;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}

    ${media.hoverOnly`
      &:hover {
        background: #f5f5f5;
      }
    `}
  }

  .accordion-content {
    border: 1px solid #000;
    border-top: none;
    padding: 20px;
    background: #fafafa;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .accordion-content h4 {
    margin-top: 0;
  }

  pre {
    background: #fff;
    padding: 15px;
    border: 1px solid #000;
    overflow-x: auto;
    font-size: 12px;
    line-height: 1.4;
    margin-bottom: 15px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  pre:last-child {
    margin-bottom: 0;
  }
`;

export default ResultsDisplayStyles;
