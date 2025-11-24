"use client";

import React, { useState } from "react";
import ResultsDisplayStyles from "./ResultsDisplay.styled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DownloadIcon from "@mui/icons-material/Download";
import { getDHLLabel, formatPrice, groupBreakdown } from "../../utils/dhlLabelMapping";
import { exportLandedCostToCSV, downloadCSV } from "../../utils/exportCSV";

export default function ResultsDisplay({ results, requestData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!results) return null;

  // Handle CSV download
  const handleDownloadCSV = () => {
    const csvContent = exportLandedCostToCSV(results, requestData);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `landed-cost-breakdown-${timestamp}.csv`;
    downloadCSV(csvContent, filename);
  };

  // Helper function to render grouped breakdown
  const renderGroupedBreakdown = (breakdown) => {
    // Filter out zero-cost items
    const nonZeroItems = breakdown.filter(item => (item.price || 0) > 0);
    
    if (nonZeroItems.length === 0) return null;

    const grouped = groupBreakdown(nonZeroItems);

    return (
      <div className="breakdown">
        {/* Shipping Charges */}
        {grouped.shipping.length > 0 && (
          <div className="breakdown-section">
            <h4>Shipping Charges</h4>
            {grouped.shipping.map((item, i) => (
              <div key={`ship-${i}`} className="price-row">
                <span>{getDHLLabel(item.name || item.typeCode)}</span>
                <span>{formatPrice(item.price, item.priceCurrency)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Duties */}
        {grouped.duties.length > 0 && (
          <div className="breakdown-section">
            <h4>Customs Duties</h4>
            {grouped.duties.map((item, i) => (
              <div key={`duty-${i}`} className="price-row">
                <span>{getDHLLabel(item.name || item.typeCode)}</span>
                <span>{formatPrice(item.price, item.priceCurrency)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Taxes */}
        {grouped.taxes.length > 0 && (
          <div className="breakdown-section">
            <h4>Taxes</h4>
            {grouped.taxes.map((item, i) => (
              <div key={`tax-${i}`} className="price-row">
                <span>{getDHLLabel(item.name || item.typeCode)}</span>
                <span>{formatPrice(item.price, item.priceCurrency)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Fees */}
        {grouped.fees.length > 0 && (
          <div className="breakdown-section">
            <h4>Fees</h4>
            {grouped.fees.map((item, i) => (
              <div key={`fee-${i}`} className="price-row">
                <span>{getDHLLabel(item.name || item.typeCode)}</span>
                <span>{formatPrice(item.price, item.priceCurrency)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Additional Services & Surcharges */}
        {grouped.services.length > 0 && (
          <div className="breakdown-section">
            <h4>Services & Surcharges</h4>
            {grouped.services.map((item, i) => (
              <div key={`svc-${i}`} className="price-row">
                <span>{getDHLLabel(item.name || item.typeCode)}</span>
                <span>{formatPrice(item.price, item.priceCurrency)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Other Charges */}
        {grouped.other.length > 0 && (
          <div className="breakdown-section">
            <h4>Other Charges</h4>
            {grouped.other.map((item, i) => (
              <div key={`other-${i}`} className="price-row">
                <span>{getDHLLabel(item.name || item.typeCode)}</span>
                <span>{formatPrice(item.price, item.priceCurrency)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ResultsDisplayStyles>
      <div className="header-with-actions">
        <h2>Landed Cost Breakdown</h2>
        <button className="download-csv-button" onClick={handleDownloadCSV}>
          <DownloadIcon />
          <span>Download CSV</span>
        </button>
      </div>

      {results.products && results.products.length > 0 ? (
        <div className="results-content">
          {results.products.map((product, index) => (
            <div key={index} className="product-result">
              <h3>Service: {product.productName || "DHL Express"}</h3>

              {product.totalPrice && (
                <div className="price-summary">
                  <div className="price-row total">
                    <span>Total Landed Cost:</span>
                    <span className="total-amount">
                      {formatPrice(
                        product.totalPrice[0]?.price,
                        product.totalPrice[0]?.priceCurrency || "GBP"
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Detailed Price Breakdown */}
              {product.detailedPriceBreakdown && product.detailedPriceBreakdown.length > 0 && (
                <>
                  {product.detailedPriceBreakdown.map((priceBreakdown, i) => (
                    <div key={i}>
                      {priceBreakdown.breakdown && renderGroupedBreakdown(priceBreakdown.breakdown)}
                    </div>
                  ))}
                </>
              )}

              {/* Item-level Breakdown */}
              {product.items && product.items.length > 0 && (
                <div className="breakdown">
                  <h4>Item Cost Breakdown</h4>
                  {product.items.map((item, i) => {
                    const nonZeroBreakdown = item.breakdown?.filter(b => (b.price || 0) > 0) || [];
                    if (nonZeroBreakdown.length === 0) return null;
                    
                    return (
                      <div key={`item-${i}`} className="item-breakdown">
                        <div className="item-header">Item #{item.number}</div>
                        {nonZeroBreakdown.map((breakdownItem, j) => (
                          <div key={`item-${i}-${j}`} className="price-row indent">
                            <span>{getDHLLabel(breakdownItem.name || breakdownItem.typeCode)}</span>
                            <span>{formatPrice(breakdownItem.price, breakdownItem.priceCurrency)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>No rates available for this shipment.</p>
        </div>
      )}

      <div className="accordion">
        <button
          className="accordion-header"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>View Raw Data</span>
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </button>
        {isExpanded && (
          <div className="accordion-content">
            <h4>Request Data:</h4>
            <pre>{JSON.stringify(requestData, null, 2)}</pre>
            <h4>Response Data:</h4>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </div>
    </ResultsDisplayStyles>
  );
}
